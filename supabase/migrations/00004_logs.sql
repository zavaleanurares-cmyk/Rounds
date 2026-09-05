-- 00004 · Consumption logs. The most important table in the schema.
--
-- `id` is CLIENT-GENERATED and is the primary key. That single decision is what
-- makes every write path in the product — the sheet, the widget, the Live
-- Activity button, the notification action, Siri, the watch — idempotent by
-- construction rather than by retry logic. Replaying a queued insert conflicts;
-- it cannot duplicate a drink.
--
-- `ethanol_g` and `night_key` are GENERATED. A client that computes them wrong,
-- or an older client that computes them differently, cannot corrupt the data.
--
-- Deletes are TOMBSTONES (`deleted_at`). A synced row that vanishes is a sync
-- bug waiting to surface on the user's next device.

create table if not exists public.consumption_logs (
  id           uuid primary key,                       -- client-generated UUID
  user_id      uuid not null references auth.users(id) on delete cascade,
  session_id   uuid references public.sessions(id) on delete set null,
  drink_id     text not null,
  drink_name   text not null,
  category     public.drink_category not null,
  volume_ml    numeric(7,1) not null check (volume_ml >= 0),
  abv          numeric(4,1) not null check (abv >= 0 and abv <= 96),
  price_minor  integer check (price_minor is null or price_minor >= 0),
  currency     text not null default 'EUR',
  venue_id     uuid references public.venues(id) on delete set null,
  consumed_at  timestamptz not null default now(),
  deleted_at   timestamptz,
  created_at   timestamptz not null default now(),

  -- 0.789 g/ml is the density of ethanol at 20 °C.
  ethanol_g    numeric(7,2) generated always as (volume_ml * (abv / 100.0) * 0.789) stored,
  night_key    date generated always as (public.night_key(consumed_at)) stored
);

create index if not exists logs_user_time_idx  on public.consumption_logs (user_id, consumed_at desc);
create index if not exists logs_session_idx    on public.consumption_logs (session_id);
create index if not exists logs_night_idx      on public.consumption_logs (user_id, night_key);
create index if not exists logs_venue_idx      on public.consumption_logs (venue_id) where deleted_at is null;
create index if not exists logs_live_idx       on public.consumption_logs (user_id, consumed_at desc) where deleted_at is null;

alter table public.consumption_logs enable row level security;

-- Your logs are YOURS. Not your friends'. Not your crew's. A friend sees that
-- you were out; they never see what you drank.
create policy "read your own logs"   on public.consumption_logs for select using (auth.uid() = user_id);
create policy "write your own logs"  on public.consumption_logs for insert with check (auth.uid() = user_id);
create policy "edit your own logs"   on public.consumption_logs for update using (auth.uid() = user_id);

-- Deliberately absent: a delete policy. Rows are tombstoned by update, never
-- removed, so history stays reconcilable across devices.
