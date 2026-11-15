-- Apply after the existing public.snippets table has been created.
create table if not exists public.attachments (
  id uuid primary key default gen_random_uuid(),
  snippet_id bigint not null references public.snippets(id) on delete cascade,
  file_name text not null,
  storage_path text not null unique,
  file_size bigint,
  mime_type text,
  created_at timestamptz not null default now()
);

create index if not exists attachments_snippet_id_idx on public.attachments (snippet_id);

alter table public.attachments enable row level security;

create policy "Read attachments for visible snippets"
on public.attachments for select to anon, authenticated
using (exists (select 1 from public.snippets where id = snippet_id));

create policy "Authenticated users can add snippet attachments"
on public.attachments for insert to authenticated
with check (
  exists (select 1 from public.snippets where id = snippet_id)
  and storage_path like 'snippets/' || snippet_id::text || '/%'
  and file_name <> ''
  and (file_size is null or file_size between 0 and 20971520)
);

insert into storage.buckets (id, name, public, file_size_limit)
values ('snippet-attachments', 'snippet-attachments', false, 20971520)
on conflict (id) do update set public = false, file_size_limit = 20971520;

create policy "Read private attachments for visible snippets"
on storage.objects for select to anon, authenticated
using (
  bucket_id = 'snippet-attachments'
  and (
    auth.role() = 'authenticated'
    or exists (
      select 1 from public.snippets
      where id::text = split_part(name, '/', 2)
        and split_part(name, '/', 1) = 'snippets'
    )
  )
);

create policy "Authenticated users can upload snippet attachments"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'snippet-attachments'
  and name ~ '^snippets/[0-9]+/[^/]+$'
  and lower(storage.extension(name)) in
    ('pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'zip', 'png', 'jpg', 'jpeg')
  and exists (select 1 from public.snippets where id::text = split_part(name, '/', 2))
);

-- The snippets UI already lets signed-in users delete snippets. Permit cleanup
-- of their objects after the row is removed so the bucket does not grow forever.
create policy "Authenticated users can clean up snippet attachments"
on storage.objects for delete to authenticated
using (bucket_id = 'snippet-attachments');
