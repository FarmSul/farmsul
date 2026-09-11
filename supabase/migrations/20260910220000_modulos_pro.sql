-- ============================================================================
-- FARM SUL — Tabelas dos módulos Fiscal, Contratos, Pecuária e Estoque Produção
-- Financeiro e Estoque Insumos já tinham tabela (lancamentos_financeiros,
-- insumos/movimentacoes_insumo); esses 4 ainda não existiam.
-- ============================================================================

create table public.notas_fiscais (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references public.tenants(id) on delete cascade,
  numero        text not null,
  tipo          text not null check (tipo in ('entrada', 'saida')),
  valor         numeric(12,2) not null,
  data_emissao  date not null default current_date,
  descricao     text,
  status        text not null default 'emitida' check (status in ('emitida', 'cancelada')),
  criado_em     timestamptz not null default now()
);

create index idx_notas_fiscais_tenant on public.notas_fiscais(tenant_id);
alter table public.notas_fiscais enable row level security;
create policy "notas_fiscais: acesso restrito ao tenant"
  on public.notas_fiscais for all
  using (tenant_id = public.get_tenant_id())
  with check (tenant_id = public.get_tenant_id());

create table public.contratos (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references public.tenants(id) on delete cascade,
  titulo        text not null,
  tipo          text not null check (tipo in ('arrendamento', 'parceria', 'compra', 'venda', 'outro')),
  contraparte   text,
  valor         numeric(12,2),
  data_inicio   date not null default current_date,
  data_fim      date,
  status        text not null default 'ativo' check (status in ('ativo', 'encerrado')),
  criado_em     timestamptz not null default now()
);

create index idx_contratos_tenant on public.contratos(tenant_id);
alter table public.contratos enable row level security;
create policy "contratos: acesso restrito ao tenant"
  on public.contratos for all
  using (tenant_id = public.get_tenant_id())
  with check (tenant_id = public.get_tenant_id());

create table public.pecuaria_lotes (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references public.tenants(id) on delete cascade,
  identificacao text not null,
  categoria     text not null check (categoria in ('bezerro', 'novilho', 'boi', 'vaca', 'touro', 'outro')),
  quantidade    integer not null check (quantidade > 0),
  peso_medio_kg numeric(10,2),
  data_entrada  date not null default current_date,
  observacoes   text,
  criado_em     timestamptz not null default now()
);

create index idx_pecuaria_lotes_tenant on public.pecuaria_lotes(tenant_id);
alter table public.pecuaria_lotes enable row level security;
create policy "pecuaria_lotes: acesso restrito ao tenant"
  on public.pecuaria_lotes for all
  using (tenant_id = public.get_tenant_id())
  with check (tenant_id = public.get_tenant_id());

create table public.estoque_producao (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references public.tenants(id) on delete cascade,
  produto       text not null,
  safra_id      uuid references public.safras(id) on delete set null,
  tipo          text not null check (tipo in ('entrada', 'saida')),
  quantidade    numeric(12,2) not null check (quantidade > 0),
  unidade       text not null default 'saca' check (unidade in ('saca', 'kg', 'ton')),
  local         text,
  data          date not null default current_date,
  criado_em     timestamptz not null default now()
);

create index idx_estoque_producao_tenant on public.estoque_producao(tenant_id);
alter table public.estoque_producao enable row level security;
create policy "estoque_producao: acesso restrito ao tenant"
  on public.estoque_producao for all
  using (tenant_id = public.get_tenant_id())
  with check (tenant_id = public.get_tenant_id());
