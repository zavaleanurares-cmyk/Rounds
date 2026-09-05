-- 00023 · Spend on logs, and mirrored entitlements.

-- `price_minor` and `currency` ship in 00004 with the table. Spend is one column
-- plus a currency, and it is the highest-ROI thing the product did not have —
-- people moderate for their wallet far more reliably than for their liver.

-- Entitlements are MIRRORED from StoreKit 2 / Play Billing by a server-side
-- webhook. The client never writes here — there is deliberately no insert or
-- update policy for users.
create table if not exists public.subscriptions (
  user_id        uuid primary key references auth.users(id) on delete cascade,
  product_id     text not null,
  platform       text not null check (platform in ('ios', 'android')),
  status         text not null check (status in ('active', 'grace', 'expired', 'refunded')),
  current_period_end timestamptz,
  updated_at     timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

create policy "see your own entitlement" on public.subscriptions for select
  using (auth.uid() = user_id);

create or replace function public.has_plus(u uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.subscriptions
    where user_id = u and status in ('active', 'grace')
  );
$$;
