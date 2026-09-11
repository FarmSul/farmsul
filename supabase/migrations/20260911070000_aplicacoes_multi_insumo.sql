-- Agrupa aplicações de insumo em "receitas": uma aplicação (com número de
-- ordem — 1ª, 2ª, 3ª...) pode conter vários insumos (ex: 2,4-D + glifosato),
-- cada um com sua própria dose por hectare e quantidade total.

create table if not exists public.aplicacoes (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenants(id) on delete cascade,
  safra_id    uuid references public.safras(id) on delete set null,
  talhao_id   uuid not null references public.talhoes(id) on delete cascade,
  etapa       text check (etapa is null or etapa in ('preparo_correcao', 'plantio', 'controle_manejo', 'colheita', 'venda')),
  numero      integer not null default 1,
  data        date not null default current_date,
  criado_em   timestamptz not null default now()
);

create index if not exists idx_aplicacoes_tenant on public.aplicacoes(tenant_id);
create index if not exists idx_aplicacoes_safra on public.aplicacoes(safra_id);
create index if not exists idx_aplicacoes_talhao on public.aplicacoes(talhao_id);

alter table public.aplicacoes enable row level security;

drop policy if exists "aplicacoes: acesso restrito ao tenant" on public.aplicacoes;
create policy "aplicacoes: acesso restrito ao tenant"
  on public.aplicacoes for all
  using (tenant_id = public.get_tenant_id())
  with check (tenant_id = public.get_tenant_id());

drop policy if exists "admin: acesso total a aplicacoes" on public.aplicacoes;
create policy "admin: acesso total a aplicacoes"
  on public.aplicacoes for all
  using (public.is_admin())
  with check (public.is_admin());

alter table public.movimentacoes_insumo
  add column if not exists aplicacao_id uuid references public.aplicacoes(id) on delete cascade;

alter table public.movimentacoes_insumo
  add column if not exists quantidade_ha numeric(12,4);

create index if not exists idx_movimentacoes_insumo_aplicacao on public.movimentacoes_insumo(aplicacao_id);
