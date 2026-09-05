-- 00021 · Plans — the sober-day reason to open the app, and the growth loop.

create table if not exists public.plans (
  id          uuid primary key default gen_random_uuid(),
  created_by  uuid not null references auth.users(id) on delete cascade,
  crew_id     uuid references public.crews(id) on delete set null,
  title       text not null,
  note        text,
  starts_at   timestamptz not null,
  created_at  timestamptz not null default now()
);

create type public.rsvp_state as enum ('yes', 'maybe', 'no');

create table if not exists public.plan_invitees (
  plan_id     uuid not null references public.plans(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  rsvp        public.rsvp_state,
  invited_at  timestamptz not null default now(),
  primary key (plan_id, user_id)
);

create table if not exists public.plan_venue_votes (
  plan_id   uuid not null references public.plans(id) on delete cascade,
  venue_id  uuid not null references public.venues(id) on delete cascade,
  user_id   uuid not null references auth.users(id) on delete cascade,
  -- One vote per user per plan, changeable. Enforced by the PK, not the client.
  primary key (plan_id, user_id)
);

alter table public.plans enable row level security;
alter table public.plan_invitees enable row level security;
alter table public.plan_venue_votes enable row level security;

create or replace function public.can_view_plan(p_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
      from public.plans p
      left join public.plan_invitees i on i.plan_id = p.id and i.user_id = auth.uid()
     where p.id = p_id
       and (p.created_by = auth.uid() or i.user_id is not null)
       -- the blocked clause, on every social predicate
       and not public.is_blocked(auth.uid(), p.created_by)
  );
$$;

create policy "see plans you're in"        on public.plans for select using (public.can_view_plan(id));
create policy "create a plan"              on public.plans for insert with check (auth.uid() = created_by);
create policy "edit your own plan"         on public.plans for update using (auth.uid() = created_by);
create policy "delete your own plan"       on public.plans for delete using (auth.uid() = created_by);

create policy "see invitees of your plans" on public.plan_invitees for select using (public.can_view_plan(plan_id));
create policy "rsvp for yourself"          on public.plan_invitees for update using (auth.uid() = user_id);
create policy "invite to your own plan"    on public.plan_invitees for insert
  with check (exists (select 1 from public.plans p where p.id = plan_id and p.created_by = auth.uid()));

create policy "see votes on your plans"    on public.plan_venue_votes for select using (public.can_view_plan(plan_id));
create policy "vote once, for yourself"    on public.plan_venue_votes for insert
  with check (auth.uid() = user_id and public.can_view_plan(plan_id));
create policy "change your vote"           on public.plan_venue_votes for update using (auth.uid() = user_id);
create policy "withdraw your vote"         on public.plan_venue_votes for delete using (auth.uid() = user_id);
