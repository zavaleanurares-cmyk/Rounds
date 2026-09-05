/**
 * Two numbers the app displayed and could not have known.
 *
 * `sharedNights` was hard-coded 0 on every person a pull returned, under a
 * comment saying it was derived locally. Nothing derived it: "Nights together"
 * on a friend's profile always read 0, Circle always showed "no nights
 * together" for everybody, and the crew board ranked you first every time
 * because your own row counted ALL your nights while everybody else's counted
 * zero. Beside it, `venues: 6` and `venues: 4 - i` — literals, going negative
 * on the fifth member — under a header reading "Nights out together, places
 * explored".
 *
 * They cannot be derived on the device, and that is the whole reason they were
 * fake: `session_participants` for other people's nights is not something this
 * client holds. It is one join on the server.
 *
 * What counts as a night together: both accounts in `session_participants` for
 * the same ended session. Not "was invited to", not "was in the same bar" —
 * the row that means somebody actually scanned in.
 */
create or replace function public.shared_night_counts()
returns table (user_id uuid, nights bigint)
language sql stable security definer set search_path = public
as $$
  select p2.user_id, count(distinct p1.session_id)
    from public.session_participants p1
    join public.session_participants p2 on p2.session_id = p1.session_id
    join public.sessions s on s.id = p1.session_id
   where p1.user_id = auth.uid()
     and p2.user_id <> auth.uid()
     and s.ended_at is not null
     and not public.is_blocked(auth.uid(), p2.user_id)
   group by p2.user_id;
$$;

/**
 * Which friends have been to a venue.
 *
 * The venue screen has a "WHO'S BEEN" card under the words "Friends only. Never
 * strangers." It rendered `people.filter(friend).slice(0, 5)` — your first five
 * friends, with no reference to the venue at all, so every bar in the app
 * showed the same five faces, including bars nobody had been to.
 *
 * Visibility is the session's own: a private night is nobody's business, and a
 * crew-visible one counts only for the crew. The answer is ids, and the caller
 * already has the names.
 */
create or replace function public.venue_visitors(p_venue uuid)
returns table (user_id uuid)
language sql stable security definer set search_path = public
as $$
  select distinct s.owner_id
    from public.sessions s
   where s.venue_id = p_venue
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
     )
   limit 12;
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
                                 from public.shared_night_counts() sn), '{}'::jsonb)
  );
$$;

revoke all on function public.shared_night_counts() from public;
revoke all on function public.venue_visitors(uuid) from public;
revoke all on function public.sync_pull(timestamptz) from public;
grant execute on function public.shared_night_counts() to authenticated;
grant execute on function public.venue_visitors(uuid) to authenticated;
grant execute on function public.sync_pull(timestamptz) to authenticated;
