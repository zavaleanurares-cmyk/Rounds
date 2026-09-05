/**
 * The notification switches, on the server, where the sending happens.
 *
 * Settings › Notifications offers six switches. Two did something: `morning`
 * gated a locally scheduled reminder, `gamification` gated the celebration
 * modals. The other four — weekly, plans, social, safety — were written to
 * local state, never synced, and never consulted by anything that sends. Every
 * message this schema sends is composed and delivered server-side, so a
 * preference that never leaves the phone cannot possibly be honoured: turning
 * "social" off changed nothing, and the app kept notifying.
 *
 * `may_notify` already held the weekly cap. It now holds the switches too, so
 * one function is the answer to "may we send this", and a job that forgets to
 * ask is the only way to get it wrong.
 *
 * Safety is the exception, and stays one: a check somebody armed themselves is
 * not marketing, and the escalation must fire whatever the switches say. The
 * switch on that screen governs the ambient reminders, not the check-in.
 */
alter table public.profiles
  add column if not exists notification_prefs jsonb not null
    default '{"morning":true,"weekly":true,"plans":true,"social":true,"safety":true,"gamification":false}'::jsonb;

create or replace function public.may_notify(p_user uuid, p_category text)
returns boolean
language sql stable security definer set search_path = public
as $$
  select case
    -- Never gated. A safe-arrival escalation is not a notification the user
    -- opted into, it is the feature they armed.
    when p_category = 'safety' then true
    when p_category = 'system' then true
    else
      coalesce((select (p.notification_prefs ->> p_category)::boolean
                  from public.profiles p where p.id = p_user), true)
      and (
        select count(*) < 3
          from public.outbound o
         where o.user_id = p_user
           and o.category not in ('safety', 'system')
           and o.sent_at > now() - interval '7 days'
      )
  end;
$$;
