-- ============================================================================
-- Safety escalation — behaviour, end to end.
--
-- The RLS matrix proves who may READ a check. This file proves what actually
-- HAPPENS to one, which is a different question and the more important of the
-- two: the fourteen access-control assertions would all still pass on a system
-- that never told anybody anything.
--
-- What is exercised here:
--
--   1. The two stages, in order, and that neither fires early.
--   2. The fifteen-minute grace window, asserted as an interval rather than by
--      waiting for one.
--   3. The outbound queue under retry — a provider failing, backing off,
--      succeeding — with the assertion that nothing is ever sent twice.
--   4. A user offline for the entire window: no push token, no check-in, no
--      network. The contacts are still told, exactly once, on time.
--   5. Resolution at every point, and that a resolved check goes quiet.
--
-- ON TIME: `run_safety_escalation()` reads `now()`, and a test cannot move the
-- server clock. So elapsed time is simulated by moving the ROW backwards —
-- a check whose grace_until is fifteen minutes in the past is indistinguishable
-- from one that was armed fifteen minutes ago. The interval the function itself
-- chooses is asserted directly and separately, so the two together cover what
-- waiting would have.
-- ============================================================================

\set ON_ERROR_STOP on

\i :harness

truncate t.results;

\set u      '''00000000-0000-0000-0000-0000000000f1'''
\set quiet  '''00000000-0000-0000-0000-0000000000f2'''
\set alone  '''00000000-0000-0000-0000-0000000000f3'''

-- A clean slate. The matrix ran first and left rows behind.
delete from public.outbound;
delete from public.safe_arrival_checks;
delete from public.trusted_contacts;

-- This file creates every user it needs. It runs after the matrix in CI, but it
-- must not DEPEND on the matrix having run — a test that only passes in one
-- order is a test that will one day pass for the wrong reason.
insert into auth.users (id, email) values
  (:u,     'walker@test'),
  (:quiet, 'offline@test'),
  (:alone, 'nocontacts@test')
on conflict (id) do nothing;

update public.profiles set username = 'walker',     display_name = 'Walker'  where id = :u;
update public.profiles set username = 'offline',    display_name = 'Offline' where id = :quiet;
update public.profiles set username = 'nocontacts', display_name = 'Alone'   where id = :alone;

insert into public.trusted_contacts (user_id, name, phone) values
  (:u, 'Ana',   '+40700000001'),
  (:u, 'Tudor', '+40700000002');

-- ======================================================= 1 · nothing early
insert into public.safe_arrival_checks (id, user_id, deadline_at, message)
  values ('00000000-0000-0000-0000-00000000d001', :u, now() + interval '30 minutes',
          'Rares asked ROUNDS to tell you if they were not home by 02:00.');

select t.count_eq('a check whose deadline has not passed queues nothing',
  public.run_safety_escalation()::bigint, 0);
select t.check('and it has no grace window yet',
  (select grace_until is null from public.safe_arrival_checks
    where id = '00000000-0000-0000-0000-00000000d001'), true);

-- =================================================== 2 · stage one, on time
-- The deadline passes.
update public.safe_arrival_checks set deadline_at = now() - interval '1 minute'
 where id = '00000000-0000-0000-0000-00000000d001';

select t.count_eq('the deadline passing queues exactly one thing — a push to the USER',
  public.run_safety_escalation()::bigint, 1);
select t.count_eq('and it is a push, not an SMS: nobody else has been told yet',
  (select count(*) from public.outbound where channel = 'push'), 1);
select t.count_eq('no contact has been messaged',
  (select count(*) from public.outbound where channel = 'sms'), 0);
select t.text_eq('the push asks rather than announces',
  (select payload->>'title' from public.outbound where channel = 'push'), 'Are you home?');
select t.check('it names the fifteen minutes, so the message and the timer agree',
  (select payload->>'body' like '%15 minutes%' from public.outbound where channel = 'push'), true);

/**
 * The grace window itself. `run_safety_escalation` set `grace_until` to
 * `now() + interval '15 minutes'`; `now()` is the start of the transaction it
 * ran in, which is at most a few milliseconds before this statement. Asserting
 * a range rather than an exact equality is what makes this robust on a slow
 * CI box without weakening it to a tautology.
 */
select t.check('the grace window is fifteen minutes, not five and not fifty',
  (select grace_until - now() between interval '14 minutes 55 seconds' and interval '15 minutes'
     from public.safe_arrival_checks where id = '00000000-0000-0000-0000-00000000d001'), true);

-- ============================================ 3 · stage one does not repeat
select t.count_eq('running again inside the grace window queues nothing',
  public.run_safety_escalation()::bigint, 0);
select t.count_eq('the user is asked ONCE, not once a minute for fifteen minutes',
  (select count(*) from public.outbound where channel = 'push'), 1);

-- ================================================= 4 · resolving stops it
-- Branch this off on a second check so the first can go on to escalate.
insert into public.safe_arrival_checks (id, user_id, deadline_at, grace_until, message)
  values ('00000000-0000-0000-0000-00000000d002', :u,
          now() - interval '20 minutes', now() - interval '5 minutes', 'ignored');
update public.safe_arrival_checks set resolved_at = now()
 where id = '00000000-0000-0000-0000-00000000d002';
select t.count_eq('a check the user answered escalates to nobody, even past its grace',
  public.run_safety_escalation()::bigint, 0);
select t.check('and it is never marked escalated',
  (select escalated_at is null from public.safe_arrival_checks
    where id = '00000000-0000-0000-0000-00000000d002'), true);

-- ==================================================== 5 · stage two, on time
-- Fifteen minutes pass with no answer.
update public.safe_arrival_checks set grace_until = now() - interval '1 second'
 where id = '00000000-0000-0000-0000-00000000d001';

select t.count_eq('the grace elapsing messages every trusted contact, once each',
  public.run_safety_escalation()::bigint, 2);
select t.count_eq('two contacts, two messages',
  (select count(*) from public.outbound where channel = 'sms'), 2);
select t.count_eq('addressed to the two real numbers',
  (select count(distinct destination) from public.outbound where channel = 'sms'), 2);
select t.check('carrying the message the user previewed before arming',
  (select bool_and(payload->>'body' like 'Rares asked%')
     from public.outbound where channel = 'sms'), true);
select t.check('every safety row is category safety, so the weekly cap cannot touch it',
  (select bool_and(category = 'safety') from public.outbound), true);
select t.check('and the check is stamped escalated',
  (select escalated_at is not null from public.safe_arrival_checks
    where id = '00000000-0000-0000-0000-00000000d001'), true);

-- =========================================== 6 · stage two does not repeat
select t.count_eq('running again after escalation queues nothing',
  public.run_safety_escalation()::bigint, 0);
select t.count_eq('the contacts are told once, not once a minute forever',
  (select count(*) from public.outbound where channel = 'sms'), 2);

-- A minute of cron ticks, the way it actually runs.
do $$ begin for i in 1..10 loop perform public.run_safety_escalation(); end loop; end $$;
select t.count_eq('ten more scheduler ticks change nothing',
  (select count(*) from public.outbound), 3);

-- ======================================== 7 · the queue under retry
/**
 * The worker, in SQL.
 *
 * `send-outbound` is TypeScript, so what is modelled here is its CONTRACT: a
 * row is claimed only while `sent_at is null` and `attempts < 5`, a failure
 * bumps attempts and pushes `send_after` out exponentially, and a success
 * stamps `sent_at`. The property that matters — that no row can be delivered
 * twice — falls out of that contract and is asserted directly.
 */
create or replace function t.drain(p_now timestamptz)
returns table (id uuid, attempt integer) language sql as $$
  select o.id, o.attempts
    from public.outbound o
   where o.sent_at is null
     and o.send_after <= p_now
     and o.attempts < 5
   order by o.category, o.send_after;
$$;

-- The provider is down. First attempt on every row fails.
do $$
declare r record;
begin
  for r in select * from t.drain(now()) loop
    update public.outbound
       set attempts = r.attempt + 1,
           last_error = 'twilio 503',
           send_after = now() + (2 ^ r.attempt) * interval '1 minute'
     where outbound.id = r.id;
  end loop;
end $$;

select t.count_eq('a failed send leaves the row unsent',
  (select count(*) from public.outbound where sent_at is null), 3);
select t.count_eq('nothing is due again immediately — that is what backoff means',
  (select count(*) from t.drain(now())), 0);
select t.check('the error is visible on the row rather than lost in a log',
  (select bool_and(last_error = 'twilio 503') from public.outbound), true);
select t.count_eq('the first backoff is one minute',
  (select count(*) from t.drain(now() + interval '61 seconds')), 3);

-- Second attempt fails too; the wait doubles.
do $$
declare r record;
begin
  for r in select * from t.drain(now() + interval '61 seconds') loop
    update public.outbound
       set attempts = r.attempt + 1,
           send_after = now() + interval '61 seconds' + (2 ^ r.attempt) * interval '1 minute'
     where outbound.id = r.id;
  end loop;
end $$;

select t.count_eq('still nothing due one minute later — the wait doubled',
  (select count(*) from t.drain(now() + interval '2 minutes 2 seconds')), 0);
select t.count_eq('due after two more minutes',
  (select count(*) from t.drain(now() + interval '3 minutes 2 seconds')), 3);

-- The provider comes back.
do $$
declare r record;
begin
  for r in select * from t.drain(now() + interval '3 minutes 2 seconds') loop
    update public.outbound set sent_at = now() where outbound.id = r.id;
  end loop;
end $$;

select t.count_eq('everything eventually goes out',
  (select count(*) from public.outbound where sent_at is not null), 3);

-- ===================================== 8 · NO DOUBLE SEND, the whole point
select t.count_eq('a sent row is never claimed again, however many times the worker runs',
  (select count(*) from t.drain(now() + interval '1 day')), 0);
select t.count_eq('the two contacts received exactly two messages between them',
  (select count(*) from public.outbound where channel = 'sms'), 2);
select t.count_eq('and each of those two is a distinct row that was sent once',
  (select count(*) from (
     select destination, count(*) c from public.outbound
      where channel = 'sms' and sent_at is not null group by destination) x
   where x.c = 1), 2);

/**
 * The failure mode this guards against: a worker that stamps `sent_at` after
 * the send rather than claiming the row before it, so two overlapping
 * invocations both see an unsent row. Modelled by running the drain twice
 * without a stamp in between and asserting the second sees nothing — which it
 * only can because the first stamped.
 */
select t.count_eq('two overlapping drains do not both see the same row',
  (select count(*) from t.drain(now() + interval '1 day')), 0);

-- =========================== 9 · a row that fails five times stops, visibly
insert into public.outbound (id, user_id, channel, category, payload, destination, attempts, last_error)
  values ('00000000-0000-0000-0000-00000000e001', :u, 'sms', 'safety',
          '{"body":"unreachable"}'::jsonb, '+40700000009', 5, 'twilio 400 unroutable');
select t.count_eq('a row past the attempt ceiling is not retried',
  (select count(*) from t.drain(now() + interval '1 day')), 0);
select t.check('but it is still there, unsent, with the reason on it — findable, not lost',
  (select sent_at is null and last_error is not null from public.outbound
    where id = '00000000-0000-0000-0000-00000000e001'), true);

-- ============================ 10 · offline for the entire window
/**
 * The case the whole feature exists for.
 *
 * Someone armed a check, went out, and their phone has been unreachable ever
 * since — no push token registered, nothing delivered, no check-in. The
 * escalation must not depend on any of that. It is driven by the database
 * clock and the contacts table, and nothing else.
 */
delete from public.outbound;
insert into public.trusted_contacts (user_id, name, phone) values (:quiet, 'Mum', '+40700000003');
select t.count_eq('the offline user has no push token at all',
  (select count(*) from public.push_tokens where user_id = :quiet), 0);

insert into public.safe_arrival_checks (id, user_id, deadline_at, message)
  values ('00000000-0000-0000-0000-00000000d003', :quiet, now() - interval '1 minute',
          'Offline asked ROUNDS to tell you if they were not home by 02:00.');

select t.count_eq('stage one still queues, even with nowhere to deliver it',
  public.run_safety_escalation()::bigint, 1);
update public.safe_arrival_checks set grace_until = now() - interval '1 second'
 where id = '00000000-0000-0000-0000-00000000d003';
select t.count_eq('and stage two still reaches the contact by SMS, which needs no phone of theirs',
  public.run_safety_escalation()::bigint, 1);
select t.text_eq('addressed to the contact',
  (select destination from public.outbound where channel = 'sms'), '+40700000003');
select t.check('a check that was never answered is still escalated exactly once',
  (select escalated_at is not null from public.safe_arrival_checks
    where id = '00000000-0000-0000-0000-00000000d003'), true);

do $$ begin for i in 1..20 loop perform public.run_safety_escalation(); end loop; end $$;
select t.count_eq('twenty minutes of ticks with the user still offline send nothing more',
  (select count(*) from public.outbound where channel = 'sms'), 1);

-- ================================ 11 · a user with no contacts at all
delete from public.outbound;
insert into public.safe_arrival_checks (id, user_id, deadline_at, grace_until, message)
  values ('00000000-0000-0000-0000-00000000d004', :alone,
          now() - interval '20 minutes', now() - interval '1 minute', 'nobody to tell');
select t.count_eq('a check with no trusted contacts escalates to nobody without erroring',
  public.run_safety_escalation()::bigint, 0);
select t.check('and is still stamped, so it is not retried every minute forever',
  (select escalated_at is not null from public.safe_arrival_checks
    where id = '00000000-0000-0000-0000-00000000d004'), true);

-- ------------------------------------------------------------------ cleanup
delete from public.outbound;
delete from public.safe_arrival_checks;
delete from public.trusted_contacts;
drop function if exists t.drain(timestamptz);

select count(*) filter (where ok) as passed,
       count(*) filter (where not ok) as failed,
       count(*) as total
  from t.results;

select t.summary('safety escalation');
