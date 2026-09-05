-- ============================================================================
-- The rules that only exist inside a function.
--
-- Most of this schema's rules are policies, and the matrix proves those. These
-- two are not: they live in `security definer` functions, which means they hold
-- only for as long as the client actually CALLS the function. A client that
-- writes the table directly passes RLS and skips the rule entirely — silently,
-- because the write succeeds.
--
-- That is not hypothetical. Both were live regressions: the offline queue grew
-- a writer per table and two of those tables already had an RPC in front of
-- them.
--
--   · request_friendship  — refuses a self-request, caps an account at 25 sent
--                           requests a day. The insert policy only checks that
--                           the requester is you, so a direct insert removed
--                           the only spam control the server had.
--   · resolve_safe_arrival — marks the check resolved AND deletes the unsent
--                           `outbound` safety rows staged for it. A direct
--                           update to resolved_at did the first half only,
--                           leaving an SMS in the outbox addressed to a
--                           trusted contact of somebody who had already
--                           pressed "I'm safe".
--
-- The policy test in src/__tests__ asserts the client calls them. This file
-- asserts they are worth calling.
-- ============================================================================

\set ON_ERROR_STOP on

\i :harness

truncate t.results;

\set me     '''00000000-0000-0000-0000-0000000000e1'''
\set them   '''00000000-0000-0000-0000-0000000000e2'''
\set other  '''00000000-0000-0000-0000-0000000000e3'''

-- Self-contained, like the escalation file: it runs after the matrix in CI but
-- must not depend on it.
insert into auth.users (id, email) values
  (:me,    'requester@test'),
  (:them,  'target@test'),
  (:other, 'bystander@test')
on conflict (id) do nothing;

update public.profiles set username = 'requester', display_name = 'Requester' where id = :me;
update public.profiles set username = 'target',    display_name = 'Target'    where id = :them;
update public.profiles set username = 'bystander', display_name = 'Bystander' where id = :other;

delete from public.friendships where requester_id in (:me, :them, :other)
                                  or addressee_id in (:me, :them, :other);
delete from public.outbound;
delete from public.safe_arrival_checks;

-- ========================================================= 1 · sending a request
set role authenticated;
select public.set_current_user(:me);

select t.text_eq('a request to somebody else is sent',
  public.request_friendship(:them), 'sent');
select t.count_eq('and lands as exactly one pending row',
  (select count(*) from public.friendships
    where requester_id = :me and addressee_id = :them and status = 'pending'), 1);

select t.text_eq('sending the same request again is still "sent", not an error',
  public.request_friendship(:them), 'sent');
select t.count_eq('and does not duplicate the row',
  (select count(*) from public.friendships
    where requester_id = :me and addressee_id = :them), 1);

-- ============================================================ 2 · no self-friending
select t.text_eq('a request to yourself is refused',
  public.request_friendship(:me), 'self');
select t.count_eq('and writes nothing at all',
  (select count(*) from public.friendships where requester_id = :me and addressee_id = :me), 0);

-- ================================================================ 3 · the daily cap
--
-- 25 a day. Building 25 real targets would need 25 auth users, so the rows are
-- inserted directly — which is exactly the bypass this file exists to catch,
-- used here deliberately to reach the boundary. The assertion is about what the
-- FUNCTION does when the count is already 25.
reset role;
insert into auth.users (id, email)
select ('00000000-0000-0000-0000-cafe' || lpad(to_hex(g), 8, '0'))::uuid, 'pad' || g || '@test'
  from generate_series(1, 24) g
on conflict (id) do nothing;

insert into public.friendships (requester_id, addressee_id, status, created_at)
select :me, ('00000000-0000-0000-0000-cafe' || lpad(to_hex(g), 8, '0'))::uuid, 'pending', now() - interval '1 hour'
  from generate_series(1, 24) g
on conflict do nothing;

set role authenticated;
select public.set_current_user(:me);

-- 24 padding rows + the real one from section 1 = 25 in the last 24 hours.
select t.count_eq('the account is at the cap',
  (select count(*) from public.friendships
    where requester_id = :me and created_at > now() - interval '24 hours'), 25);

select t.text_eq('the twenty-sixth request of the day is refused',
  public.request_friendship(:other), 'rate_limited');
select t.count_eq('and no row is written for it',
  (select count(*) from public.friendships
    where requester_id = :me and addressee_id = :other), 0);

-- Yesterday's requests do not count against today.
reset role;
update public.friendships set created_at = now() - interval '30 hours'
 where requester_id = :me and addressee_id <> :them;
set role authenticated;
select public.set_current_user(:me);

select t.text_eq('yesterday''s requests do not hold the cap shut',
  public.request_friendship(:other), 'sent');

-- ==================================================== 4 · resolving a safe arrival
reset role;
delete from public.outbound;
delete from public.safe_arrival_checks;

insert into public.safe_arrival_checks (id, user_id, deadline_at, message)
  values ('00000000-0000-0000-0000-00000000e101', :me,    now() + interval '1 hour', 'walking home'),
         ('00000000-0000-0000-0000-00000000e102', :other, now() + interval '1 hour', 'not mine');

-- What the escalation job stages before the deadline: an unsent SMS to a
-- trusted contact, plus one already sent, plus one belonging to a different
-- check. Only the first should disappear.
insert into public.outbound (user_id, channel, category, payload, destination, sent_at) values
  (:me,    'sms',  'safety', '{"checkId":"00000000-0000-0000-0000-00000000e101"}', '+40700000001', null),
  (:me,    'push', 'safety', '{"checkId":"00000000-0000-0000-0000-00000000e101"}', null,           now()),
  (:other, 'sms',  'safety', '{"checkId":"00000000-0000-0000-0000-00000000e102"}', '+40700000002', null),
  (:me,    'push', 'plans',  '{"checkId":"00000000-0000-0000-0000-00000000e101"}', null,           null);

set role authenticated;
select public.set_current_user(:me);

select public.resolve_safe_arrival('00000000-0000-0000-0000-00000000e101');

select t.check('the check is stamped resolved',
  (select resolved_at is not null from public.safe_arrival_checks
    where id = '00000000-0000-0000-0000-00000000e101'), true);

reset role;
select t.count_eq('the unsent SMS to the trusted contact is cancelled',
  (select count(*) from public.outbound
    where channel = 'sms' and destination = '+40700000001'), 0);
select t.count_eq('a message already delivered is left alone — it cannot be unsent',
  (select count(*) from public.outbound where sent_at is not null), 1);
select t.count_eq('another user''s pending safety message is untouched',
  (select count(*) from public.outbound where user_id = :other and sent_at is null), 1);
select t.count_eq('and a non-safety message for the same night is not swept up with it',
  (select count(*) from public.outbound where category = 'plans'), 1);

-- ============================================ 5 · you can only resolve your own
set role authenticated;
select public.set_current_user(:me);
select public.resolve_safe_arrival('00000000-0000-0000-0000-00000000e102');
reset role;
select t.check('resolving somebody else''s check does not resolve it',
  (select resolved_at is null from public.safe_arrival_checks
    where id = '00000000-0000-0000-0000-00000000e102'), true);
select t.count_eq('and does not cancel their pending message either',
  (select count(*) from public.outbound where user_id = :other and sent_at is null), 1);

-- ==================================================== 6 · join-code collisions
--
-- The code is minted on the device, offline, and the column is globally unique.
-- Before the trigger, a collision meant the session insert was rejected, the
-- queue retried it eight times and dropped it, and a whole night — with every
-- drink in it — stayed on one phone. This asserts the second night survives,
-- with a code of its own.
reset role;
delete from public.sessions where owner_id in (:me, :other);

insert into public.sessions (id, owner_id, visibility, join_code, started_at)
  values ('00000000-0000-0000-0000-00000000e201', :me, 'friends', 'CAFEF00D', now());

-- The same code, from a different device that could not have known.
insert into public.sessions (id, owner_id, visibility, join_code, started_at)
  values ('00000000-0000-0000-0000-00000000e202', :other, 'friends', 'CAFEF00D', now());

select t.count_eq('both nights exist — the second was not rejected',
  (select count(*) from public.sessions
    where id in ('00000000-0000-0000-0000-00000000e201', '00000000-0000-0000-0000-00000000e202')), 2);
select t.text_eq('the first keeps the code it was showing',
  (select join_code from public.sessions where id = '00000000-0000-0000-0000-00000000e201'), 'CAFEF00D');
select t.check('the second was given a different one',
  (select join_code <> 'CAFEF00D' and length(join_code) = 8 from public.sessions
    where id = '00000000-0000-0000-0000-00000000e202'), true);

-- An ordinary update must not silently re-mint a code people are using.
update public.sessions set title = 'renamed' where id = '00000000-0000-0000-0000-00000000e201';
select t.text_eq('renaming a night leaves its code alone',
  (select join_code from public.sessions where id = '00000000-0000-0000-0000-00000000e201'), 'CAFEF00D');

-- A private night that is opened up later gets a code through the RPC.
insert into public.sessions (id, owner_id, visibility, started_at)
  values ('00000000-0000-0000-0000-00000000e203', :me, 'private', now());
update public.sessions set visibility = 'friends' where id = '00000000-0000-0000-0000-00000000e203';
set role authenticated;
select public.set_current_user(:me);
select t.check('ensure_join_code returns a usable code',
  (select length(public.ensure_join_code('00000000-0000-0000-0000-00000000e203')) = 8), true);
select t.check('and calling it twice returns the same one',
  public.ensure_join_code('00000000-0000-0000-0000-00000000e203')
    = public.ensure_join_code('00000000-0000-0000-0000-00000000e203'), true);
reset role;

-- ================================================ 7 · telling other people
--
-- `notifications` has no insert policy at all, deliberately: "anyone may write
-- to anyone's inbox" is a spam feature. So both of these run as definer
-- functions and every scope in them is hand-written — which is exactly the kind
-- of code that needs asserting rather than reading.
reset role;
delete from public.notifications;
delete from public.outbound;
delete from public.sessions where owner_id in (:me, :other);
delete from public.friendships where requester_id in (:me, :them, :other)
                                  or addressee_id in (:me, :them, :other);

insert into public.friendships (requester_id, addressee_id, status)
  values (:me, :them, 'accepted'),
         -- :them is a friend of BOTH, so "you cannot announce/ask on a night
         -- you do not own" is refused by the ownership check rather than by
         -- there happening to be nobody in the other account's audience. An
         -- assertion that passes for the wrong reason is not an assertion.
         (:other, :them, 'accepted');

insert into public.sessions (id, owner_id, visibility, join_code, started_at)
  values ('00000000-0000-0000-0000-00000000e301', :me, 'friends', 'NIGHT001', now());

set role authenticated;
select public.set_current_user(:me);
select t.count_eq('a friend is told the night started',
  public.notify_night_started('00000000-0000-0000-0000-00000000e301')::bigint, 1);
select public.notify_night_started('00000000-0000-0000-0000-00000000e301');
reset role;
-- Counted as the table owner: "your inbox" scopes a signed-in read to the
-- reader, and the point here is what the OTHER account received.
select t.count_eq('running it again tells nobody twice',
  (select count(*) from public.notifications where user_id = :them), 1);
select t.count_eq('and the row it wrote is the one the dedupe key names',
  (select count(*) from public.notifications
    where user_id = :them and dedupe_key = 'night:00000000-0000-0000-0000-00000000e301'), 1);
select t.count_eq('a stranger hears nothing about it',
  (select count(*) from public.notifications where user_id = :other), 0);

-- A private night tells nobody, whatever the client asked for.
insert into public.sessions (id, owner_id, visibility, started_at)
  values ('00000000-0000-0000-0000-00000000e302', :me, 'private', now());
set role authenticated;
select public.set_current_user(:me);
select t.count_eq('a private night notifies nobody',
  public.notify_night_started('00000000-0000-0000-0000-00000000e302')::bigint, 0);

-- Somebody else's night is not yours to announce.
reset role;
insert into public.sessions (id, owner_id, visibility, join_code, started_at)
  values ('00000000-0000-0000-0000-00000000e303', :other, 'friends', 'NIGHT002', now());
set role authenticated;
select public.set_current_user(:me);
select t.count_eq('you cannot announce a night you do not own',
  public.notify_night_started('00000000-0000-0000-0000-00000000e303')::bigint, 0);

-- The round. Named targets only, and only people in the night's audience.
select t.count_eq('the friend in the round is asked',
  public.ask_for_round('00000000-0000-0000-0000-00000000e301',
                       '00000000-0000-0000-0000-00000000e401',
                       array[:them]::uuid[], 'Negroni')::bigint, 1);
select t.count_eq('a stranger named in the array is skipped in silence',
  public.ask_for_round('00000000-0000-0000-0000-00000000e301',
                       '00000000-0000-0000-0000-00000000e402',
                       array[:other]::uuid[], 'Negroni')::bigint, 0);
select t.count_eq('you cannot ask people on a night you do not own',
  public.ask_for_round('00000000-0000-0000-0000-00000000e303',
                       '00000000-0000-0000-0000-00000000e403',
                       array[:them]::uuid[], 'Negroni')::bigint, 0);
select t.count_eq('an empty selection asks nobody',
  public.ask_for_round('00000000-0000-0000-0000-00000000e301',
                       '00000000-0000-0000-0000-00000000e404',
                       array[]::uuid[], 'Negroni')::bigint, 0);
select t.count_eq('and a list too long to be a round is refused whole',
  public.ask_for_round('00000000-0000-0000-0000-00000000e301',
                       '00000000-0000-0000-0000-00000000e405',
                       (select array_agg(:them::uuid) from generate_series(1, 13)), 'Negroni')::bigint, 0);
select t.count_eq('the same round asked twice asks once',
  public.ask_for_round('00000000-0000-0000-0000-00000000e301',
                       '00000000-0000-0000-0000-00000000e401',
                       array[:them]::uuid[], 'Negroni')::bigint, 1);
reset role;
select t.count_eq('so the friend has exactly one round prompt',
  (select count(*) from public.notifications
    where user_id = :them and dedupe_key like 'round:%'), 1);

-- ============================================ 8 · the notification switches
--
-- Four of the six governed nothing: every message is composed and delivered
-- server-side, so a preference kept on the phone could not be honoured.
update public.profiles
   set notification_prefs = jsonb_set(notification_prefs, '{social}', 'false')
 where id = :them;
delete from public.outbound;
delete from public.notifications where user_id = :them;

set role authenticated;
select public.set_current_user(:me);
select public.notify_night_started('00000000-0000-0000-0000-00000000e301');
reset role;
select t.count_eq('with social notifications off, nothing is pushed',
  (select count(*) from public.outbound where user_id = :them), 0);
select t.count_eq('but the inbox row is still written — the switch is about interruption',
  (select count(*) from public.notifications where user_id = :them), 1);

select t.check('safety is never gated by a switch',
  public.may_notify(:them, 'safety'), true);

-- ==================================================== 9 · the server's language
update public.profiles set locale = 'ro' where id = :them;
select t.text_eq('a Romanian account is addressed in Romanian',
  public.say(:them, 'safety.check.title'), 'Ai ajuns acasă?');
update public.profiles set locale = 'en' where id = :them;
select t.text_eq('and an English one in English',
  public.say(:them, 'safety.check.title'), 'Are you home?');
select t.text_eq('an unknown key degrades to the key, never to an empty message',
  public.say(:them, 'no.such.string'), 'no.such.string');

-- ------------------------------------------------------------------ cleanup
delete from public.notifications;
delete from public.sessions where owner_id in (:me, :other);
delete from public.outbound;
delete from public.safe_arrival_checks;
delete from public.friendships where requester_id in (:me, :them, :other)
                                  or addressee_id in (:me, :them, :other);

select count(*) filter (where ok) as passed,
       count(*) filter (where not ok) as failed,
       count(*) as total
  from t.results;

select t.summary('rpc rules');
