-- 00019 · Moderation: blocks and reports.
--
-- These two tables are App Store AND Play submission blockers. Nothing else in
-- the roadmap matters until they exist, because without them the app cannot be
-- submitted at all.
--
-- `blocks` is the important one architecturally: it is not just a list, it is a
-- clause that has to be added to EVERY social RLS predicate in the schema. A
-- block that only hides someone from a list is not a block.

create table if not exists public.blocks (
  blocker_id  uuid not null references auth.users(id) on delete cascade,
  blocked_id  uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  constraint blocks_no_self check (blocker_id <> blocked_id)
);

create index if not exists blocks_blocked_idx on public.blocks (blocked_id);

alter table public.blocks enable row level security;

create policy "own blocks are visible"
  on public.blocks for select
  using (auth.uid() = blocker_id);

create policy "block someone"
  on public.blocks for insert
  with check (auth.uid() = blocker_id);

create policy "unblock someone"
  on public.blocks for delete
  using (auth.uid() = blocker_id);

-- Bidirectional by design: if either party has blocked the other, neither can
-- see the other anywhere. A one-way block is a loophole.
create or replace function public.is_blocked(a uuid, b uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.blocks
    where (blocker_id = a and blocked_id = b)
       or (blocker_id = b and blocked_id = a)
  );
$$;

create type public.report_reason as enum (
  'harassment', 'spam', 'impersonation', 'inappropriate', 'safety', 'other'
);

create type public.report_target as enum ('user', 'session', 'message', 'venue');

create table if not exists public.reports (
  id            uuid primary key default gen_random_uuid(),
  reporter_id   uuid not null references auth.users(id) on delete cascade,
  target_type   public.report_target not null,
  target_id     text not null,
  reason        public.report_reason not null,
  detail        text not null default '',
  created_at    timestamptz not null default now(),
  resolved_at   timestamptz,
  resolution    text
);

create index if not exists reports_open_idx on public.reports (created_at) where resolved_at is null;

alter table public.reports enable row level security;

-- A reporter can file and can see their own reports. Nobody can see who
-- reported them, and nobody can edit a report after filing it.
create policy "file a report"
  on public.reports for insert
  with check (auth.uid() = reporter_id);

create policy "see own reports"
  on public.reports for select
  using (auth.uid() = reporter_id);
