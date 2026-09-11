-- ============================================================================
-- FARM SUL — Foto do equipamento
-- Adiciona foto_url em equipamentos e cria o bucket de Storage pra guardar as
-- fotos, com policies restringindo cada tenant a escrever só nos seus
-- próprios arquivos (pasta com o tenant_id), leitura pública (fotos não são
-- dado sensível, e assim carregam direto via URL pública).
-- ============================================================================

alter table public.equipamentos add column if not exists foto_url text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('equipamentos', 'equipamentos', true, 5242880, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do nothing;

create policy "fotos de equipamentos sao publicas para leitura"
  on storage.objects for select
  using (bucket_id = 'equipamentos');

create policy "tenant envia foto do proprio equipamento"
  on storage.objects for insert
  with check (bucket_id = 'equipamentos' and (storage.foldername(name))[1] = public.get_tenant_id()::text);

create policy "tenant atualiza foto do proprio equipamento"
  on storage.objects for update
  using (bucket_id = 'equipamentos' and (storage.foldername(name))[1] = public.get_tenant_id()::text);

create policy "tenant remove foto do proprio equipamento"
  on storage.objects for delete
  using (bucket_id = 'equipamentos' and (storage.foldername(name))[1] = public.get_tenant_id()::text);
