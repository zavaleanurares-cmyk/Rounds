/**
 * The server speaks four languages too.
 *
 * The app was translated into English, French, Romanian and Spanish; the push
 * notifications it sends were not. "Your night is ready", "Are you home?" and
 * everything else composed inside a job or an RPC was hard-coded English, so a
 * Romanian user got a Romanian app that woke them in English — and the safety
 * notification, the one that has to be understood at 3am while somebody is
 * walking home, was the worst case of it.
 *
 * Two pieces: a locale on the profile, and a table of the handful of strings
 * the server composes. A table rather than a `case` expression because these
 * are strings a translator has to be able to find, and because adding a
 * language should be inserts rather than a rewrite of every job.
 */
alter table public.profiles
  add column if not exists locale text not null default 'en';

do $$ begin
  alter table public.profiles
    add constraint profiles_locale_supported check (locale in ('en', 'fr', 'ro', 'es'));
exception when duplicate_object then null; end $$;

create table if not exists public.strings (
  key    text not null,
  locale text not null check (locale in ('en', 'fr', 'ro', 'es')),
  value  text not null,
  primary key (key, locale)
);

alter table public.strings enable row level security;
-- Read-only to everybody signed in; written by migrations only. A client never
-- needs these (it has its own catalogue) but reading them is harmless and makes
-- them inspectable.
drop policy if exists "anybody may read strings" on public.strings;
create policy "anybody may read strings" on public.strings for select using (true);

/**
 * The string, in the user's language, falling back to English.
 *
 * Never returns null: a missing translation must degrade to English rather than
 * send somebody an empty notification.
 */
create or replace function public.say(p_user uuid, p_key text)
returns text
language sql stable security definer set search_path = public
as $$
  select coalesce(
    (select s.value from public.strings s
       join public.profiles p on p.id = p_user
      where s.key = p_key and s.locale = p.locale),
    (select s.value from public.strings s where s.key = p_key and s.locale = 'en'),
    p_key
  );
$$;

insert into public.strings (key, locale, value) values
  ('safety.check.title', 'en', 'Are you home?'),
  ('safety.check.title', 'fr', 'Vous êtes rentré ?'),
  ('safety.check.title', 'ro', 'Ai ajuns acasă?'),
  ('safety.check.title', 'es', '¿Has llegado a casa?'),

  ('safety.check.body', 'en', 'Tap to check in. If you don''t, we''ll let your trusted contacts know in 15 minutes.'),
  ('safety.check.body', 'fr', 'Touchez pour confirmer. Sans réponse, nous préviendrons vos contacts de confiance dans 15 minutes.'),
  ('safety.check.body', 'ro', 'Apasă pentru a confirma. Dacă nu, anunțăm contactele tale de încredere în 15 minute.'),
  ('safety.check.body', 'es', 'Toca para confirmar. Si no lo haces, avisaremos a tus contactos de confianza en 15 minutos.'),

  ('morning.title', 'en', 'Your night is ready'),
  ('morning.title', 'fr', 'Votre soirée est prête'),
  ('morning.title', 'ro', 'Seara ta este gata'),
  ('morning.title', 'es', 'Tu noche está lista'),

  ('morning.body', 'en', 'Where you went, what it cost, and the gaps worth filling.'),
  ('morning.body', 'fr', 'Où vous êtes allé, ce que ça a coûté, et ce qui manque.'),
  ('morning.body', 'ro', 'Unde ai fost, cât a costat și ce merită completat.'),
  ('morning.body', 'es', 'Dónde estuviste, cuánto costó y lo que falta por completar.'),

  ('night.started.title', 'en', 'A night just started'),
  ('night.started.title', 'fr', 'Une soirée vient de commencer'),
  ('night.started.title', 'ro', 'A început o seară'),
  ('night.started.title', 'es', 'Acaba de empezar una noche'),

  ('round.asked.title', 'en', 'Getting a round in'),
  ('round.asked.title', 'fr', 'Une tournée arrive'),
  ('round.asked.title', 'ro', 'Se face un rând'),
  ('round.asked.title', 'es', 'Van a pedir una ronda')
on conflict (key, locale) do update set value = excluded.value;

/* ------------------------------------------------------------------ jobs */

/**
 * The safety escalation, saying the same things in the user's language.
 *
 * Only the two composed strings change; the staging, the grace window and the
 * once-only stamping are exactly as they were, and safety_escalation.sql still
 * asserts all of it.
 */
create or replace function public.run_safety_escalation()
returns integer
language plpgsql security definer set search_path = public
as $$
declare chk record; queued integer := 0;
begin
  -- Stage one: tell the person themselves, and open the grace window.
  for chk in
    select c.* from public.safe_arrival_checks c
     where c.resolved_at is null
       and c.escalated_at is null
       and c.grace_until is null
       and c.deadline_at <= now()
  loop
    insert into public.outbound (user_id, channel, category, payload)
    values (chk.user_id, 'push', 'safety', jsonb_build_object(
      'title', public.say(chk.user_id, 'safety.check.title'),
      'body',  public.say(chk.user_id, 'safety.check.body'),
      'checkId', chk.id
    ));
    update public.safe_arrival_checks
       set grace_until = now() + interval '15 minutes'
     where id = chk.id;
    queued := queued + 1;
  end loop;

  -- Stage two: the contacts this check named, once, by SMS.
  for chk in
    select c.* from public.safe_arrival_checks c
     where c.resolved_at is null
       and c.escalated_at is null
       and c.grace_until is not null
       and c.grace_until <= now()
  loop
    insert into public.outbound (user_id, channel, category, payload, destination)
    select chk.user_id, 'sms', 'safety',
           jsonb_build_object(
             'body', chk.message,
             'lastVenue', (
               select v.name from public.sessions s
                 join public.venues v on v.id = s.venue_id
                where s.owner_id = chk.user_id
                order by s.started_at desc limit 1
             ),
             'checkId', chk.id),
           tc.phone
      from public.trusted_contacts tc
     where tc.user_id = chk.user_id
       and (chk.contact_ids is null or tc.id = any (chk.contact_ids));

    update public.safe_arrival_checks set escalated_at = now() where id = chk.id;
    queued := queued + (select count(*) from public.trusted_contacts tc
                         where tc.user_id = chk.user_id
                           and (chk.contact_ids is null or tc.id = any (chk.contact_ids)));
  end loop;

  return queued;
end;
$$;

create or replace function public.queue_morning_recaps()
returns integer
language plpgsql security definer set search_path = public
as $$
declare queued integer;
begin
  with due as (
    select s.owner_id, s.id as session_id
      from public.sessions s
     where s.ended_at is not null
       and s.ended_at > now() - interval '18 hours'
       and not exists (
         select 1 from public.outbound o
          where o.user_id = s.owner_id
            and o.category = 'morning'
            and o.payload->>'sessionId' = s.id::text
       )
  ),
  ins as (
    insert into public.outbound (user_id, channel, category, payload, send_after)
    select owner_id, 'push', 'morning',
           jsonb_build_object(
             'title', public.say(owner_id, 'morning.title'),
             'body',  public.say(owner_id, 'morning.body'),
             'href', '/morning/' || session_id,
             'sessionId', session_id),
           date_trunc('day', now()) + interval '9 hours 15 minutes'
      from due
     where public.may_notify(owner_id, 'morning')
    returning 1
  )
  select count(*) into queued from ins;
  return queued;
end;
$$;
