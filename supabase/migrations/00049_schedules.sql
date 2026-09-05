/**
 * Installs the schedules, where a scheduler exists.
 *
 * Every job in this schema was written, tested and left unscheduled: the four
 * `cron.schedule` lines in 00025 are comments. That is defensible for a file
 * that has to apply to a bare Postgres — `pg_cron` is an extension, and the SQL
 * suite runs without it — but the consequence in production is that
 * `run_safety_escalation` never runs, and the safe-arrival check that the whole
 * safety feature exists for silently never fires. The same for the recaps, the
 * purges, and above all for the OUTBOUND DRAIN: without that last one every
 * message this product composes sits in a table forever.
 *
 * So the schedules move here, guarded rather than commented. Where `pg_cron` is
 * available this installs them; where it is not — the test database, a laptop —
 * it notices and says so, and applying the migration still succeeds.
 *
 * `cron.schedule` is idempotent on the job name, so re-applying is safe.
 *
 * THE DRAIN IS NOT IN THIS FILE. `send-outbound` is an edge function and cannot
 * be called from SQL without a secret; it is scheduled in the Supabase
 * dashboard, or by `pg_net` with the service key, and `docs/deploy.md` says so
 * in one place with the exact steps. That is the single most consequential
 * manual step in the whole deployment, so it is written down rather than
 * assumed.
 */
do $$
begin
  if not exists (select 1 from pg_extension where extname = 'pg_cron') then
    raise notice 'pg_cron not installed — schedules skipped. See docs/deploy.md.';
    return;
  end if;

  -- Every minute: the safety escalation. This is the one that matters.
  perform cron.schedule('safety-escalation', '* * * * *',
    $j$select public.run_safety_escalation()$j$);

  -- Every fifteen minutes: the morning recap and the plan reminders. Both
  -- stage rows with their own send-after or dedupe key, so a coarse tick is
  -- enough and a missed tick costs nothing.
  perform cron.schedule('morning-recaps', '*/15 * * * *',
    $j$select public.queue_morning_recaps()$j$);
  perform cron.schedule('plan-reminders', '*/15 * * * *',
    $j$select public.queue_plan_reminders()$j$);

  -- Monday at 09:00 UTC: the weekly recap. Deduped on the ISO week, so the
  -- exact hour is not load-bearing.
  perform cron.schedule('weekly-recaps', '0 9 * * 1',
    $j$select public.queue_weekly_recaps()$j$);

  -- Housekeeping. Locations expire in minutes and deleted accounts in days, so
  -- these two run at very different rates.
  perform cron.schedule('purge-locations', '*/5 * * * *',
    $j$select public.purge_expired_locations()$j$);
  perform cron.schedule('purge-accounts', '0 3 * * *',
    $j$select public.purge_deleted_accounts()$j$);
end
$$;
