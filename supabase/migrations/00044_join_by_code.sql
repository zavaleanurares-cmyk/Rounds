/**
 * Joining somebody else's night.
 *
 * The QR code is the product's fastest path — the brief's own number is "in the
 * room in under twenty seconds" — and it could not work at all.
 *
 * `sync_pull_base` returns sessions `where owner_id = auth.uid()`, correctly:
 * a client has no business holding a copy of every night it might ever see. So
 * `sessions.find(s => s.joinCode === code)` on the join screen and in the live
 * room searched a list that can only ever contain the user's OWN nights. Every
 * scan of a friend's code answered "we don't know that code", and every
 * `/live/<code>` link — the href `notify_night_started` writes into an inbox,
 * the destination of `invite_preview`, the `rounds://night/` deep link on the
 * invite page — rendered "this night is over".
 *
 * RLS already allowed it: "see sessions you may view" and "join a night" have
 * been in 00006 since the beginning. Nothing asked.
 *
 * This is the ask. It resolves a code to a night AND puts the caller in it, in
 * one round trip, because those two are the same action from the user's side —
 * a scan — and a resolve that left them un-joined would be a second failure
 * mode nobody would notice until the host wondered where they were.
 *
 * What it refuses: a private night (no code exists for one, but the check is
 * explicit rather than implied), a night that has ended, and anybody either
 * party has blocked. A `friends`-visible night refuses a stranger; a `link`
 * night is exactly the case where the code IS the invitation, and takes anyone
 * who has it.
 */
create or replace function public.join_by_code(p_code text)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare s record; allowed boolean;
begin
  select * into s from public.sessions
   where join_code = upper(trim(p_code))
     and visibility <> 'private';

  if s is null then return jsonb_build_object('ok', false, 'reason', 'unknown'); end if;
  if s.ended_at is not null then return jsonb_build_object('ok', false, 'reason', 'ended'); end if;
  if public.is_blocked(auth.uid(), s.owner_id) then
    -- The same answer as a code that does not exist. "You are blocked" is a
    -- fact about somebody else's decision and not this caller's to learn.
    return jsonb_build_object('ok', false, 'reason', 'unknown');
  end if;

  allowed := case s.visibility
    when 'link' then true
    when 'friends' then exists (
      select 1 from public.friendships f
       where f.status = 'accepted'
         and s.owner_id in (f.requester_id, f.addressee_id)
         and auth.uid() in (f.requester_id, f.addressee_id)
    )
    when 'crew' then public.share_a_crew(auth.uid(), s.owner_id)
    else false
  end;

  -- The host is always allowed into their own night, whatever its visibility.
  if s.owner_id = auth.uid() then allowed := true; end if;
  if not allowed then return jsonb_build_object('ok', false, 'reason', 'not_invited'); end if;

  insert into public.session_participants (session_id, user_id)
       values (s.id, auth.uid())
  on conflict (session_id, user_id) do nothing;

  return jsonb_build_object(
    'ok', true,
    'session', jsonb_build_object(
      'id', s.id,
      'owner_id', s.owner_id,
      'title', s.title,
      'visibility', s.visibility,
      'join_code', s.join_code,
      'venue_id', s.venue_id,
      'started_at', s.started_at,
      'accent_index', s.accent_index
    )
  );
end;
$$;

/**
 * And the nights this account is IN, not only the ones it owns.
 *
 * Once somebody can join, the live room has to keep working on the next launch,
 * and the roster has to be the people in THIS night rather than every friend
 * who happens to be out. Both come from `session_participants`, which
 * `sync_pull` did not carry at all.
 *
 * Scoped to open nights from the last twelve hours: this is for the room that
 * is happening, and a joiner has no business holding a history of other
 * people's evenings.
 */
create or replace function public.joined_sessions()
returns setof public.sessions
language sql stable security definer set search_path = public
as $$
  select s.* from public.sessions s
    join public.session_participants sp on sp.session_id = s.id
   where sp.user_id = auth.uid()
     and s.owner_id <> auth.uid()
     and s.ended_at is null
     and s.started_at > now() - interval '12 hours'
     and not public.is_blocked(auth.uid(), s.owner_id);
$$;

create or replace function public.sync_pull(since timestamptz default 'epoch')
returns jsonb
language sql stable security definer set search_path = public
as $$
  select public.sync_pull_base(since) || jsonb_build_object(
    'plan_venues', coalesce((select jsonb_agg(to_jsonb(pv)) from public.plan_venues pv
                              where pv.plan_id in (select plan_id from public.plan_invitees
                                                    where user_id = auth.uid())), '[]'::jsonb),
    'live_friends', coalesce((select jsonb_agg(lf.user_id) from public.live_friends() lf), '[]'::jsonb),
    'shared_nights', coalesce((select jsonb_object_agg(sn.user_id, sn.nights)
                                 from public.shared_night_counts() sn), '{}'::jsonb),
    'joined_sessions', coalesce((select jsonb_agg(to_jsonb(js)) from public.joined_sessions() js), '[]'::jsonb),
    /**
     * Who is in the night this account is currently in.
     *
     * The roster and the "LIVE WITH" card were rendering `p.liveNow`, which
     * `live_friends` defines as "has a night open that I may see" — not "is in
     * this one". A friend drinking at a different bar was labelled "Here" in
     * your room. This is the answer to the question those two surfaces are
     * actually asking.
     */
    'here_now', coalesce((select jsonb_agg(distinct sp.user_id)
                            from public.session_participants sp
                           where sp.session_id in (
                                   select s.id from public.sessions s
                                    where s.ended_at is null
                                      and (s.owner_id = auth.uid()
                                           or exists (select 1 from public.session_participants m
                                                       where m.session_id = s.id and m.user_id = auth.uid()))
                                 )
                             and sp.user_id <> auth.uid()
                             and not public.is_blocked(auth.uid(), sp.user_id)), '[]'::jsonb)
  );
$$;

revoke all on function public.join_by_code(text) from public;
revoke all on function public.joined_sessions() from public;
revoke all on function public.sync_pull(timestamptz) from public;
grant execute on function public.join_by_code(text) to authenticated;
grant execute on function public.joined_sessions() to authenticated;
grant execute on function public.sync_pull(timestamptz) to authenticated;
