-- ============================================================================
-- FARM SUL — Foto de perfil
-- Adiciona avatar_url em profiles e cria o bucket de Storage pra guardar as
-- fotos, com policies restringindo cada usuário a ler qualquer avatar
-- (públicos) mas só escrever/trocar o próprio.
-- ============================================================================

alter table public.profiles add column if not exists avatar_url text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do nothing;

create policy "avatares sao publicos para leitura"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "usuario envia o proprio avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "usuario atualiza o proprio avatar"
  on storage.objects for update
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "usuario remove o proprio avatar"
  on storage.objects for delete
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
