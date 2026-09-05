-- 00005 · Friendships and crews.

create table if not exists public.friendships (
  requester_id uuid not null references auth.users(id) on delete cascade,
  addressee_id uuid not null references auth.users(id) on delete cascade,
  status       public.friend_status not null default 'pending',
  created_at   timestamptz not null default now(),
  responded_at timestamptz,
  primary key (requester_id, addressee_id),
  constraint no_self_friendship check (requester_id <> addressee_id)
);

create index if not exists friendships_addressee_idx on public.friendships (addressee_id, status);

create table if not exists public.crews (
  id           uuid primary key default gen_random_uuid(),
  slug         citext unique not null,
  name         text not null,
  accent_index smallint not null default 0,
  icon         text not null default 'moon.stars',
  created_by   uuid references auth.users(id) on delete set null,
  join_code    text unique,
  created_at   timestamptz not null default now()
);

create table if not exists public.crew_members (
  crew_id   uuid not null references public.crews(id) on delete cascade,
  user_id   uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  is_admin  boolean not null default false,
  primary key (crew_id, user_id)
);

create index if not exists crew_members_user_idx on public.crew_members (user_id);

alter table public.friendships  enable row level security;
alter table public.crews        enable row level security;
alter table public.crew_members enable row level security;

create policy "see friendships you are in" on public.friendships for select
  using (auth.uid() in (requester_id, addressee_id));
create policy "send a request" on public.friendships for insert
  with check (auth.uid() = requester_id);
create policy "respond to a request" on public.friendships for update
  using (auth.uid() = addressee_id);
create policy "withdraw or unfriend" on public.friendships for delete
  using (auth.uid() in (requester_id, addressee_id));

create policy "see crews you are in" on public.crews for select
  using (exists (select 1 from public.crew_members m where m.crew_id = crews.id and m.user_id = auth.uid()));
create policy "create a crew" on public.crews for insert with check (auth.uid() = created_by);

create policy "see members of your crews" on public.crew_members for select
  using (exists (select 1 from public.crew_members mine where mine.crew_id = crew_members.crew_id and mine.user_id = auth.uid()));
create policy "join a crew" on public.crew_members for insert with check (auth.uid() = user_id);
create policy "leave a crew"  on public.crew_members for delete using (auth.uid() = user_id);
