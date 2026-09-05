/**
 * The two notification switches that governed nothing.
 *
 * Settings offers six categories. `weekly` and `plans` were honoured by
 * `may_notify` and offered on screen, and no job in this schema ever sent
 * either one — a switch wired to a gate in front of a door nobody walks
 * through. These are the two doors.
 *
 * Both follow the shape the morning recap already established: compose through
 * `public.say` so the message arrives in the account's own language, dedupe on
 * something in the payload rather than on a timestamp so a re-run is a no-op,
 * and ask `may_notify` so the switch and the weekly cap both apply.
 */

insert into public.strings (key, locale, value) values
  ('weekly.title', 'en', 'Your week'),
  ('weekly.title', 'fr', 'Votre semaine'),
  ('weekly.title', 'ro', 'Săptămâna ta'),
  ('weekly.title', 'es', 'Tu semana'),

  ('weekly.body', 'en', 'Nights out, what they cost, and how the week compared.'),
  ('weekly.body', 'fr', 'Vos sorties, ce qu''elles ont coûté, et la semaine en comparaison.'),
  ('weekly.body', 'ro', 'Serile tale, cât au costat și cum arată săptămâna.'),
  ('weekly.body', 'es', 'Tus noches, lo que costaron y cómo fue la semana.'),

  ('plan.soon.title', 'en', 'Tonight''s plan'),
  ('plan.soon.title', 'fr', 'Le plan de ce soir'),
  ('plan.soon.title', 'ro', 'Planul de diseară'),
  ('plan.soon.title', 'es', 'El plan de esta noche')
on conflict (key, locale) do update set value = excluded.value;

/**
 * The weekly recap.
 *
 * Sent on Monday morning for the week that just ended, to anybody who recorded
 * a night in it — a recap of nothing is not worth a notification, and sending
 * one to a dormant account is the definition of the marketing this product does
 * not do.
 *
 * `payload->>'week'` is the ISO week it covers, which is what makes it
 * idempotent: run this job every hour all Monday and it sends once.
 */
create or replace function public.queue_weekly_recaps()
returns integer
language plpgsql security definer set search_path = public
as $$
declare queued integer; week_key text;
begin
  week_key := to_char(date_trunc('week', now() - interval '7 days'), 'IYYY-"W"IW');

  with active as (
    select distinct s.owner_id
      from public.sessions s
     where s.ended_at is not null
       and s.ended_at >= date_trunc('week', now() - interval '7 days')
       and s.ended_at <  date_trunc('week', now())
  ),
  ins as (
    insert into public.outbound (user_id, channel, category, payload)
    select a.owner_id, 'push', 'weekly',
           jsonb_build_object(
             'title', public.say(a.owner_id, 'weekly.title'),
             'body',  public.say(a.owner_id, 'weekly.body'),
             'href',  '/insights',
             'week',  week_key)
      from active a
     where public.may_notify(a.owner_id, 'weekly')
       and not exists (
         select 1 from public.outbound o
          where o.user_id = a.owner_id
            and o.category = 'weekly'
            and o.payload->>'week' = week_key
       )
    returning 1
  )
  select count(*) into queued from ins;
  return queued;
end;
$$;

/**
 * Plan reminders.
 *
 * Two hours before it starts, to the people who said yes — not to everybody
 * invited, because a reminder about something you declined is a nag rather than
 * a reminder. Dedupe on the plan id, so the job can run every fifteen minutes
 * and each person is told once.
 *
 * The window is deliberately wide on the late side (two hours before, down to
 * the start) so a job that fails or is late still delivers something useful
 * rather than skipping the plan entirely.
 */
create or replace function public.queue_plan_reminders()
returns integer
language plpgsql security definer set search_path = public
as $$
declare queued integer;
begin
  with due as (
    select p.id, p.title, p.starts_at, pi.user_id
      from public.plans p
      join public.plan_invitees pi on pi.plan_id = p.id
     where pi.rsvp = 'yes'
       and p.starts_at > now()
       and p.starts_at <= now() + interval '2 hours'
  ),
  ins as (
    insert into public.outbound (user_id, channel, category, payload)
    select d.user_id, 'push', 'plans',
           jsonb_build_object(
             'title', public.say(d.user_id, 'plan.soon.title'),
             'body',  d.title,
             'href',  '/plan/' || d.id,
             'planId', d.id)
      from due d
     where public.may_notify(d.user_id, 'plans')
       and not exists (
         select 1 from public.outbound o
          where o.user_id = d.user_id
            and o.category = 'plans'
            and o.payload->>'planId' = d.id::text
       )
    returning 1
  )
  select count(*) into queued from ins;
  return queued;
end;
$$;
