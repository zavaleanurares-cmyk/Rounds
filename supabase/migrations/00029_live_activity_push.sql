-- 00029 · Live Activity push tokens, and the fan-out that uses them.
--
-- The iOS Live Activity has always been started with `pushType: .token`. That
-- declaration was the whole of it: the token was never captured, never stored
-- and never sent to, so a Lock Screen HUD only ever moved when its own device
-- opened the app. Two people on the same night saw two different counts.
--
-- This is the missing half. Three pieces:
--
--   1. A place to keep each participant's Activity token, per session.
--   2. A trigger that, when a log lands, enqueues one outbound row per OTHER
--      participant. Enqueues — it does not send. Sending inline from a trigger
--      puts an HTTP call to Apple inside the transaction that writes a drink,
--      which is how logging a beer starts failing because APNs is slow.
--   3. A category the weekly notification cap does not apply to, because a HUD
--      refresh is not a marketing push.
--
-- WHAT THE PAYLOAD CARRIES, and why it is so thin:
--
--   The pace state is PER PERSON. It depends on that user's own weight, sex and
--   their own last few hours — none of which another participant's log can
--   determine, and none of which should ever travel between devices. So the
--   push carries only the shared facts of the night: how many drinks the table
--   has logged, what the last one was, and who logged it. Each device computes
--   its own pace locally and merges.
--
--   The ‰ estimate is not in this payload, is not derivable from it, and must
--   never be added to it. `src/__tests__/policy.test.ts` asserts that.

create table if not exists public.live_activity_tokens (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references public.sessions(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  -- APNs push-to-start / update token for one Activity on one device. A user
  -- with a phone and an iPad has two rows for the same night.
  token       text not null,
  platform    text not null check (platform in ('ios', 'android')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (session_id, user_id, token)
);

create index if not exists live_tokens_session_idx on public.live_activity_tokens (session_id);
create index if not exists live_tokens_user_idx    on public.live_activity_tokens (user_id);

alter table public.live_activity_tokens enable row level security;

-- "In this night" means owning it or being a participant. The owner is not
-- necessarily a row in `session_participants` — a solo night has no
-- participants at all — so a policy that only checked that table would stop
-- people registering a HUD for their own night.
create or replace function public.in_session(p_session uuid, p_user uuid default auth.uid())
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.sessions s
                  where s.id = p_session and s.owner_id = p_user)
      or exists (select 1 from public.session_participants sp
                  where sp.session_id = p_session and sp.user_id = p_user);
$$;

-- Write: your own row, and only for a night you are actually in. That check is
-- what stops someone registering a token against a stranger's session and
-- receiving its updates.
create policy "register your own activity token" on public.live_activity_tokens
  for insert with check (
    auth.uid() = user_id and public.in_session(live_activity_tokens.session_id)
  );

create policy "refresh your own activity token" on public.live_activity_tokens
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- An Activity that ends should take its token with it.
create policy "remove your own activity token" on public.live_activity_tokens
  for delete using (auth.uid() = user_id);

-- Read: tokens for nights you are in. The sender runs as the service role and
-- does not need this policy; it exists so a client can see whether its own
-- registration took, and it is scoped to the session rather than to the user so
-- that a participant can tell the night is wired up at all.
create policy "read tokens for your own nights" on public.live_activity_tokens
  for select using (public.in_session(live_activity_tokens.session_id));

-- ------------------------------------------------------------ the queue
-- A HUD refresh is not marketing and must not be spent against the weekly cap.
alter table public.outbound drop constraint if exists outbound_channel_check;
alter table public.outbound add constraint outbound_channel_check
  check (channel in ('push', 'sms', 'email', 'live_activity'));

alter table public.outbound drop constraint if exists outbound_category_check;
alter table public.outbound add constraint outbound_category_check
  check (category in ('morning','weekly','plans','social','safety','system','live'));

create or replace function public.may_notify(p_user uuid, p_category text)
returns boolean
language sql stable security definer set search_path = public
as $$
  select case
    -- Safety is never rate limited. A HUD refresh is not a notification at all:
    -- it changes a surface the user is already looking at and makes no sound.
    when p_category in ('safety', 'live') then true
    else (
      select count(*) < 3
        from public.outbound o
       where o.user_id = p_user
         and o.category not in ('safety', 'system', 'live')
         and o.sent_at > now() - interval '7 days'
    )
  end;
$$;

-- ---------------------------------------------------------- the fan-out
/**
 * When a log lands on a shared night, enqueue a HUD refresh for everyone else.
 *
 * Deliberately NOT sent here. This runs inside the transaction that inserts a
 * drink; an HTTP call to Apple from this trigger would mean a slow APNs makes
 * logging a beer fail. It writes rows; `send-outbound` drains them with the
 * same bounded retry and exponential backoff as everything else in the queue.
 *
 * The logger is excluded: their own device already updated its Activity the
 * instant they tapped, and telling it again would make the count flicker. Their
 * OTHER devices are excluded too, for now — a second device catches up on next
 * foreground, and the alternative is a push that arrives while you are looking
 * at the screen that sent it.
 */
create or replace function public.enqueue_hud_refresh()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  drinks integer;
begin
  if new.session_id is null or new.deleted_at is not null then
    return new;
  end if;

  select count(*) into drinks
    from public.consumption_logs l
   where l.session_id = new.session_id and l.deleted_at is null;

  insert into public.outbound (user_id, channel, category, payload)
  select lat.user_id,
         case when lat.platform = 'ios' then 'live_activity' else 'push' end,
         'live',
         jsonb_build_object(
           'sessionId', new.session_id,
           'token',     lat.token,
           'drinks',    drinks,
           'lastDrink', new.drink_name,
           'byUserId',  new.user_id,
           -- Milliseconds, as an integer: the client is JS and a fractional
           -- epoch there is a rounding bug waiting for a quiet night.
           'at',        (extract(epoch from new.consumed_at) * 1000)::bigint
         )
    from public.live_activity_tokens lat
   where lat.session_id = new.session_id
     and lat.user_id <> new.user_id
     -- Belt and braces: a token can only exist for someone in the night, but
     -- the fan-out re-checks rather than trusting a row that outlived a leave.
     and public.in_session(new.session_id, lat.user_id);

  return new;
end;
$$;

drop trigger if exists log_fans_out_to_huds on public.consumption_logs;
create trigger log_fans_out_to_huds
  after insert on public.consumption_logs
  for each row execute function public.enqueue_hud_refresh();

comment on function public.enqueue_hud_refresh() is
  'Enqueues a HUD refresh per other participant. Carries counts and the last drink only — never a pace state, never the estimate.';
