-- 00030 · The whole account in one round trip.
--
-- Until now `sync_pull` returned four things — profile, logs, sessions, goals —
-- and the client only ever wrote three tables. Everything social lived in
-- AsyncStorage on one device: your friends, your crews, your plans, your
-- trusted contacts and, worst of all, your armed safe-arrival check. The
-- server-side escalation ran every minute against an empty table.
--
-- This is the read half of the fix. It returns everything a device needs to
-- rebuild the account, and nothing it does not.
--
-- SECURITY. This function is `security definer`, so RLS does not apply inside
-- it and every scope below is written by hand. That is a deliberate trade: one
-- round trip from a phone that has just come out of a basement beats fifteen,
-- and the alternative — fifteen RLS-checked selects — is fifteen chances to
-- fail halfway and leave a device half-synced. The cost is that this file is
-- the one place where a missing `where` clause leaks somebody else's data, so
-- every branch is scoped explicitly and `rls_matrix.sql` asserts the six roles
-- against the RESULT of this function, not just against the tables.
--
-- The rules it enforces, restated so they are checkable:
--   · You get your own rows. Always.
--   · You get another person's PROFILE only if you are connected to them —
--     an accepted friendship, a shared crew, or a shared plan — and never if
--     either of you has blocked the other.
--   · You never get another person's logs, goals, contacts or checks. Not for
--     a friend, not for a crew-mate, not for someone in your own plan.
--   · A blocked user appears nowhere in the payload, in any shape.

create or replace function public.sync_pull_base(since timestamptz default 'epoch')
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
with me as (
  select auth.uid() as id
),
/* Everyone this account is connected to, and may therefore see a name for. */
connected as (
  select distinct other_id from (
    -- accepted friendships, either direction
    select case when f.requester_id = (select id from me) then f.addressee_id
                else f.requester_id end as other_id
      from public.friendships f
     where f.status = 'accepted'
       and (select id from me) in (f.requester_id, f.addressee_id)
    union
    -- people in a crew with me
    select cm.user_id
      from public.crew_members cm
     where cm.crew_id in (select crew_id from public.crew_members
                           where user_id = (select id from me))
    union
    -- people invited to a plan I am in
    select pi.user_id
      from public.plan_invitees pi
     where pi.plan_id in (select plan_id from public.plan_invitees
                           where user_id = (select id from me))
  ) x
  where other_id is not null
    and other_id <> (select id from me)
    -- A block hides a person completely, in both directions.
    and not public.is_blocked((select id from me), other_id)
)
select jsonb_build_object(
  'profile', (select to_jsonb(p) from public.profiles p where p.id = (select id from me)),

  'private', (select to_jsonb(pp) from public.profiles_private pp where pp.id = (select id from me)),

  /* Only mine. `since` keeps a long history from being re-sent every launch. */
  'logs', coalesce((select jsonb_agg(to_jsonb(l)) from public.consumption_logs l
                     where l.user_id = (select id from me) and l.created_at > since), '[]'::jsonb),

  'sessions', coalesce((select jsonb_agg(to_jsonb(s)) from public.sessions s
                         where s.owner_id = (select id from me)), '[]'::jsonb),

  'goals', coalesce((select jsonb_agg(to_jsonb(g)) from public.goals g
                      where g.user_id = (select id from me)), '[]'::jsonb),

  'achievements', coalesce((select jsonb_agg(to_jsonb(a)) from public.achievements a
                             where a.user_id = (select id from me)), '[]'::jsonb),

  /* Safety. Mine alone, and the reason this migration exists. */
  'trusted_contacts', coalesce((select jsonb_agg(to_jsonb(tc)) from public.trusted_contacts tc
                                 where tc.user_id = (select id from me)), '[]'::jsonb),

  'safe_arrival_checks', coalesce((select jsonb_agg(to_jsonb(sac)) from public.safe_arrival_checks sac
                                    where sac.user_id = (select id from me)
                                      and sac.resolved_at is null), '[]'::jsonb),

  /* Social. Rows I am party to. */
  'friendships', coalesce((select jsonb_agg(to_jsonb(f)) from public.friendships f
                            where (select id from me) in (f.requester_id, f.addressee_id)
                              and not public.is_blocked(
                                    (select id from me),
                                    case when f.requester_id = (select id from me)
                                         then f.addressee_id else f.requester_id end)),
                          '[]'::jsonb),

  'blocks', coalesce((select jsonb_agg(to_jsonb(b)) from public.blocks b
                       where b.blocker_id = (select id from me)), '[]'::jsonb),

  'crews', coalesce((select jsonb_agg(to_jsonb(c)) from public.crews c
                      where c.id in (select crew_id from public.crew_members
                                      where user_id = (select id from me))), '[]'::jsonb),

  'crew_members', coalesce((select jsonb_agg(to_jsonb(cm)) from public.crew_members cm
                             where cm.crew_id in (select crew_id from public.crew_members
                                                   where user_id = (select id from me))
                               and not public.is_blocked((select id from me), cm.user_id)),
                           '[]'::jsonb),

  'plans', coalesce((select jsonb_agg(to_jsonb(p)) from public.plans p
                      where p.id in (select plan_id from public.plan_invitees
                                      where user_id = (select id from me))
                         or p.created_by = (select id from me)), '[]'::jsonb),

  'plan_invitees', coalesce((select jsonb_agg(to_jsonb(pi)) from public.plan_invitees pi
                              where pi.plan_id in (select plan_id from public.plan_invitees
                                                    where user_id = (select id from me))
                                and not public.is_blocked((select id from me), pi.user_id)),
                            '[]'::jsonb),

  'plan_votes', coalesce((select jsonb_agg(to_jsonb(pv)) from public.plan_venue_votes pv
                           where pv.plan_id in (select plan_id from public.plan_invitees
                                                 where user_id = (select id from me))),
                         '[]'::jsonb),

  /* Names and avatars for the people above. NOTHING else about them — no
     logs, no goals, no body data, no contacts. The column list is explicit
     rather than `to_jsonb(p)` precisely so that a column added to `profiles`
     later cannot silently start travelling between accounts. */
  'people', coalesce((select jsonb_agg(jsonb_build_object(
                        'id', p.id,
                        'username', p.username,
                        'display_name', p.display_name,
                        'avatar_url', p.avatar_url,
                        'avatar_tint', p.avatar_tint,
                        'level', p.level))
                      from public.profiles p
                     where p.id in (select other_id from connected)), '[]'::jsonb),

  /* Venues I have been to or that a plan of mine proposes. */
  'venues', coalesce((select jsonb_agg(to_jsonb(v)) from public.venues v
                       where v.id in (
                         select venue_id from public.consumption_logs
                          where user_id = (select id from me) and venue_id is not null
                         union
                         select venue_id from public.sessions
                          where owner_id = (select id from me) and venue_id is not null
                         union
                         select venue_id from public.plan_venue_votes
                          where plan_id in (select plan_id from public.plan_invitees
                                             where user_id = (select id from me)))),
                     '[]'::jsonb),

  'notifications', coalesce((select jsonb_agg(to_jsonb(n)) from public.notifications n
                              where n.user_id = (select id from me)
                                and n.created_at > now() - interval '30 days'), '[]'::jsonb),

  'server_time', now()
);
$$;

/* 00031 wraps this to add the plan shortlist. Split so that adding a
   collection later is an extension rather than a restatement of 150 lines of
   hand-written scoping — every one of which is a chance to drop a `where`. */
create or replace function public.sync_pull(since timestamptz default 'epoch')
returns jsonb language sql stable security definer set search_path = public
as $$ select public.sync_pull_base(since); $$;

revoke all on function public.sync_pull_base(timestamptz) from public;
revoke all on function public.sync_pull(timestamptz) from public;
grant execute on function public.sync_pull(timestamptz) to authenticated;

comment on function public.sync_pull_base(timestamptz) is
  'The whole account in one round trip. security definer, so every scope is written by hand; rls_matrix.sql asserts the six roles against its RESULT.';
