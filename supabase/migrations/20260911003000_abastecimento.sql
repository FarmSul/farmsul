-- ============================================================================
-- FARM SUL — Controle de abastecimento
-- Combustível vira uma categoria de insumo (estoque em litros, comprado pelo
-- fluxo normal de Estoque de Insumos). Cada abastecimento registra a saída
-- desse estoque pra um equipamento específico.
-- ============================================================================

-- Amplia o check de categoria pra incluir "combustivel", sem assumir o nome
-- exato da constraint atual (gerado automaticamente pelo Postgres).
do $$
declare
  nome_constraint text;
begin
  select con.conname into nome_constraint
  from pg_constraint con
  join pg_class rel on rel.oid = con.conrelid
  join pg_namespace nsp on nsp.oid = rel.relnamespace
  where nsp.nspname = 'public'
    and rel.relname = 'insumos'
    and con.contype = 'c'
    and pg_get_constraintdef(con.oid) ilike '%categoria%';

  if nome_constraint is not null then
    execute format('alter table public.insumos drop constraint %I', nome_constraint);
  end if;
end $$;

alter table public.insumos add constraint insumos_categoria_check
  check (categoria in ('semente', 'fertilizante', 'defensivo', 'combustivel', 'outro'));

create table if not exists public.abastecimentos (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references public.tenants(id) on delete cascade,
  equipamento_id uuid not null references public.equipamentos(id) on delete cascade,
  insumo_id      uuid not null references public.insumos(id) on delete restrict,
  litros         numeric(10,2) not null check (litros > 0),
  custo_total    numeric(12,2) not null default 0,
  horimetro      numeric(10,1),
  data           date not null default current_date,
  criado_em      timestamptz not null default now()
);

create index if not exists idx_abastecimentos_tenant on public.abastecimentos(tenant_id);
create index if not exists idx_abastecimentos_equipamento on public.abastecimentos(equipamento_id);
create index if not exists idx_abastecimentos_insumo on public.abastecimentos(insumo_id);

alter table public.abastecimentos enable row level security;

drop policy if exists "abastecimentos: acesso restrito ao tenant" on public.abastecimentos;
create policy "abastecimentos: acesso restrito ao tenant"
  on public.abastecimentos for all
  using (tenant_id = public.get_tenant_id())
  with check (tenant_id = public.get_tenant_id());

drop policy if exists "admin: acesso total a abastecimentos" on public.abastecimentos;
create policy "admin: acesso total a abastecimentos"
  on public.abastecimentos for all
  using (public.is_admin())
  with check (public.is_admin());
