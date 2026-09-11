-- ============================================================================
-- FARM SUL — Schema inicial (Supabase / Postgres)
-- Multi-tenant com isolamento via Row-Level Security (RLS)
-- ============================================================================
-- Como aplicar:
--   1. Abra o painel do Supabase > SQL Editor
--   2. Cole este arquivo inteiro e rode
--   3. Rode os arquivos seguintes (002, 003...) na ordem
-- ============================================================================

-- ----------------------------------------------------------------------------
-- EXTENSÕES
-- ----------------------------------------------------------------------------
create extension if not exists "pgcrypto"; -- gen_random_uuid()

-- ----------------------------------------------------------------------------
-- TABELA: tenants
-- Cada linha aqui é um cliente pagante (uma fazenda ou grupo de fazendas)
-- ----------------------------------------------------------------------------
create table public.tenants (
  id           uuid primary key default gen_random_uuid(),
  nome         text not null,
  plano        text not null default 'essencial' check (plano in ('essencial', 'avancado', 'consultoria')),
  criado_em    timestamptz not null default now()
);

comment on table public.tenants is 'Cada tenant representa uma fazenda ou grupo de fazendas cliente do Farm Sul';

-- ----------------------------------------------------------------------------
-- TABELA: profiles
-- Estende auth.users do Supabase, ligando cada usuário a um tenant e papel
-- ----------------------------------------------------------------------------
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  tenant_id    uuid not null references public.tenants(id) on delete cascade,
  nome_completo text,
  papel        text not null default 'operador' check (papel in ('proprietario', 'gerente', 'operador', 'consultor')),
  criado_em    timestamptz not null default now()
);

comment on table public.profiles is 'Perfil de cada usuário, vinculado a um tenant e com papel de acesso definido';

-- ----------------------------------------------------------------------------
-- FUNÇÃO AUXILIAR: get_tenant_id()
-- Usada em toda policy de RLS para descobrir o tenant do usuário logado
-- ----------------------------------------------------------------------------
create or replace function public.get_tenant_id()
returns uuid
language sql
security definer
stable
as $$
  select tenant_id from public.profiles where id = auth.uid();
$$;

comment on function public.get_tenant_id() is 'Retorna o tenant_id do usuário autenticado atual — usado em todas as policies de RLS';

-- ----------------------------------------------------------------------------
-- FUNÇÃO AUXILIAR: get_papel()
-- Usada quando uma ação exige um papel mínimo (ex: só gerente pode editar financeiro)
-- ----------------------------------------------------------------------------
create or replace function public.get_papel()
returns text
language sql
security definer
stable
as $$
  select papel from public.profiles where id = auth.uid();
$$;

-- ----------------------------------------------------------------------------
-- TABELA: propriedades
-- ----------------------------------------------------------------------------
create table public.propriedades (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references public.tenants(id) on delete cascade,
  nome         text not null,
  area_ha      numeric(10,2) not null check (area_ha > 0),
  municipio    text,
  estado       text default 'MS',
  criado_em    timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- TABELA: safras
-- Ex: "Soja 2025/26", "Milho Safrinha 2026"
-- ----------------------------------------------------------------------------
create table public.safras (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references public.tenants(id) on delete cascade,
  nome         text not null,
  cultura      text not null check (cultura in ('soja', 'milho', 'outra')),
  data_inicio  date not null,
  data_fim     date,
  criado_em    timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- TABELA: talhoes
-- ----------------------------------------------------------------------------
create table public.talhoes (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references public.tenants(id) on delete cascade,
  propriedade_id uuid not null references public.propriedades(id) on delete cascade,
  safra_id       uuid references public.safras(id) on delete set null,
  nome           text not null,
  area_ha        numeric(10,2) not null check (area_ha > 0),
  criado_em      timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- TABELA: equipamentos (patrimônio)
-- ----------------------------------------------------------------------------
create table public.equipamentos (
  id                 uuid primary key default gen_random_uuid(),
  tenant_id          uuid not null references public.tenants(id) on delete cascade,
  nome               text not null,
  tipo               text not null check (tipo in ('trator', 'colheitadeira', 'pulverizador', 'implemento', 'veiculo', 'outro')),
  data_aquisicao     date,
  valor_aquisicao    numeric(12,2),
  status             text not null default 'ativo' check (status in ('ativo', 'manutencao', 'inativo')),
  criado_em          timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- TABELA: manutencoes
-- Histórico de manutenção de equipamentos
-- ----------------------------------------------------------------------------
create table public.manutencoes (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references public.tenants(id) on delete cascade,
  equipamento_id uuid not null references public.equipamentos(id) on delete cascade,
  data           date not null default current_date,
  descricao      text not null,
  custo          numeric(10,2) default 0,
  criado_em      timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- TABELA: insumos
-- Catálogo de insumos (sementes, fertilizantes, defensivos)
-- ----------------------------------------------------------------------------
create table public.insumos (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references public.tenants(id) on delete cascade,
  nome          text not null,
  categoria     text not null check (categoria in ('semente', 'fertilizante', 'defensivo', 'outro')),
  unidade       text not null check (unidade in ('kg', 'l', 'saca', 'un')),
  estoque_atual numeric(12,2) not null default 0,
  custo_medio   numeric(12,4) default 0,
  criado_em     timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- TABELA: movimentacoes_insumo
-- Entradas, saídas e aplicações de insumo por talhão
-- ----------------------------------------------------------------------------
create table public.movimentacoes_insumo (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references public.tenants(id) on delete cascade,
  insumo_id    uuid not null references public.insumos(id) on delete cascade,
  talhao_id    uuid references public.talhoes(id) on delete set null,
  tipo         text not null check (tipo in ('entrada', 'saida', 'aplicacao')),
  quantidade   numeric(12,2) not null check (quantidade > 0),
  custo_total  numeric(12,2),
  data         date not null default current_date,
  criado_em    timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- TABELA: lancamentos_financeiros
-- Receitas e despesas, planejadas ou realizadas, por safra/talhão
-- ----------------------------------------------------------------------------
create table public.lancamentos_financeiros (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references public.tenants(id) on delete cascade,
  propriedade_id uuid references public.propriedades(id) on delete set null,
  talhao_id      uuid references public.talhoes(id) on delete set null,
  safra_id       uuid references public.safras(id) on delete set null,
  tipo           text not null check (tipo in ('receita', 'despesa')),
  categoria      text not null,
  descricao      text,
  valor          numeric(12,2) not null,
  status         text not null default 'realizado' check (status in ('planejado', 'realizado')),
  data           date not null default current_date,
  criado_em      timestamptz not null default now()
);

-- ============================================================================
-- ÍNDICES — toda tabela multi-tenant precisa de índice em tenant_id
-- ============================================================================
create index idx_profiles_tenant on public.profiles(tenant_id);
create index idx_propriedades_tenant on public.propriedades(tenant_id);
create index idx_safras_tenant on public.safras(tenant_id);
create index idx_talhoes_tenant on public.talhoes(tenant_id);
create index idx_talhoes_propriedade on public.talhoes(propriedade_id);
create index idx_equipamentos_tenant on public.equipamentos(tenant_id);
create index idx_manutencoes_tenant on public.manutencoes(tenant_id);
create index idx_manutencoes_equipamento on public.manutencoes(equipamento_id);
create index idx_insumos_tenant on public.insumos(tenant_id);
create index idx_movimentacoes_tenant on public.movimentacoes_insumo(tenant_id);
create index idx_movimentacoes_insumo on public.movimentacoes_insumo(insumo_id);
create index idx_financeiro_tenant on public.lancamentos_financeiros(tenant_id);
create index idx_financeiro_safra on public.lancamentos_financeiros(safra_id);
