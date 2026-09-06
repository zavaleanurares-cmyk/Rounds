# Deploying ROUNDS

Everything here is a step no code can take for itself. The app works with none
of it — the network is reconciliation, never a dependency — but the *server*
half of three features does not exist until these are done, and one of them is
the safety escalation.

## 1 · The database

```bash
supabase link --project-ref <ref>
supabase db push
```

`00049` installs the scheduled jobs automatically **if `pg_cron` is available**.
On Supabase enable it first, or the migration will apply, print a notice and
schedule nothing:

```sql
create extension if not exists pg_cron;
```

Verify afterwards — this is worth actually looking at:

```sql
select jobname, schedule from cron.job order by jobname;
```

Expect seven: `morning-recaps`, `plan-reminders`, `purge-accounts`,
`purge-locations`, `purge-outbound`, `safety-escalation`, `weekly-recaps`.

Or don't count them by hand — `npm run verify:deploy` checks this and everything
else on this page against the live project, and reads the expected list out of
the migration so it cannot drift from it the way this paragraph did.

## 2 · The outbound drain — the step everything else depends on

**This is the one to get right.** Every message the product sends — the
safe-arrival push, the SMS to a trusted contact, the morning recap, a friend
request, a plan reminder — is composed into `public.outbound` by the jobs above
and then *sits there*. `send-outbound` is what actually delivers it, and it is
an edge function, so it cannot be called from SQL without a secret and is
therefore not in a migration.

Nothing warns you if you skip this. The app looks fine. The escalation quietly
never reaches anybody.

```bash
supabase functions deploy send-outbound store-webhook sync-entitlement invite
```

Then schedule it every minute, either in **Dashboard → Edge Functions →
Schedules**, or from SQL with `pg_net`:

```sql
create extension if not exists pg_net;

select cron.schedule('drain-outbound', '* * * * *', $$
  select net.http_post(
    url     := 'https://<ref>.supabase.co/functions/v1/send-outbound',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.service_role_key', true))
  );
$$);
```

Store the key with `alter database postgres set app.service_role_key = '<key>'`
rather than pasting it into the job body, where it would be readable by anyone
who can select from `cron.job`.

Check it is working:

```sql
select count(*) filter (where sent_at is null)  as waiting,
       count(*) filter (where sent_at is not null) as sent,
       max(last_error) as last_error
  from public.outbound;
```

`waiting` climbing and `sent` at zero means the drain is not running.

## 3 · Secrets the functions read

| Name | Used by | Without it |
|---|---|---|
| `APNS_KEY_ID`, `APNS_TEAM_ID`, `APNS_PRIVATE_KEY` | `send-outbound` | no Live Activity updates on iOS |
| `FCM_SERVER_KEY` | `send-outbound` | no Android push |
| `SMS_PROVIDER_SID`, `SMS_PROVIDER_TOKEN`, `SMS_FROM` | `send-outbound` | **the safety SMS never sends** |
| `INVITE_PAGE_URL` | `invite` | invite links render the neutral fallback |
| `STORE_WEBHOOK_SECRET` | `store-webhook` | entitlements never sync |

```bash
supabase secrets set APNS_KEY_ID=... APNS_TEAM_ID=... SMS_FROM=...
```

## 4 · The app

```bash
EXPO_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon key>
EXPO_PUBLIC_PLACES_KEY=<optional>
```

Without the Places key venues come from OpenStreetMap and the "Open now" filter
correctly hides itself, because OSM carries opening hours as free text this app
will not guess at.

`npm run export:web` also runs `scripts/build-invite.mjs`, which substitutes
those two public values into the invite page's static fallback.

## 5 · A rule for future migrations

`alter type ... add value` must be **alone in its migration**. Adding an enum
value and then using it in the same transaction fails, and the failure is at
deploy time on a real database rather than in the test suite. `00043` follows
this and `src/__tests__/policy.test.ts` asserts that every future one does.

## What is still blocked on accounts

`npm run store:check` prints the live list. At the time of writing: Apple
Developer account and App ID, App Store Connect record, APNs `.p8`, Play Console
with both signing fingerprints, FCM key, the `specialUse` demo video, a live
`rounds.app` serving both `.well-known` files, support and marketing URLs, a
demo account on a real project, counsel on the `[DRAFT]` legal sections, and
final screenshots from real devices.
