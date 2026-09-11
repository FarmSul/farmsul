-- ============================================================================
-- FARM SUL — Registros climáticos (pluviômetros / estações meteorológicas)
-- Cadastro de estações de leitura por propriedade + registros manuais de
-- chuva/temperatura/umidade/pressão. `propriedades.latitude/longitude` são
-- usados pra previsão de chuva via API externa (Open-Meteo), preenchidos por
-- geocodificação a partir de município/estado quando ausentes.
-- ============================================================================

alter table public.propriedades add column if not exists latitude numeric(9,6);
alter table public.propriedades add column if not exists longitude numeric(9,6);

create table if not exists public.estacoes_climaticas (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references public.tenants(id) on delete cascade,
  propriedade_id uuid not null references public.propriedades(id) on delete cascade,
  nome           text not null,
  tipo           text not null default 'pluviometro' check (tipo in ('pluviometro', 'estacao_meteorologica')),
  criado_em      timestamptz not null default now()
);

create table if not exists public.registros_climaticos (
  id                 uuid primary key default gen_random_uuid(),
  tenant_id          uuid not null references public.tenants(id) on delete cascade,
  estacao_id         uuid not null references public.estacoes_climaticas(id) on delete cascade,
  data               date not null default current_date,
  precipitacao_mm    numeric(6,2),
  temperatura_c      numeric(4,1),
  umidade_pct        numeric(5,2),
  pressao_hpa        numeric(6,1),
  criado_em          timestamptz not null default now()
);

create index if not exists idx_estacoes_climaticas_tenant on public.estacoes_climaticas(tenant_id);
create index if not exists idx_estacoes_climaticas_propriedade on public.estacoes_climaticas(propriedade_id);
create index if not exists idx_registros_climaticos_tenant on public.registros_climaticos(tenant_id);
create index if not exists idx_registros_climaticos_estacao on public.registros_climaticos(estacao_id);

alter table public.estacoes_climaticas enable row level security;
alter table public.registros_climaticos enable row level security;

drop policy if exists "estacoes climaticas: acesso restrito ao tenant" on public.estacoes_climaticas;
create policy "estacoes climaticas: acesso restrito ao tenant"
  on public.estacoes_climaticas for all
  using (tenant_id = public.get_tenant_id())
  with check (tenant_id = public.get_tenant_id());

drop policy if exists "admin: acesso total a estacoes climaticas" on public.estacoes_climaticas;
create policy "admin: acesso total a estacoes climaticas"
  on public.estacoes_climaticas for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "registros climaticos: acesso restrito ao tenant" on public.registros_climaticos;
create policy "registros climaticos: acesso restrito ao tenant"
  on public.registros_climaticos for all
  using (tenant_id = public.get_tenant_id())
  with check (tenant_id = public.get_tenant_id());

drop policy if exists "admin: acesso total a registros climaticos" on public.registros_climaticos;
create policy "admin: acesso total a registros climaticos"
  on public.registros_climaticos for all
  using (public.is_admin())
  with check (public.is_admin());
