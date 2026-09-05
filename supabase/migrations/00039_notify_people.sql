/**
 * Two promises the app made and could not keep.
 *
 * 1. The start-night sheet has a switch, default ON, that says "{crew} will be
 *    notified". The value was read by the switch itself and by nothing else:
 *    `startSession` never took an invite argument, and no row was ever written
 *    for anybody. Nobody was ever notified.
 *
 * 2. The round builder says "Log mine · ask 3", the subtitle says "Logs yours
 *    now, asks the others", and the toast afterwards says "Negroni logged, 3
 *    asked". The selection was used for one thing: the number stored on your
 *    own log as `round_size`. The asking half of the feature did not exist.
 *
 * Both need to write a row into somebody ELSE'S inbox, and `notifications` has
 * no insert policy at all — correctly, because "anyone may write to anyone's
 * inbox" is a spam feature. So both go through definer functions that decide
 * who may be told what, and every scope in here is hand-written because RLS
 * does not apply inside them.
 *
 * The shared rules:
 *   · you must own the night;
 *   · a recipient must be a friend or a crew-mate, and never a block in either
 *     direction;
 *   · `may_notify` decides the push, so somebody who turned social
 *     notifications off gets the inbox row and no interruption;
 *   · both are idempotent per (session, recipient, kind), so a retry from the
 *     offline queue cannot notify anybody twice.
 */

/**
 * What makes a repeat harmless.
 *
 * Both functions are reached from the offline queue, which retries, so "at most
 * once" has to be a constraint rather than a check that races with itself.
 * `dedupe_key` is the caller's statement of what this notification IS —
 * 'night:<session>' or 'round:<session>:<n>' — and the partial unique index
 * turns a second attempt into a no-op. Rows without a key (an ordinary system
 * notice) are unaffected.
 */
alter table public.notifications
  add column if not exists dedupe_key text;

create unique index if not exists notifications_dedupe_idx
  on public.notifications (user_id, dedupe_key) where dedupe_key is not null;

/** Everyone who may hear about this account's night, by visibility. */
create or replace function public.night_audience(p_owner uuid, p_visibility public.visibility)
returns table (user_id uuid)
language sql stable security definer set search_path = public
as $$
  select distinct u.id
    from (
      -- friends, for a friends-visible or link-visible night
      select case when f.requester_id = p_owner then f.addressee_id else f.requester_id end as id
        from public.friendships f
       where f.status = 'accepted'
         and p_owner in (f.requester_id, f.addressee_id)
         and p_visibility in ('friends', 'link')
      union
      -- crew-mates, for a crew-visible night
      select m2.user_id
        from public.crew_members m1
        join public.crew_members m2 on m2.crew_id = m1.crew_id
       where m1.user_id = p_owner
         and m2.user_id <> p_owner
         and p_visibility = 'crew'
    ) u
   where not public.is_blocked(p_owner, u.id);
$$;

/**
 * Tells the people who can see this night that it started.
 *
 * One row each, at most once per session — the unique index below is what makes
 * a retry safe, rather than a check that races with itself.
 */
create or replace function public.notify_night_started(p_session uuid)
returns integer
language plpgsql security definer set search_path = public
as $$
declare s record; told integer := 0; who uuid; name text;
begin
  select * into s from public.sessions
   where id = p_session and owner_id = auth.uid();
  -- Private is refused twice: here, and by `night_audience`, which matches
  -- neither of its branches for a private night. The early return is the one
  -- that says so out loud.
  if s is null or s.visibility = 'private' then return 0; end if;

  select display_name into name from public.profiles where id = s.owner_id;

  for who in select user_id from public.night_audience(s.owner_id, s.visibility) loop
    insert into public.notifications (user_id, kind, title, body, href, dedupe_key)
    values (who, 'social',
            public.say(who, 'night.started.title'),
            coalesce(name, '') || coalesce(' · ' || s.title, ''),
            case when s.join_code is not null then '/live/' || s.join_code else '/(tabs)/circle' end,
            'night:' || s.id)
    on conflict (user_id, dedupe_key) where dedupe_key is not null do nothing;

    if public.may_notify(who, 'social') then
      insert into public.outbound (user_id, channel, category, payload)
      values (who, 'push', 'social', jsonb_build_object(
        'title', public.say(who, 'night.started.title'),
        'body',  coalesce(name, '') || coalesce(' · ' || s.title, ''),
        'sessionId', s.id));
    end if;
    told := told + 1;
  end loop;

  return told;
end;
$$;

/**
 * Asks the named people whether they want one too.
 *
 * `p_round` is the client-minted id of the log this round belongs to, which is
 * what makes a retry a no-op: the same round asks the same people once.
 *
 * The targets are named rather than derived: the round sheet is a set of people
 * somebody tapped, and quietly widening that to "everybody out tonight" would
 * be a different feature with worse consent. Anybody in the list who is not in
 * the audience for this night is skipped in silence — the caller learns how
 * many were asked, never who was refused.
 */
create or replace function public.ask_for_round(p_session uuid, p_round uuid, p_targets uuid[], p_drink text)
returns integer
language plpgsql security definer set search_path = public
as $$
declare s record; told integer := 0; who uuid; name text;
begin
  if p_targets is null or array_length(p_targets, 1) is null then return 0; end if;
  -- A round is a handful of people at a table, not a broadcast.
  if array_length(p_targets, 1) > 12 then return 0; end if;

  select * into s from public.sessions
   where id = p_session and owner_id = auth.uid();
  if s is null then return 0; end if;

  select display_name into name from public.profiles where id = s.owner_id;

  for who in
    select a.user_id from public.night_audience(s.owner_id, s.visibility) a
     where a.user_id = any (p_targets)
  loop
    insert into public.notifications (user_id, kind, title, body, href, dedupe_key)
    values (who, 'social',
            public.say(who, 'round.asked.title'),
            coalesce(name, '') || ' · ' || coalesce(p_drink, ''),
            case when s.join_code is not null then '/live/' || s.join_code else '/(tabs)/circle' end,
            'round:' || p_round)
    on conflict (user_id, dedupe_key) where dedupe_key is not null do nothing;

    if public.may_notify(who, 'social') then
      insert into public.outbound (user_id, channel, category, payload)
      values (who, 'push', 'social', jsonb_build_object(
        'title', public.say(who, 'round.asked.title'),
        'body',  coalesce(name, '') || ' · ' || coalesce(p_drink, ''),
        'sessionId', s.id));
    end if;
    told := told + 1;
  end loop;

  return told;
end;
$$;

revoke all on function public.notify_night_started(uuid) from public;
revoke all on function public.ask_for_round(uuid, uuid, uuid[], text) from public;
grant execute on function public.notify_night_started(uuid) to authenticated;
grant execute on function public.ask_for_round(uuid, uuid, uuid[], text) to authenticated;
