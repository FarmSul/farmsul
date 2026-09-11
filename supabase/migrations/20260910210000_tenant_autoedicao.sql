-- ============================================================================
-- FARM SUL — Autoedição dos dados da empresa (tela Configurações)
-- Até agora só o admin FarmSul conseguia atualizar a linha de tenants.
-- Agora proprietário/gerente da própria empresa também podem editar os
-- dados cadastrais (nome, CNPJ/CPF, responsável, endereço) — o plano
-- continua fora do alcance deles (não incluído no formulário da tela).
-- ============================================================================

create policy "tenant: proprietario ou gerente edita os proprios dados"
  on public.tenants for update
  using (id = public.get_tenant_id() and public.get_papel() in ('proprietario', 'gerente'))
  with check (id = public.get_tenant_id() and public.get_papel() in ('proprietario', 'gerente'));
