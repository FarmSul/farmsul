-- ============================================================================
-- FARM SUL — Row-Level Security (RLS)
-- Garante que uma fazenda NUNCA veja dados de outra, mesmo com bug na aplicação
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Habilitar RLS em todas as tabelas multi-tenant
-- ----------------------------------------------------------------------------
alter table public.tenants enable row level security;
alter table public.profiles enable row level security;
alter table public.propriedades enable row level security;
alter table public.safras enable row level security;
alter table public.talhoes enable row level security;
alter table public.equipamentos enable row level security;
alter table public.manutencoes enable row level security;
alter table public.insumos enable row level security;
alter table public.movimentacoes_insumo enable row level security;
alter table public.lancamentos_financeiros enable row level security;

-- ----------------------------------------------------------------------------
-- TENANTS: usuário só vê o próprio tenant
-- ----------------------------------------------------------------------------
create policy "tenant visivel apenas para seus membros"
  on public.tenants for select
  using (id = public.get_tenant_id());

-- ----------------------------------------------------------------------------
-- PROFILES: usuário vê perfis do mesmo tenant
-- ----------------------------------------------------------------------------
create policy "profiles visiveis dentro do tenant"
  on public.profiles for select
  using (tenant_id = public.get_tenant_id());

create policy "usuario pode editar o proprio perfil"
  on public.profiles for update
  using (id = auth.uid());

-- ----------------------------------------------------------------------------
-- PROPRIEDADES — padrão replicado em todas as tabelas de negócio:
-- select/insert/update/delete só dentro do próprio tenant
-- ----------------------------------------------------------------------------
create policy "propriedades: acesso restrito ao tenant"
  on public.propriedades for all
  using (tenant_id = public.get_tenant_id())
  with check (tenant_id = public.get_tenant_id());

-- ----------------------------------------------------------------------------
-- SAFRAS
-- ----------------------------------------------------------------------------
create policy "safras: acesso restrito ao tenant"
  on public.safras for all
  using (tenant_id = public.get_tenant_id())
  with check (tenant_id = public.get_tenant_id());

-- ----------------------------------------------------------------------------
-- TALHOES
-- ----------------------------------------------------------------------------
create policy "talhoes: acesso restrito ao tenant"
  on public.talhoes for all
  using (tenant_id = public.get_tenant_id())
  with check (tenant_id = public.get_tenant_id());

-- ----------------------------------------------------------------------------
-- EQUIPAMENTOS
-- ----------------------------------------------------------------------------
create policy "equipamentos: acesso restrito ao tenant"
  on public.equipamentos for all
  using (tenant_id = public.get_tenant_id())
  with check (tenant_id = public.get_tenant_id());

-- ----------------------------------------------------------------------------
-- MANUTENCOES
-- ----------------------------------------------------------------------------
create policy "manutencoes: acesso restrito ao tenant"
  on public.manutencoes for all
  using (tenant_id = public.get_tenant_id())
  with check (tenant_id = public.get_tenant_id());

-- ----------------------------------------------------------------------------
-- INSUMOS
-- ----------------------------------------------------------------------------
create policy "insumos: acesso restrito ao tenant"
  on public.insumos for all
  using (tenant_id = public.get_tenant_id())
  with check (tenant_id = public.get_tenant_id());

-- ----------------------------------------------------------------------------
-- MOVIMENTACOES_INSUMO
-- ----------------------------------------------------------------------------
create policy "movimentacoes: acesso restrito ao tenant"
  on public.movimentacoes_insumo for all
  using (tenant_id = public.get_tenant_id())
  with check (tenant_id = public.get_tenant_id());

-- ----------------------------------------------------------------------------
-- LANCAMENTOS_FINANCEIROS
-- Regra extra: só proprietario/gerente podem excluir lançamentos financeiros
-- ----------------------------------------------------------------------------
create policy "financeiro: select dentro do tenant"
  on public.lancamentos_financeiros for select
  using (tenant_id = public.get_tenant_id());

create policy "financeiro: insert dentro do tenant"
  on public.lancamentos_financeiros for insert
  with check (tenant_id = public.get_tenant_id());

create policy "financeiro: update dentro do tenant"
  on public.lancamentos_financeiros for update
  using (tenant_id = public.get_tenant_id())
  with check (tenant_id = public.get_tenant_id());

create policy "financeiro: delete apenas proprietario ou gerente"
  on public.lancamentos_financeiros for delete
  using (
    tenant_id = public.get_tenant_id()
    and public.get_papel() in ('proprietario', 'gerente')
  );
