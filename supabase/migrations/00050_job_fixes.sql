/**
 * Four things the first version of the jobs got wrong.
 *
 * 1. THE RECAP MISSED PEOPLE. It derived its recipients from `sessions` with an
 *    `ended_at` in the week — but `consumption_logs.session_id` is nullable and
 *    logging outside a night is a normal, supported path (nicotine logging
 *    never creates a session at all). Somebody who logged a drink every day of
 *    the week and never pressed "start a night" got nothing, from a job whose
 *    own comment said it went "to anybody who recorded a night". Logs are the
 *    truth about whether a week happened; sessions are one way of framing it.
 *
 * 2. THE REMINDER WINDOW WAS BACKWARDS FROM ITS OWN COMMENT, which said it was
 *    "wide on the late side ... so a job that fails or is late still delivers
 *    something useful". It was `starts_at > now()`, so a scheduler outage
 *    spanning the two hours dropped the reminder entirely. A plan that started
 *    twenty minutes ago is still worth a nudge; one that started three hours
 *    ago is not.
 *
 * 3. NEITHER DEDUPE PREDICATE HAD AN INDEX. Both scan `outbound` on
 *    `(user_id, category)` plus a jsonb field, and the only index on the table
 *    is partial on unsent rows. `may_notify` has the same shape and runs on
 *    every notification the product sends. Sent rows are never deleted, so this
 *    is a sequential scan over a table that grows forever.
 *
 * 4. THE TWO NEW FUNCTIONS WERE EXECUTABLE BY ANY SIGNED-IN CLIENT. They are
 *    `security definer` and insert rows on other people's behalf. Bounded by
 *    their dedupe keys, but there is no reason for a device to call them.
 */

/* ------------------------------------------------------------------ 3 · index */

create index if not exists outbound_user_category_idx
  on public.outbound (user_id, category, sent_at);

/**
 * And a retention job, because an index on a table nobody prunes only delays
 * the problem. Ninety days is longer than any dedupe window here — the widest
 * is the weekly recap's ISO week — so pruning cannot resurrect a notification
 * somebody already had.
 */
create or replace function public.purge_sent_outbound()
returns integer
language plpgsql security definer set search_path = public
as $$
declare removed integer;
begin
  with gone as (
    delete from public.outbound
     where sent_at is not null
       and sent_at < now() - interval '90 days'
    returning 1
  )
  select count(*) into removed from gone;
  return removed;
end;
$$;

/* ------------------------------------------------------------- 1 · the recap */

create or replace function public.queue_weekly_recaps()
returns integer
language plpgsql security definer set search_path = public
as $$
declare queued integer; week_key text; week_start timestamptz; week_end timestamptz;
begin
  week_start := date_trunc('week', now() - interval '7 days');
  week_end   := date_trunc('week', now());
  week_key   := to_char(week_start, 'IYYY-"W"IW');

  with active as (
    -- Anybody who recorded anything at all in the week. A night is one way to
    -- have a week; it is not the only way, and `session_id` is nullable.
    select distinct l.user_id
      from public.consumption_logs l
     where l.deleted_at is null
       and l.consumed_at >= week_start
       and l.consumed_at <  week_end
  ),
  ins as (
    insert into public.outbound (user_id, channel, category, payload)
    select a.user_id, 'push', 'weekly',
           jsonb_build_object(
             'title', public.say(a.user_id, 'weekly.title'),
             'body',  public.say(a.user_id, 'weekly.body'),
             'href',  '/insights',
             'week',  week_key)
      from active a
     where public.may_notify(a.user_id, 'weekly')
       and not exists (
         select 1 from public.outbound o
          where o.user_id = a.user_id
            and o.category = 'weekly'
            and o.payload->>'week' = week_key
       )
    returning 1
  )
  select count(*) into queued from ins;
  return queued;
end;
$$;

/* --------------------------------------------------------- 2 · the reminders */

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
       -- Two hours ahead, and up to an hour late. A plan that started twenty
       -- minutes ago is still worth a nudge; one that started this morning is
       -- not, and an outage should cost lateness rather than silence.
       and p.starts_at >  now() - interval '1 hour'
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

/* ------------------------------------------------------------- 4 · the grants */

/**
 * No device calls any of these. They are the scheduler's, and they write rows
 * into other people's queues; `pg_cron` runs as the table owner, which is not
 * affected by these revokes.
 *
 * The three older jobs are revoked here too. They shipped un-revoked and the
 * two new ones inherited the pattern rather than fixing it, which is how a
 * convention quietly becomes the wrong default.
 */
revoke all on function public.queue_weekly_recaps() from public, authenticated, anon;
revoke all on function public.queue_plan_reminders() from public, authenticated, anon;
revoke all on function public.queue_morning_recaps() from public, authenticated, anon;
revoke all on function public.run_safety_escalation() from public, authenticated, anon;
revoke all on function public.purge_expired_locations() from public, authenticated, anon;
revoke all on function public.purge_deleted_accounts() from public, authenticated, anon;
revoke all on function public.purge_sent_outbound() from public, authenticated, anon;
