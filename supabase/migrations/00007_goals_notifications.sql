-- 00007 · Goals, achievements, notifications, chat.

create table if not exists public.goals (
  user_id  uuid not null references auth.users(id) on delete cascade,
  type     text not null check (type in ('nightly_cap','weekly_cap','dry_days','spend_cap','nicotine_free')),
  -- Canonical grams for alcohol, minor currency units for spend, a count for days.
  target   numeric(10,2) not null check (target >= 0),
  enabled  boolean not null default true,
  primary key (user_id, type)
);

create table if not exists public.achievements (
  user_id   uuid not null references auth.users(id) on delete cascade,
  code      text not null,
  earned_at timestamptz not null default now(),
  primary key (user_id, code)
);

create table if not exists public.notifications (
  id      uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind    text not null check (kind in ('plan','social','morning','safety','system')),
  title   text not null,
  body    text not null default '',
  href    text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_unread_idx
  on public.notifications (user_id, created_at desc) where read_at is null;

create table if not exists public.session_messages (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  body       text not null check (length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index if not exists messages_session_idx on public.session_messages (session_id, created_at);

create table if not exists public.session_reactions (
  session_id uuid not null references public.sessions(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  emoji      text not null,
  created_at timestamptz not null default now(),
  primary key (session_id, user_id, emoji, created_at)
);

alter table public.goals             enable row level security;
alter table public.achievements      enable row level security;
alter table public.notifications     enable row level security;
alter table public.session_messages  enable row level security;
alter table public.session_reactions enable row level security;

create policy "your goals"        on public.goals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "your achievements" on public.achievements for select using (auth.uid() = user_id);
create policy "your inbox"        on public.notifications for select using (auth.uid() = user_id);
create policy "mark read"         on public.notifications for update using (auth.uid() = user_id);

-- Chat is scoped to the night. There is no feed, so there is no global stream to
-- moderate — messages only exist inside a session you were in.
create policy "read chat of nights you are in" on public.session_messages for select
  using (exists (select 1 from public.session_participants sp
                  where sp.session_id = session_messages.session_id and sp.user_id = auth.uid())
      or exists (select 1 from public.sessions s
                  where s.id = session_messages.session_id and s.owner_id = auth.uid()));
create policy "post to a night you are in" on public.session_messages for insert
  with check (auth.uid() = user_id
    and (exists (select 1 from public.session_participants sp
                  where sp.session_id = session_id and sp.user_id = auth.uid())
      or exists (select 1 from public.sessions s where s.id = session_id and s.owner_id = auth.uid())));
create policy "delete your own message" on public.session_messages for delete using (auth.uid() = user_id);

create policy "read reactions" on public.session_reactions for select
  using (public.can_view_session(session_id, auth.uid()));
create policy "react" on public.session_reactions for insert with check (auth.uid() = user_id);
