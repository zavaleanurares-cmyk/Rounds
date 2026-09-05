-- 00026 · How many people a round was for.
--
-- The round sheet already logs one drink for you and invites the rest of the
-- table to log the same. Nothing recorded how many people that was, which left
-- the "your round" achievement with no evidence to stand on and the Live
-- Activity with no way to say "a round of four".
--
-- Nullable and defaulted, so every existing row stays valid and an older
-- client that never sets it keeps working.

alter table public.consumption_logs
  add column if not exists round_size smallint
    check (round_size is null or (round_size >= 2 and round_size <= 30));

comment on column public.consumption_logs.round_size is
  'Number of people this drink was bought for, when it was logged as a round. Null for an ordinary log.';
