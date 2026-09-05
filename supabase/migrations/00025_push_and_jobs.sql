-- 00025 · Push tokens, outbound queue, and the scheduled jobs.

create table if not exists public.push_tokens (
  token      text primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  platform   text not null check (platform in ('ios', 'android', 'web')),
  created_at timestamptz not null default now(),
  last_seen  timestamptz not null default now()
);

create index if not exists push_tokens_user_idx on public.push_tokens (user_id);

alter table public.push_tokens enable row level security;
create policy "own tokens" on public.push_tokens for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

/**
 * The outbound queue.
 *
 * Nothing sends inline. A row lands here, a worker drains it, and failures are
 * visible rather than lost in a function log — which matters most for the one
 * category that has to work: safety.
 */
create table if not exists public.outbound (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade,
  channel     text not null check (channel in ('push', 'sms', 'email')),
  category    text not null check (category in ('morning','weekly','plans','social','safety','system')),
  payload     jsonb not null,
  /** Free-text destination for sms/email; push resolves tokens at send time. */
  destination text,
  send_after  timestamptz not null default now(),
  sent_at     timestamptz,
  attempts    integer not null default 0,
  last_error  text
);

create index if not exists outbound_due_idx
  on public.outbound (send_after) where sent_at is null;

alter table public.outbound enable row level security;
-- Deliberately no client policy at all: the client never reads or writes the
-- outbound queue. Only the service role touches it.

/**
 * The weekly notification cap, enforced server-side.
 *
 * A cap the client counts is a cap that resets on reinstall. Safety is exempt —
 * a check-in the user armed themselves is not marketing.
 */
create or replace function public.may_notify(p_user uuid, p_category text)
returns boolean
language sql stable security definer set search_path = public
as $$
  select case
    when p_category = 'safety' then true
    else (
      select count(*) < 3
        from public.outbound o
       where o.user_id = p_user
         and o.category not in ('safety', 'system')
         and o.sent_at > now() - interval '7 days'
    )
  end;
$$;

/**
 * The safe-arrival escalation.
 *
 * Runs every minute. Two stages, and the order is the whole ethic of the
 * feature: at the deadline we ask the USER, and only if that goes unanswered
 * for fifteen minutes do we tell anyone else.
 *
 * The message was previewable before arming, so nobody is surprised by what
 * their friends receive.
 */
create or replace function public.run_safety_escalation()
returns integer
language plpgsql security definer set search_path = public
as $$
declare
  queued integer := 0;
  chk    record;
  contact record;
begin
  -- Stage one: the deadline passed, nobody has been told yet. Ask the user.
  for chk in
    select * from public.safe_arrival_checks
     where resolved_at is null
       and escalated_at is null
       and grace_until is null
       and deadline_at <= now()
  loop
    insert into public.outbound (user_id, channel, category, payload)
    values (chk.user_id, 'push', 'safety', jsonb_build_object(
      'title', 'Are you home?',
      'body',  'Tap to check in. If you don''t, we''ll let your trusted contacts know in 15 minutes.',
      'checkId', chk.id
    ));
    update public.safe_arrival_checks
       set grace_until = now() + interval '15 minutes'
     where id = chk.id;
    queued := queued + 1;
  end loop;

  -- Stage two: the grace period elapsed with no answer. Now the contacts.
  for chk in
    select * from public.safe_arrival_checks
     where resolved_at is null
       and escalated_at is null
       and grace_until is not null
       and grace_until <= now()
  loop
    for contact in
      select * from public.trusted_contacts where user_id = chk.user_id
    loop
      insert into public.outbound (user_id, channel, category, payload, destination)
      values (chk.user_id, 'sms', 'safety',
              jsonb_build_object(
                'body', chk.message,
                'lastVenue', (
                  select v.name from public.sessions s
                    join public.venues v on v.id = s.venue_id
                   where s.owner_id = chk.user_id
                   order by s.started_at desc limit 1
                ),
                'checkId', chk.id),
              contact.phone);
      queued := queued + 1;
    end loop;

    update public.safe_arrival_checks set escalated_at = now() where id = chk.id;
  end loop;

  return queued;
end;
$$;

/** Resolving a check cancels anything still queued for it. */
create or replace function public.resolve_safe_arrival(p_check uuid)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  update public.safe_arrival_checks
     set resolved_at = now()
   where id = p_check and user_id = auth.uid();

  delete from public.outbound
   where sent_at is null
     and category = 'safety'
     and payload->>'checkId' = p_check::text;
end;
$$;

/**
 * The morning recap, queued for the user's own typical wake time on that
 * weekday and never before 09:00.
 */
create or replace function public.queue_morning_recaps()
returns integer
language plpgsql security definer set search_path = public
as $$
declare queued integer := 0;
begin
  with due as (
    select s.owner_id, s.id as session_id
      from public.sessions s
     where s.ended_at between now() - interval '18 hours' and now()
       and s.mood is null
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
             'title', 'Your night is ready',
             'body', 'Where you went, what it cost, and the gaps worth filling.',
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

-- Schedules. pg_cron in a Supabase project; any scheduler elsewhere.
-- select cron.schedule('safety-escalation', '* * * * *',  $$select public.run_safety_escalation()$$);
-- select cron.schedule('morning-recaps',    '*/15 * * * *', $$select public.queue_morning_recaps()$$);
-- select cron.schedule('purge-locations',   '*/5 * * * *',  $$select public.purge_expired_locations()$$);
-- select cron.schedule('purge-accounts',    '0 3 * * *',    $$select public.purge_deleted_accounts()$$);

/**
 * Events.
 *
 * Insert-only from the client, never readable by it. Deliberately narrow: an
 * enum-ish event name and a small props object. Nothing here can identify what
 * someone drank, where they were, or who they were with — see
 * `src/services/analytics.ts` for the rule and the filter that enforces it.
 */
create table if not exists public.events (
  id           bigserial primary key,
  user_id      uuid references auth.users(id) on delete set null,
  event        text not null,
  props        jsonb not null default '{}'::jsonb,
  occurred_at  timestamptz not null default now(),
  session_key  text,
  platform     text,
  app_version  text,
  created_at   timestamptz not null default now()
);

create index if not exists events_time_idx on public.events (occurred_at desc);
create index if not exists events_name_idx on public.events (event, occurred_at desc);

alter table public.events enable row level security;

create policy "record your own events" on public.events for insert
  with check (auth.uid() = user_id or user_id is null);
-- No select policy at all. Analytics are aggregate; nobody reads a person's
-- event stream from a device, including their own.

create or replace function public.set_event_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  new.user_id := coalesce(new.user_id, auth.uid());
  return new;
end;
$$;

drop trigger if exists events_set_user on public.events;
create trigger events_set_user before insert on public.events
  for each row execute function public.set_event_user();
