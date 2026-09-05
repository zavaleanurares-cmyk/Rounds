-- 00032 · Give a reaction an id of its own.
--
-- `session_reactions` was keyed on (session_id, user_id, emoji, created_at).
-- That is a real key — a person can send the same reaction twice, a moment
-- apart — but it has two consequences that only surfaced once reactions
-- actually started travelling between devices:
--
--   1. A queue replay could not be idempotent. Every other row in this schema
--      is keyed by a UUID the client mints, so re-sending after a flaky night
--      is a no-op. A reaction had to smuggle its own `created_at` through the
--      writer to avoid the default clock producing a second cheer.
--   2. A received reaction could not be deduped against the sender's own local
--      copy, because there was nothing stable to compare. So the sender saw
--      their own reaction twice — once optimistically, once off the wire.
--
-- A client-minted `id` fixes both, the same way it does for logs. The old
-- composite stays as a UNIQUE constraint, so the thing it was actually
-- protecting — two identical reactions at the same instant — is still
-- protected.
--
-- The emoji column name is historical. There are no emoji in this app; the
-- column holds one of the five drawn reaction kinds (see src/ui/Reaction.tsx),
-- and renaming it is not worth a data migration.

alter table public.session_reactions
  add column if not exists id uuid;

update public.session_reactions set id = gen_random_uuid() where id is null;

alter table public.session_reactions
  alter column id set default gen_random_uuid(),
  alter column id set not null;

-- Swap the primary key for the id, keeping the old key as a uniqueness rule.
alter table public.session_reactions drop constraint if exists session_reactions_pkey;
alter table public.session_reactions add primary key (id);

alter table public.session_reactions drop constraint if exists session_reactions_moment_unique;
alter table public.session_reactions
  add constraint session_reactions_moment_unique
  unique (session_id, user_id, emoji, created_at);

comment on column public.session_reactions.emoji is
  'One of the five drawn reaction kinds. Historical column name — there are no emoji in this app.';
