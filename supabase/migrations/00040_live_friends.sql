/**
 * Who is out right now.
 *
 * `liveNow` was hard-coded `false` on every person a pull returned, with the
 * comment "Realtime decides this, never a pull." Realtime never did:
 * `subscribeToSession` takes an `onParticipant` handler and no caller has ever
 * passed one, so the only `true` values in the whole app were in the demo seed.
 *
 * Six surfaces were therefore permanently empty against a real backend — the
 * "Out right now" card on Circle, the friends layer on the map, the live-with
 * card on Tonight, the roster in the room, the widget's friends count, and the
 * pre-selection in the round builder. All of them looked designed and none of
 * them could ever have shown anybody.
 *
 * A pull is the right place for it after all. Presence here means "has a night
 * open that I am allowed to see", which is a fact about a row rather than about
 * a socket: it survives a backgrounded app, a dead channel and a phone that has
 * been in a pocket since midnight, and it is the same answer for the widget as
 * for the screen. It refreshes on foreground and reconnect, which is when
 * somebody actually looks.
 *
 * Scoped by hand, because this runs as definer:
 *   · the night is open (`ended_at is null`) and started within 12 hours, so a
 *     night somebody forgot to end does not leave them "out" for a week;
 *   · they are a friend, or the night is crew-visible and we share a crew;
 *   · never a private night, and never a block in either direction.
 */
create or replace function public.live_friends()
returns table (user_id uuid)
language sql stable security definer set search_path = public
as $$
  select distinct s.owner_id
    from public.sessions s
   where s.ended_at is null
     and s.started_at > now() - interval '12 hours'
     and s.owner_id <> auth.uid()
     and s.visibility <> 'private'
     and not public.is_blocked(auth.uid(), s.owner_id)
     and (
       exists (
         select 1 from public.friendships f
          where f.status = 'accepted'
            and s.owner_id in (f.requester_id, f.addressee_id)
            and auth.uid() in (f.requester_id, f.addressee_id)
       )
       or (s.visibility = 'crew' and public.share_a_crew(auth.uid(), s.owner_id))
     );
$$;

create or replace function public.sync_pull(since timestamptz default 'epoch')
returns jsonb
language sql stable security definer set search_path = public
as $$
  select public.sync_pull_base(since) || jsonb_build_object(
    'plan_venues', coalesce((select jsonb_agg(to_jsonb(pv)) from public.plan_venues pv
                              where pv.plan_id in (select plan_id from public.plan_invitees
                                                    where user_id = auth.uid())), '[]'::jsonb),
    -- Ids only. Not the session, not the venue, not what they are drinking:
    -- the question every one of those six surfaces asks is "are they out",
    -- and nothing else needs to cross.
    'live_friends', coalesce((select jsonb_agg(lf.user_id) from public.live_friends() lf), '[]'::jsonb)
  );
$$;

revoke all on function public.live_friends() from public;
revoke all on function public.sync_pull(timestamptz) from public;
grant execute on function public.live_friends() to authenticated;
grant execute on function public.sync_pull(timestamptz) to authenticated;
