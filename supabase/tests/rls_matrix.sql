-- ============================================================================
-- RLS regression matrix
--
-- Six roles, asserted against every table that carries social data:
--
--     owner · participant · friend · crew-mate · stranger · BLOCKED
--
-- The sixth role is the point of this file. A `blocks` row that only hides
-- someone from a friends list is not a block — it has to be a clause in every
-- predicate, and this matrix is what proves it still is after every change.
--
-- The rule for `blocked` is absolute and appears in every section below:
--   READS NOTHING. APPEARS NOWHERE.
--
-- Plain SQL on purpose: no pgtap, no extensions, so it runs against a bare
-- Postgres in CI, in a Supabase branch, or on a laptop.
--
--   psql -d rounds -v ON_ERROR_STOP=1 -f supabase/tests/local-harness.sql
--   psql -d rounds -v ON_ERROR_STOP=1 -f supabase/migrations/*.sql
--   psql -d rounds -v ON_ERROR_STOP=1 -f supabase/tests/rls_matrix.sql
-- ============================================================================

\set ON_ERROR_STOP on
set client_min_messages = warning;

create schema if not exists t;

create table if not exists t.results (n serial, name text, ok boolean);
truncate t.results;

create or replace function t.check(name text, actual boolean, expected boolean)
returns void language plpgsql as $$
begin
  insert into t.results (name, ok) values (name, actual is not distinct from expected);
  if actual is distinct from expected then
    raise exception 'FAIL: % (expected %, got %)', name, expected, actual;
  end if;
end;
$$;

create or replace function t.count_eq(name text, actual bigint, expected bigint)
returns void language plpgsql as $$
begin
  insert into t.results (name, ok) values (name, actual = expected);
  if actual <> expected then
    raise exception 'FAIL: % (expected % rows, got %)', name, expected, actual;
  end if;
end;
$$;

create or replace function t.rejects(name text, stmt text)
returns void language plpgsql as $$
begin
  begin
    execute stmt;
    insert into t.results (name, ok) values (name, false);
    raise exception 'FAIL: % (statement was allowed and should not have been)', name;
  exception
    when others then
      if sqlerrm like 'FAIL:%' then raise; end if;
      insert into t.results (name, ok) values (name, true);
  end;
end;
$$;

-- ------------------------------------------------------------------ fixtures
-- owner       created the session
-- participant scanned in on the night
-- friend      accepted friendship with owner, was not there
-- crewmate    shares a crew with owner, not a friend
-- stranger    no relationship at all
-- blocked     WAS a friend; owner has since blocked them
\set owner  '''00000000-0000-0000-0000-0000000000a1'''
\set part   '''00000000-0000-0000-0000-0000000000a2'''
\set friend '''00000000-0000-0000-0000-0000000000a3'''
\set crew   '''00000000-0000-0000-0000-0000000000a4'''
\set strang '''00000000-0000-0000-0000-0000000000a5'''
\set blockd '''00000000-0000-0000-0000-0000000000a6'''

truncate auth.users cascade;

insert into auth.users (id, email) values
  (:owner,  'owner@test'), (:part,   'participant@test'), (:friend, 'friend@test'),
  (:crew,   'crewmate@test'), (:strang, 'stranger@test'), (:blockd, 'blocked@test');

update public.profiles set username = 'owner',       display_name = 'Owner'       where id = :owner;
update public.profiles set username = 'participant', display_name = 'Participant' where id = :part;
update public.profiles set username = 'friend',      display_name = 'Friend'      where id = :friend;
update public.profiles set username = 'crewmate',    display_name = 'Crewmate'    where id = :crew;
update public.profiles set username = 'stranger',    display_name = 'Stranger'    where id = :strang;
update public.profiles set username = 'blocked',     display_name = 'Blocked'     where id = :blockd;

-- The blocked user is STILL an accepted friend in `friendships`. The block must
-- override that rather than depend on a cleanup step having run.
insert into public.friendships (requester_id, addressee_id, status) values
  (:owner, :friend, 'accepted'),
  (:owner, :blockd, 'accepted');

insert into public.crews (id, slug, name, created_by)
  values ('00000000-0000-0000-0000-0000000000c1', 'vineri', 'Vineri', :owner);
insert into public.crew_members (crew_id, user_id) values
  ('00000000-0000-0000-0000-0000000000c1', :owner),
  ('00000000-0000-0000-0000-0000000000c1', :crew);

insert into public.blocks (blocker_id, blocked_id) values (:owner, :blockd);

insert into public.venues (id, name, confirmed) values
  ('00000000-0000-0000-0000-0000000000b1', 'Roots',  true),
  ('00000000-0000-0000-0000-0000000000b2', 'Enigma', true);

insert into public.sessions (id, owner_id, visibility, started_at, join_code) values
  ('00000000-0000-0000-0000-0000000000e1', :owner, 'friends', now(), 'AAAA1111'),
  ('00000000-0000-0000-0000-0000000000e2', :owner, 'private', now(), null),
  ('00000000-0000-0000-0000-0000000000e3', :owner, 'crew',    now(), 'BBBB2222');
insert into public.session_participants (session_id, user_id)
  values ('00000000-0000-0000-0000-0000000000e1', :part);

-- ========================================================== can_view_session
-- visibility = friends
select t.check('owner sees own friends-visible session',
  public.can_view_session('00000000-0000-0000-0000-0000000000e1', :owner), true);
select t.check('participant sees the session they were in',
  public.can_view_session('00000000-0000-0000-0000-0000000000e1', :part), true);
select t.check('friend sees a friends-visible session',
  public.can_view_session('00000000-0000-0000-0000-0000000000e1', :friend), true);
select t.check('crew-mate does NOT see a friends-visible session',
  public.can_view_session('00000000-0000-0000-0000-0000000000e1', :crew), false);
select t.check('stranger sees nothing',
  public.can_view_session('00000000-0000-0000-0000-0000000000e1', :strang), false);
select t.check('BLOCKED sees nothing, despite an accepted friendship row',
  public.can_view_session('00000000-0000-0000-0000-0000000000e1', :blockd), false);

-- visibility = private
select t.check('owner sees own private session',
  public.can_view_session('00000000-0000-0000-0000-0000000000e2', :owner), true);
select t.check('friend does not see a private session',
  public.can_view_session('00000000-0000-0000-0000-0000000000e2', :friend), false);
select t.check('crew-mate does not see a private session',
  public.can_view_session('00000000-0000-0000-0000-0000000000e2', :crew), false);
select t.check('stranger does not see a private session',
  public.can_view_session('00000000-0000-0000-0000-0000000000e2', :strang), false);
select t.check('BLOCKED does not see a private session',
  public.can_view_session('00000000-0000-0000-0000-0000000000e2', :blockd), false);

-- visibility = crew
select t.check('owner sees own crew session',
  public.can_view_session('00000000-0000-0000-0000-0000000000e3', :owner), true);
select t.check('crew-mate sees a crew session',
  public.can_view_session('00000000-0000-0000-0000-0000000000e3', :crew), true);
select t.check('friend does not see a crew session',
  public.can_view_session('00000000-0000-0000-0000-0000000000e3', :friend), false);
select t.check('stranger does not see a crew session',
  public.can_view_session('00000000-0000-0000-0000-0000000000e3', :strang), false);
select t.check('BLOCKED does not see a crew session',
  public.can_view_session('00000000-0000-0000-0000-0000000000e3', :blockd), false);

-- Regret Shield: flipping to private takes effect for everyone, immediately.
update public.sessions set visibility = 'private', join_code = null
  where id = '00000000-0000-0000-0000-0000000000e1';
select t.check('friend loses access the instant visibility flips to private',
  public.can_view_session('00000000-0000-0000-0000-0000000000e1', :friend), false);
select t.check('a participant still sees a night they were actually at',
  public.can_view_session('00000000-0000-0000-0000-0000000000e1', :part), true);
update public.sessions set visibility = 'friends', join_code = 'AAAA1111'
  where id = '00000000-0000-0000-0000-0000000000e1';

-- =============================================================== is_blocked
select t.check('block is visible from the blocker side',  public.is_blocked(:owner, :blockd), true);
select t.check('block is BIDIRECTIONAL — a one-way block is a loophole',
  public.is_blocked(:blockd, :owner), true);
select t.check('an unblocked friend is not blocked', public.is_blocked(:owner, :friend), false);
select t.check('you cannot block yourself',          public.is_blocked(:owner, :owner),  false);

-- ============================================================== are_friends
select t.check('accepted friendship reads as friends', public.are_friends(:owner, :friend), true);
select t.check('BLOCKED is never a friend, whatever friendships says',
  public.are_friends(:owner, :blockd), false);
select t.check('stranger is not a friend', public.are_friends(:owner, :strang), false);

-- ---------------------------------------------------------------------------
-- From here on, everything runs as `authenticated`. RLS is bypassed for
-- superusers and table owners, so a matrix that forgets this passes vacuously —
-- which is the most dangerous way for a security test to fail.
-- ---------------------------------------------------------------------------
grant usage on schema public, t to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public, t to authenticated;
grant all on t.results to authenticated;
grant execute on all functions in schema public to authenticated;
grant execute on all functions in schema t to authenticated;

set role authenticated;

-- =========================================================== search_profiles
select public.set_current_user(:owner);
select t.count_eq('BLOCKED does not appear in search for the blocker',
  (select count(*) from public.search_profiles('blocked')), 0);
select t.count_eq('a friend does appear in search',
  (select count(*) from public.search_profiles('friend')), 1);
select t.count_eq('you never appear in your own search results',
  (select count(*) from public.search_profiles('owner')), 0);

select public.set_current_user(:blockd);
select t.count_eq('the blocker does not appear in search for the BLOCKED user either',
  (select count(*) from public.search_profiles('owner')), 0);

-- ============================================================= private data
select public.set_current_user(:friend);
select t.count_eq('a friend cannot read your date of birth or body basics',
  (select count(*) from public.profiles_private where id = :owner), 0);
select public.set_current_user(:owner);
select t.count_eq('you can read your own private profile',
  (select count(*) from public.profiles_private where id = :owner), 1);

-- ========================================================= consumption_logs
select public.set_current_user(:owner);
insert into public.consumption_logs
  (id, user_id, session_id, drink_id, drink_name, category, volume_ml, abv, price_minor, currency, consumed_at)
values
  ('00000000-0000-0000-0000-0000000000f1', :owner, '00000000-0000-0000-0000-0000000000e1',
   'beer-pint', 'Pint of lager', 'beer', 568, 4.5, 1500, 'RON', now());

select t.count_eq('owner reads own logs', (select count(*) from public.consumption_logs), 1);

-- ethanol_g is generated, so a wrong client cannot corrupt it: 568 × 4.5% × 0.789
select t.check('ethanol_g is generated server-side and correct',
  (select round(ethanol_g, 1) = 20.2 from public.consumption_logs
    where id = '00000000-0000-0000-0000-0000000000f1'), true);

-- Idempotency by client UUID: this is the property the whole offline queue rests on.
select t.rejects('replaying a client UUID conflicts rather than duplicating',
  $$insert into public.consumption_logs
      (id, user_id, drink_id, drink_name, category, volume_ml, abv, consumed_at)
    values ('00000000-0000-0000-0000-0000000000f1',
            '00000000-0000-0000-0000-0000000000a1', 'beer-pint', 'Pint', 'beer', 568, 4.5, now())$$);

select public.set_current_user(:friend);
select t.count_eq('a friend never reads your individual logs — only that you were out',
  (select count(*) from public.consumption_logs), 0);
select public.set_current_user(:part);
select t.count_eq('even a participant of the same night reads none of your logs',
  (select count(*) from public.consumption_logs), 0);
select public.set_current_user(:blockd);
select t.count_eq('BLOCKED reads no logs', (select count(*) from public.consumption_logs), 0);
select public.set_current_user(:strang);
select t.count_eq('stranger reads no logs', (select count(*) from public.consumption_logs), 0);

-- Tombstones, not deletes: there is deliberately no delete policy.
select public.set_current_user(:owner);
update public.consumption_logs set deleted_at = now()
  where id = '00000000-0000-0000-0000-0000000000f1';
select t.count_eq('a tombstoned log is still there to reconcile against',
  (select count(*) from public.consumption_logs where deleted_at is not null), 1);
update public.consumption_logs set deleted_at = null
  where id = '00000000-0000-0000-0000-0000000000f1';

-- ===================================================================== plans
select public.set_current_user(:owner);
insert into public.plans (id, created_by, title, starts_at)
  values ('00000000-0000-0000-0000-0000000000d1', :owner, 'Friday', now() + interval '2 days');
insert into public.plan_invitees (plan_id, user_id, rsvp) values
  ('00000000-0000-0000-0000-0000000000d1', :friend, 'yes'),
  ('00000000-0000-0000-0000-0000000000d1', :blockd, 'yes');

select t.check('creator sees their own plan',
  public.can_view_plan('00000000-0000-0000-0000-0000000000d1'), true);
select public.set_current_user(:friend);
select t.check('an invitee sees the plan',
  public.can_view_plan('00000000-0000-0000-0000-0000000000d1'), true);
select public.set_current_user(:strang);
select t.check('a stranger does not see the plan',
  public.can_view_plan('00000000-0000-0000-0000-0000000000d1'), false);
select public.set_current_user(:blockd);
select t.check('BLOCKED does not see the plan even while an invitee row exists',
  public.can_view_plan('00000000-0000-0000-0000-0000000000d1'), false);
select t.count_eq('BLOCKED reads no invitee rows',
  (select count(*) from public.plan_invitees), 0);

-- One vote per user per plan, enforced by the primary key rather than the UI.
select public.set_current_user(:friend);
insert into public.plan_venue_votes (plan_id, venue_id, user_id)
  values ('00000000-0000-0000-0000-0000000000d1', '00000000-0000-0000-0000-0000000000b1', :friend);
select t.rejects('a second vote from the same user conflicts — one vote each',
  $$insert into public.plan_venue_votes (plan_id, venue_id, user_id)
    values ('00000000-0000-0000-0000-0000000000d1',
            '00000000-0000-0000-0000-0000000000b2',
            '00000000-0000-0000-0000-0000000000a3')$$);

-- ========================================================== trusted_contacts
select public.set_current_user(:owner);
insert into public.trusted_contacts (user_id, name, phone) values
  (:owner, 'Ana', '+40700000001'),
  (:owner, 'Tudor', '+40700000002'),
  (:owner, 'Mama', '+40700000003');
select t.rejects('a fourth trusted contact is refused',
  $$insert into public.trusted_contacts (user_id, name, phone)
    values ('00000000-0000-0000-0000-0000000000a1', 'Fourth', '+40700000004')$$);

select public.set_current_user(:friend);
select t.count_eq('even a friend cannot read your trusted contacts',
  (select count(*) from public.trusted_contacts), 0);
select public.set_current_user(:blockd);
select t.count_eq('BLOCKED reads no contacts', (select count(*) from public.trusted_contacts), 0);

-- ======================================================== safe_arrival_checks
select public.set_current_user(:owner);
insert into public.safe_arrival_checks (user_id, deadline_at, message)
  values (:owner, now() + interval '2 hours', 'test');
select t.count_eq('owner reads own check', (select count(*) from public.safe_arrival_checks), 1);
select public.set_current_user(:friend);
select t.count_eq('a friend cannot read your check-ins',
  (select count(*) from public.safe_arrival_checks), 0);
select public.set_current_user(:blockd);
select t.count_eq('BLOCKED reads no check-ins',
  (select count(*) from public.safe_arrival_checks), 0);

-- ========================================================= session_locations
select public.set_current_user(:owner);
insert into public.session_locations (session_id, user_id, lat, lng, expires_at)
  values ('00000000-0000-0000-0000-0000000000e1', :owner, 46.77, 23.59, now() + interval '3 hours');

select public.set_current_user(:part);
select t.count_eq('a participant sees live location while it is live',
  (select count(*) from public.session_locations), 1);
select public.set_current_user(:friend);
select t.count_eq('a friend who was NOT there sees no location',
  (select count(*) from public.session_locations), 0);
select public.set_current_user(:blockd);
select t.count_eq('BLOCKED sees no location', (select count(*) from public.session_locations), 0);

-- The TTL is enforced by the policy, not only by the purge job.
select public.set_current_user(:owner);
update public.session_locations set expires_at = now() - interval '1 minute';
select public.set_current_user(:part);
select t.count_eq('an expired location is invisible even to a participant, before any purge',
  (select count(*) from public.session_locations), 0);

-- ==================================================================== chat
select public.set_current_user(:part);
insert into public.session_messages (session_id, user_id, body)
  values ('00000000-0000-0000-0000-0000000000e1', :part, 'we are at the back');
select t.count_eq('a participant reads the night chat',
  (select count(*) from public.session_messages), 1);
select public.set_current_user(:strang);
select t.count_eq('a stranger reads no chat', (select count(*) from public.session_messages), 0);
select public.set_current_user(:blockd);
select t.count_eq('BLOCKED reads no chat', (select count(*) from public.session_messages), 0);

-- ==================================================== the safety escalation
--
-- This is the one path in the product that has to work when everything else
-- has failed, so it is asserted stage by stage. The ethic under test: at the
-- deadline we ask the USER, and only if that goes unanswered do we tell anyone
-- else.
reset role;
select public.set_current_user(:owner);

delete from public.outbound;
delete from public.safe_arrival_checks;
insert into public.safe_arrival_checks (id, user_id, deadline_at, message)
  values ('00000000-0000-0000-0000-0000000000aa', :owner,
          now() - interval '1 minute', 'Rareș asked ROUNDS to check they got home.');

select t.count_eq('nothing is queued before the escalation runs',
  (select count(*) from public.outbound), 0);

select public.run_safety_escalation();

select t.count_eq('stage one asks the user, and only the user',
  (select count(*) from public.outbound where channel = 'push'), 1);
select t.count_eq('stage one tells no contacts',
  (select count(*) from public.outbound where channel = 'sms'), 0);
select t.check('a fifteen-minute grace period is opened',
  (select grace_until is not null from public.safe_arrival_checks
    where id = '00000000-0000-0000-0000-0000000000aa'), true);

-- Running again inside the grace period must not escalate early.
select public.run_safety_escalation();
select t.count_eq('re-running inside the grace period escalates nothing',
  (select count(*) from public.outbound where channel = 'sms'), 0);

-- Now let the grace period lapse.
update public.safe_arrival_checks set grace_until = now() - interval '1 second'
  where id = '00000000-0000-0000-0000-0000000000aa';
select public.run_safety_escalation();
select t.count_eq('stage two reaches all three trusted contacts',
  (select count(*) from public.outbound where channel = 'sms'), 3);
select t.check('the check is marked escalated so it cannot fire twice',
  (select escalated_at is not null from public.safe_arrival_checks
    where id = '00000000-0000-0000-0000-0000000000aa'), true);

select public.run_safety_escalation();
select t.count_eq('an escalated check never sends again',
  (select count(*) from public.outbound where channel = 'sms'), 3);

-- Checking in cancels anything still queued.
delete from public.outbound;
delete from public.safe_arrival_checks;
insert into public.safe_arrival_checks (id, user_id, deadline_at, message)
  values ('00000000-0000-0000-0000-0000000000ab', :owner, now() - interval '1 minute', 'test');
select public.run_safety_escalation();
set role authenticated;
select public.resolve_safe_arrival('00000000-0000-0000-0000-0000000000ab');
reset role;
select t.count_eq('checking in cancels every unsent safety message',
  (select count(*) from public.outbound where sent_at is null and category = 'safety'), 0);

-- The weekly cap, and the exemption that matters.
select t.check('safety is exempt from the weekly notification cap',
  public.may_notify(:owner, 'safety'), true);
insert into public.outbound (user_id, channel, category, payload, sent_at)
select :owner, 'push', 'social', '{}'::jsonb, now() from generate_series(1, 3);
select t.check('three marketing notifications in a week is the cap',
  public.may_notify(:owner, 'social'), false);
select t.check('and safety still gets through when the cap is hit',
  public.may_notify(:owner, 'safety'), true);

-- The outbound queue is service-role only. A client must not be able to read
-- who is being told what, or to inject an SMS to an arbitrary number.
set role authenticated;
select public.set_current_user(:owner);
select t.count_eq('the client cannot read the outbound queue',
  (select count(*) from public.outbound), 0);
select t.rejects('the client cannot inject an outbound message',
  $$insert into public.outbound (user_id, channel, category, payload, destination)
    values ('00000000-0000-0000-0000-0000000000a1', 'sms', 'safety', '{}'::jsonb, '+40700000009')$$);

-- ================================================================= reports
select public.set_current_user(:friend);
insert into public.reports (reporter_id, target_type, target_id, reason)
  values (:friend, 'user', '00000000-0000-0000-0000-0000000000a1', 'harassment');
select t.count_eq('a reporter sees their own report', (select count(*) from public.reports), 1);
select public.set_current_user(:owner);
select t.count_eq('the person reported can never see that they were reported',
  (select count(*) from public.reports), 0);
select public.set_current_user(:strang);
select t.count_eq('a stranger sees no reports', (select count(*) from public.reports), 0);

-- =========================================================== subscriptions
select public.set_current_user(:owner);
select t.rejects('a client can NEVER grant itself an entitlement — subscriptions are mirrored server-side',
  $$insert into public.subscriptions (user_id, product_id, platform, status)
    values ('00000000-0000-0000-0000-0000000000a1', 'plus.annual', 'ios', 'active')$$);

-- ================================================================== blocks
select public.set_current_user(:blockd);
select t.count_eq('the BLOCKED user cannot see that they were blocked',
  (select count(*) from public.blocks), 0);
delete from public.blocks where blocked_id = :blockd;
select public.set_current_user(:owner);
select t.count_eq('the blocked user could not remove the block',
  (select count(*) from public.blocks), 1);

-- ============================================ profile personalisation (27)
select public.set_current_user(:owner);
update public.profiles set bio = 'A line about me', avatar_tint = 3, home_city = 'Bucharest'
  where id = :owner;
select t.check('you can write your own bio, tint and city',
  (select bio = 'A line about me' and avatar_tint = 3 from public.profiles where id = :owner), true);

update public.profiles set bio = 'not yours' where id = :friend;
select t.check('you cannot rewrite somebody else''s bio',
  (select bio is distinct from 'not yours' from public.profiles where id = :friend), true);

select t.rejects('a bio over 140 characters is refused by the database, not just the client',
  $$update public.profiles set bio = repeat('x', 141) where id = auth.uid()$$);
select t.rejects('an avatar tint outside the palette is refused',
  $$update public.profiles set avatar_tint = 99 where id = auth.uid()$$);

select t.check('a free handle reads as available',
  public.username_available('a_free_handle'), true);
select t.check('a handle somebody else holds reads as taken',
  public.username_available((select username from public.profiles where id = :friend)), false);
select t.check('your own current handle does not read as taken to you',
  public.username_available((select username from public.profiles where id = :owner)), true);
select t.check('a malformed handle is never available',
  public.username_available('No'), false);

-- =============================================== avatar storage (28)
select t.check('the avatars bucket is public-read',
  (select public from storage.buckets where id = 'avatars'), true);
select t.count_eq('and it is the ONLY public bucket',
  (select count(*) from storage.buckets where public), 1);

-- `:owner` is already a quoted literal, so it is concatenated directly.
insert into storage.objects (bucket_id, name) values ('avatars', :owner || '/avatar.jpg');
select t.count_eq('you can write an avatar inside your own folder',
  (select count(*) from storage.objects where bucket_id = 'avatars'), 1);

select t.rejects('you cannot write an avatar into somebody else''s folder',
  $$insert into storage.objects (bucket_id, name)
    values ('avatars', '00000000-0000-0000-0000-0000000000a2/avatar.jpg')$$);

select public.set_current_user(:friend);
-- RLS filters an UPDATE rather than raising on it, so the assertion is that it
-- touched nothing — a policy that "rejects" here would be a policy that never
-- ran at all.
with attempt as (
  update storage.objects set name = name
   where bucket_id = 'avatars' and (storage.foldername(name))[1] = :owner
  returning 1
)
select t.count_eq('and you cannot overwrite theirs either — the update matches no rows',
  (select count(*) from attempt), 0);
select t.count_eq('but an avatar IS readable by anyone — that is the point of the bucket',
  (select count(*) from storage.objects where bucket_id = 'avatars'), 1);

-- ============================================================ round size
select public.set_current_user(:owner);
select t.rejects('a round of one is not a round',
  $$insert into public.consumption_logs (id, user_id, drink_id, drink_name, category, volume_ml, abv, round_size)
    values (gen_random_uuid(), auth.uid(), 'beer-pint', 'Pint', 'beer', 568, 4.5, 1)$$);
select t.rejects('and a round of a hundred is a typo',
  $$insert into public.consumption_logs (id, user_id, drink_id, drink_name, category, volume_ml, abv, round_size)
    values (gen_random_uuid(), auth.uid(), 'beer-pint', 'Pint', 'beer', 568, 4.5, 100)$$);

reset role;

-- ------------------------------------------------------------------ summary
select count(*) filter (where ok) as passed,
       count(*) filter (where not ok) as failed,
       count(*) as total
  from t.results;

do $$
declare failed integer;
begin
  select count(*) into failed from t.results where not ok;
  if failed > 0 then raise exception '% assertions failed', failed; end if;
  raise notice 'RLS matrix: all % assertions passed', (select count(*) from t.results);
end;
$$;
