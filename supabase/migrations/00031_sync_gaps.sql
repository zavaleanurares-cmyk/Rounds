-- 00031 · Three gaps the client found when it started actually syncing.
--
-- Each of these is a place where the local model held something the schema had
-- nowhere to put, which is invisible until the two are connected.

/* ------------------------------------------------------- 1 · who to tell
 *
 * A safe-arrival check records WHICH trusted contacts to escalate to. The user
 * picks them on the arm screen — two of three, say. The server had no column
 * for that, so `run_safety_escalation` fanned out to every contact on the
 * account.
 *
 * That is not a rounding error. Somebody who deliberately left one person off
 * the list would have had them messaged anyway, at 3am, about where they were
 * last seen. Consent given on one screen has to survive to the thing that acts
 * on it.
 *
 * Null means "everyone", which is what a check armed by an older client means
 * and is the safe reading of an absent choice.
 */
alter table public.safe_arrival_checks
  add column if not exists contact_ids uuid[];

comment on column public.safe_arrival_checks.contact_ids is
  'Which trusted contacts this check escalates to. Null means all of them — the reading an older client intended.';

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

  -- Stage two: the grace period elapsed with no answer. Now the contacts —
  -- and ONLY the ones this check named.
  for chk in
    select * from public.safe_arrival_checks
     where resolved_at is null
       and escalated_at is null
       and grace_until is not null
       and grace_until <= now()
  loop
    for contact in
      select * from public.trusted_contacts
       where user_id = chk.user_id
         and (chk.contact_ids is null or id = any(chk.contact_ids))
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

/* ------------------------------------------- 2 · a plan's venue shortlist
 *
 * `plan_venue_votes` was the only plan/venue table, so a candidate with no
 * votes yet could not exist on the server. A plan created with three places to
 * choose between lost all three the moment it synced, and the vote screen came
 * back empty — the shortlist only reappeared once somebody had already voted
 * for something, which is not how choosing works.
 */
create table if not exists public.plan_venues (
  plan_id    uuid not null references public.plans(id) on delete cascade,
  venue_id   uuid not null references public.venues(id) on delete cascade,
  added_by   uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (plan_id, venue_id)
);

alter table public.plan_venues enable row level security;

create policy "see the shortlist for a plan you are in" on public.plan_venues for select
  using (exists (select 1 from public.plan_invitees pi
                  where pi.plan_id = plan_venues.plan_id and pi.user_id = auth.uid()));

create policy "add to the shortlist for a plan you are in" on public.plan_venues for insert
  with check (exists (select 1 from public.plan_invitees pi
                       where pi.plan_id = plan_venues.plan_id and pi.user_id = auth.uid()));

-- Only whoever proposed a place may withdraw it, so one person cannot quietly
-- delete everybody else's suggestions.
create policy "withdraw a place you proposed" on public.plan_venues for delete
  using (added_by = auth.uid());

/* --------------------------------------------------- 3 · the price band
 *
 * `pull()` reads `price_band` back; nothing could ever write it, so a place
 * added by hand lost its band on the first sync. The column existed; the write
 * path did not.
 */
-- (no schema change needed — the client writer now sends it)

/* The shortlist has to come back down, or the client rebuilds a plan without
   the places it was created to choose between. */
create or replace function public.sync_pull(since timestamptz default 'epoch')
returns jsonb
language sql stable security definer set search_path = public
as $$
  select public.sync_pull_base(since) || jsonb_build_object(
    'plan_venues', coalesce((select jsonb_agg(to_jsonb(pv)) from public.plan_venues pv
                              where pv.plan_id in (select plan_id from public.plan_invitees
                                                    where user_id = auth.uid())), '[]'::jsonb)
  );
$$;

revoke all on function public.sync_pull(timestamptz) from public;
grant execute on function public.sync_pull(timestamptz) to authenticated;
