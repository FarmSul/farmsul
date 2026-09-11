-- ============================================================================
-- FARM SUL — Perfis de acesso (níveis de acesso da equipe)
-- Cadastro de perfis pelo tenant, atribuídos aos colaboradores
-- ============================================================================

create table public.perfis (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references public.tenants(id) on delete cascade,
  nome         text not null,
  descricao    text,
  criado_em    timestamptz not null default now()
);

create index idx_perfis_tenant on public.perfis(tenant_id);

alter table public.perfis enable row level security;

create policy "perfis: acesso restrito ao tenant"
  on public.perfis for all
  using (tenant_id = public.get_tenant_id())
  with check (tenant_id = public.get_tenant_id());

alter table public.colaboradores
  add column if not exists perfil_id uuid references public.perfis(id) on delete set null;

create index idx_colaboradores_perfil on public.colaboradores(perfil_id);
