-- ============================================================================
-- FARM SUL — Colaboradores (equipe do tenant)
-- Cadastro de pessoas da fazenda; não implica em acesso de login ao sistema
-- ============================================================================

create table public.colaboradores (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references public.tenants(id) on delete cascade,
  nome         text not null,
  email        text,
  telefone     text,
  cpf          text,
  criado_em    timestamptz not null default now()
);

create index idx_colaboradores_tenant on public.colaboradores(tenant_id);

alter table public.colaboradores enable row level security;

create policy "colaboradores: acesso restrito ao tenant"
  on public.colaboradores for all
  using (tenant_id = public.get_tenant_id())
  with check (tenant_id = public.get_tenant_id());
