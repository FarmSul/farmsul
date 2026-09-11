-- ============================================================================
-- FARM SUL — Áreas da safra (many-to-many com área parcial) + mais culturas
-- Substitui o vínculo único talhoes.safra_id por uma tabela de junção,
-- permitindo que uma mesma área seja dividida entre safras diferentes
-- (ex.: usar só 0,05 ha de um talhão de 133 ha em uma safra), igual ao Aegro.
-- ============================================================================

-- Amplia o catálogo de culturas
alter table public.safras drop constraint if exists safras_cultura_check;
alter table public.safras add constraint safras_cultura_check
  check (cultura in ('soja', 'milho', 'sorgo', 'milheto', 'trigo', 'feijao', 'arroz', 'algodao', 'outra'));

-- ----------------------------------------------------------------------------
-- TABELA: safra_talhoes
-- Uma safra pode ter várias áreas; cada área entra com um tamanho utilizado
-- (pode ser menor que a área total do talhão)
-- ----------------------------------------------------------------------------
create table public.safra_talhoes (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references public.tenants(id) on delete cascade,
  safra_id     uuid not null references public.safras(id) on delete cascade,
  talhao_id    uuid not null references public.talhoes(id) on delete cascade,
  area_ha      numeric(10,2) not null check (area_ha > 0),
  criado_em    timestamptz not null default now(),
  unique (safra_id, talhao_id)
);

create index idx_safra_talhoes_tenant on public.safra_talhoes(tenant_id);
create index idx_safra_talhoes_safra on public.safra_talhoes(safra_id);
create index idx_safra_talhoes_talhao on public.safra_talhoes(talhao_id);

alter table public.safra_talhoes enable row level security;

create policy "safra_talhoes: acesso restrito ao tenant"
  on public.safra_talhoes for all
  using (tenant_id = public.get_tenant_id())
  with check (tenant_id = public.get_tenant_id());

-- Preserva vínculos já existentes antes de remover a coluna antiga
insert into public.safra_talhoes (tenant_id, safra_id, talhao_id, area_ha)
select t.tenant_id, t.safra_id, t.id, t.area_ha
from public.talhoes t
where t.safra_id is not null;

alter table public.talhoes drop column if exists safra_id;
