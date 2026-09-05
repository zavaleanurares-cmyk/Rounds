-- 00028 · Avatar storage.
--
-- Public-read, owner-write. The path is `<user id>/avatar.jpg`, and every
-- policy below keys on that first path segment, so a user can only ever write
-- inside their own folder no matter what filename the client sends.
--
-- Public read is a deliberate choice and a narrow one: an avatar is already
-- shown to anyone who can see the profile, the URL is unguessable only by
-- user id, and the alternative — signed URLs refreshed on every render — turns
-- a friends list into thirty round trips. NOTHING else in this schema is
-- public-read, and nothing else should be.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "avatars are readable" on storage.objects;
create policy "avatars are readable" on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists "write your own avatar" on storage.objects;
create policy "write your own avatar" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "replace your own avatar" on storage.objects;
create policy "replace your own avatar" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "remove your own avatar" on storage.objects;
create policy "remove your own avatar" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
