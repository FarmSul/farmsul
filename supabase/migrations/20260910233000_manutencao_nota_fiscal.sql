-- ============================================================================
-- FARM SUL — Nota fiscal da manutenção
-- Adiciona nota_fiscal_url em manutencoes e cria o bucket de Storage pra
-- guardar o arquivo (foto ou PDF), com policies restringindo cada tenant a
-- escrever só nos seus próprios arquivos (pasta com o tenant_id).
-- ============================================================================

alter table public.manutencoes add column if not exists nota_fiscal_url text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'notas-fiscais',
  'notas-fiscais',
  true,
  10485760,
  array['image/png', 'image/jpeg', 'image/webp', 'application/pdf']
)
on conflict (id) do nothing;

create policy "notas fiscais sao publicas para leitura"
  on storage.objects for select
  using (bucket_id = 'notas-fiscais');

create policy "tenant envia nota fiscal da propria manutencao"
  on storage.objects for insert
  with check (bucket_id = 'notas-fiscais' and (storage.foldername(name))[1] = public.get_tenant_id()::text);

create policy "tenant atualiza nota fiscal da propria manutencao"
  on storage.objects for update
  using (bucket_id = 'notas-fiscais' and (storage.foldername(name))[1] = public.get_tenant_id()::text);

create policy "tenant remove nota fiscal da propria manutencao"
  on storage.objects for delete
  using (bucket_id = 'notas-fiscais' and (storage.foldername(name))[1] = public.get_tenant_id()::text);
