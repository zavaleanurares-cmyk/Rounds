-- 00002 · Venues.
--
-- Venues come from a provider (MapKit / Places) and are cached here by
-- `provider_id`. User-created venues produce garbage, so `created_by` marks them
-- and they stay private until enough distinct people have logged there.

create table if not exists public.venues (
  id           uuid primary key default gen_random_uuid(),
  provider_id  text unique,
  name         text not null,
  area         text,
  lat          double precision,
  lng          double precision,
  price_band   smallint check (price_band between 1 and 3),
  category     text,
  created_by   uuid references auth.users(id) on delete set null,
  confirmed    boolean not null default false,
  created_at   timestamptz not null default now()
);

create index if not exists venues_geo_idx on public.venues (lat, lng);
create index if not exists venues_name_idx on public.venues (lower(name));

alter table public.venues enable row level security;

create policy "confirmed venues are public" on public.venues for select
  using (confirmed or created_by = auth.uid());
create policy "add a venue" on public.venues for insert
  with check (auth.uid() = created_by);
