-- 00020 · Account deletion — the third submission blocker.
--
-- The rule: signed out immediately, 30-day grace, then a server-side cascade.
-- "Email support to delete your account" is a rejection.

alter table public.profiles
  add column if not exists deletion_requested_at timestamptz;

create or replace function public.request_account_deletion()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
     set deletion_requested_at = now()
   where id = auth.uid();
end;
$$;

create or replace function public.cancel_account_deletion()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
     set deletion_requested_at = null
   where id = auth.uid();
end;
$$;

-- Run on a schedule. Every table that references auth.users does so with
-- `on delete cascade`, so this one delete is the whole cascade.
create or replace function public.purge_deleted_accounts()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  purged integer;
begin
  with gone as (
    delete from auth.users u
    using public.profiles p
    where p.id = u.id
      and p.deletion_requested_at is not null
      and p.deletion_requested_at < now() - interval '30 days'
    returning u.id
  )
  select count(*) into purged from gone;
  return purged;
end;
$$;
