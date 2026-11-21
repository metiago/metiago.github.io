-- Existing snippets stay public. New snippets belong to the signed-in creator.
alter table public.snippets
  add column visibility text not null default 'public',
  add column owner_id uuid references auth.users(id) on delete cascade;

alter table public.snippets
  alter column owner_id set default auth.uid(),
  add constraint snippets_visibility_check
    check (visibility in ('public', 'private')),
  add constraint snippets_private_owner_check
    check (visibility = 'public' or owner_id is not null);

create index snippets_owner_id_idx on public.snippets (owner_id);

alter table public.snippets enable row level security;

-- Replace earlier snippet policies: permissive policies combine with OR and
-- would otherwise expose private rows regardless of the new read policy.
do $$
declare existing_policy record;
begin
  for existing_policy in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'snippets'
  loop
    execute format('drop policy %I on public.snippets', existing_policy.policyname);
  end loop;
end $$;

create policy "Read public or own snippets"
on public.snippets for select to anon, authenticated
using (visibility = 'public' or owner_id = (select auth.uid()));

create policy "Create own snippets"
on public.snippets for insert to authenticated
with check (owner_id = (select auth.uid()));

-- Older public rows have no owner. Allow signed-in users to keep editing them;
-- the first user who makes one private becomes its owner.
create policy "Update own or legacy public snippets"
on public.snippets for update to authenticated
using (owner_id = (select auth.uid()) or (owner_id is null and visibility = 'public'))
with check (owner_id = (select auth.uid()) or (owner_id is null and visibility = 'public'));

create policy "Delete own or legacy public snippets"
on public.snippets for delete to authenticated
using (owner_id = (select auth.uid()) or (owner_id is null and visibility = 'public'));

drop policy if exists "Read attachments for visible snippets" on public.attachments;
create policy "Read attachments for visible snippets"
on public.attachments for select to anon, authenticated
using (exists (select 1 from public.snippets where id = snippet_id));

drop policy if exists "Authenticated users can add snippet attachments" on public.attachments;
create policy "Authenticated users can add snippet attachments"
on public.attachments for insert to authenticated
with check (
  exists (
    select 1 from public.snippets
    where id = snippet_id
      and (owner_id = (select auth.uid()) or (owner_id is null and visibility = 'public'))
  )
  and storage_path like 'snippets/' || snippet_id::text || '/%'
  and file_name <> ''
  and (file_size is null or file_size between 0 and 20971520)
);

drop policy if exists "Read private attachments for visible snippets" on storage.objects;
create policy "Read private attachments for visible snippets"
on storage.objects for select to anon, authenticated
using (
  bucket_id = 'snippet-attachments'
  and split_part(name, '/', 1) = 'snippets'
  and exists (
    select 1 from public.snippets
    where id::text = split_part(name, '/', 2)
  )
);

drop policy if exists "Authenticated users can upload snippet attachments" on storage.objects;
create policy "Authenticated users can upload snippet attachments"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'snippet-attachments'
  and name ~ '^snippets/[0-9]+/[^/]+$'
  and lower(storage.extension(name)) in
    ('pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'zip', 'png', 'jpg', 'jpeg')
  and exists (
    select 1 from public.snippets
    where id::text = split_part(name, '/', 2)
      and (owner_id = (select auth.uid()) or (owner_id is null and visibility = 'public'))
  )
);

drop policy if exists "Authenticated users can clean up snippet attachments" on storage.objects;
create policy "Authenticated users can clean up snippet attachments"
on storage.objects for delete to authenticated
using (
  bucket_id = 'snippet-attachments'
  and split_part(name, '/', 1) = 'snippets'
  and exists (
    select 1 from public.snippets
    where id::text = split_part(name, '/', 2)
      and (owner_id = (select auth.uid()) or (owner_id is null and visibility = 'public'))
  )
);
