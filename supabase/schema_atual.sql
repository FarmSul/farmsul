-- ============================================================================
-- FARM SUL — Schema consolidado (snapshot de referência), IDEMPOTENTE
--
-- Esse arquivo pode ser rodado com segurança em qualquer estado do banco:
-- num projeto novo e vazio, ele cria tudo; neste projeto atual (onde tudo
-- já existe), ele roda inteiro sem dar erro nenhum e não muda nada — cada
-- comando checa antes se já existe (tabelas/índices via IF NOT EXISTS,
-- policies/trigger via DROP IF EXISTS antes de recriar).
--
-- Serve pra duas coisas:
--   1. Documentar em UM lugar só o estado final de tudo que foi aplicado
--      nas migrations em supabase/migrations/ (algumas escritas por mim,
--      outras rodadas direto no SQL Editor por outra sessão/pessoa).
--   2. Se um dia precisar recriar o banco do zero (projeto novo, ambiente
--      de teste) ou só "garantir" que está tudo certo no projeto atual,
--      rodar esse arquivo único resolve, sem colar vários arquivos.
--
-- Gerado por leitura manual das migrations em 2026-09-10 (sem acesso a
-- Docker/psql neste ambiente pra fazer um pg_dump de verdade — se algo aqui
-- divergir do banco real, o `supabase/migrations/*.sql` é que manda, não
-- este arquivo).
-- ============================================================================

create extension if not exists "pgcrypto";

-- ============================================================================
-- TABELAS
-- ============================================================================

create table if not exists public.tenants (
  id           uuid primary key default gen_random_uuid(),
  nome         text not null,
  plano        text not null default 'essencial' check (plano in ('essencial', 'avancado', 'consultoria')),
  cnpj_cpf     text,
  responsavel  text,
  uf           text,
  cidade       text,
  cep          text,
  criado_em    timestamptz not null default now()
);

comment on table public.tenants is 'Cada tenant representa uma fazenda ou grupo de fazendas cliente do FarmSul';

create table if not exists public.profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  tenant_id      uuid not null references public.tenants(id) on delete cascade,
  nome_completo  text,
  papel          text not null default 'operador' check (papel in ('proprietario', 'gerente', 'operador', 'consultor')),
  avatar_url     text,
  telefone       text,
  criado_em      timestamptz not null default now()
);

comment on table public.profiles is 'Perfil de cada usuário, vinculado a um tenant e com papel de acesso definido';

create table if not exists public.admins (
  id         uuid primary key references auth.users(id) on delete cascade,
  criado_em  timestamptz not null default now()
);

comment on table public.admins is 'Usuários da equipe FarmSul com acesso administrativo a todos os tenants. Inserção manual apenas — não há signup público para isso.';

create table if not exists public.propriedades (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references public.tenants(id) on delete cascade,
  nome           text not null,
  area_ha        numeric(10,2) not null check (area_ha > 0),
  municipio      text,
  estado         text default 'MS',
  latitude       numeric(9,6),
  longitude      numeric(9,6),
  criado_em      timestamptz not null default now()
);

create table if not exists public.safras (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references public.tenants(id) on delete cascade,
  nome         text not null,
  cultura      text not null constraint safras_cultura_check
                 check (cultura in ('soja', 'milho', 'sorgo', 'milheto', 'trigo', 'feijao', 'arroz', 'algodao', 'outra')),
  data_inicio  date not null,
  data_fim     date,
  tipo_custo   text not null default 'automatico' check (tipo_custo in ('automatico', 'manual')),
  criado_em    timestamptz not null default now()
);

create table if not exists public.talhoes (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references public.tenants(id) on delete cascade,
  propriedade_id uuid not null references public.propriedades(id) on delete cascade,
  nome           text not null,
  area_ha        numeric(10,2) not null check (area_ha > 0),
  geom           jsonb,
  criado_em      timestamptz not null default now()
);

comment on column public.talhoes.geom is 'Contorno desenhado no mapa (GeoJSON Polygon). area_ha continua sendo um campo manual, independente do desenho.';

-- Uma safra pode usar várias áreas (talhões), cada uma com um tamanho
-- utilizado que pode ser menor que a área total do talhão.
create table if not exists public.safra_talhoes (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references public.tenants(id) on delete cascade,
  safra_id     uuid not null references public.safras(id) on delete cascade,
  talhao_id    uuid not null references public.talhoes(id) on delete cascade,
  area_ha      numeric(10,2) not null check (area_ha > 0),
  criado_em    timestamptz not null default now(),
  unique (safra_id, talhao_id)
);

create table if not exists public.equipamentos (
  id                 uuid primary key default gen_random_uuid(),
  tenant_id          uuid not null references public.tenants(id) on delete cascade,
  nome               text not null,
  tipo               text not null check (tipo in ('maquina', 'veiculo', 'silo', 'pivo', 'benfeitoria')),
  tipo_maquina       text check (tipo_maquina is null or tipo_maquina in ('trator', 'colheitadeira', 'pulverizador', 'semeadeira', 'adubador', 'outro')),
  implemento         boolean not null default false,
  modelo             text,
  fabricante         text,
  ano_fabricacao     integer,
  vida_util_horas    numeric(10,1),
  horimetro_atual    numeric(10,1),
  observacoes        text,
  data_aquisicao     date,
  valor_aquisicao    numeric(12,2),
  status             text not null default 'ativo' check (status in ('ativo', 'manutencao', 'inativo')),
  foto_url           text,
  criado_em          timestamptz not null default now()
);

create table if not exists public.manutencoes (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references public.tenants(id) on delete cascade,
  equipamento_id uuid not null references public.equipamentos(id) on delete cascade,
  data           date not null default current_date,
  descricao      text not null,
  custo          numeric(10,2) default 0,
  mao_de_obra    numeric(12,2) not null default 0,
  pecas          jsonb not null default '[]'::jsonb,
  nota_fiscal_url text,
  criado_em      timestamptz not null default now()
);

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

create table if not exists public.insumos (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references public.tenants(id) on delete cascade,
  nome          text not null,
  categoria     text not null check (categoria in ('semente', 'fertilizante', 'defensivo', 'combustivel', 'outro')),
  unidade       text not null check (unidade in ('kg', 'l', 'saca', 'un')),
  estoque_atual numeric(12,2) not null default 0,
  custo_medio   numeric(12,4) default 0,
  criado_em     timestamptz not null default now()
);

create table if not exists public.movimentacoes_insumo (
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

create table if not exists public.lancamentos_financeiros (
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

create table if not exists public.perfis (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references public.tenants(id) on delete cascade,
  nome         text not null,
  descricao    text,
  permissoes   jsonb not null default '{}'::jsonb,
  criado_em    timestamptz not null default now()
);

comment on column public.perfis.permissoes is 'Mapa {modulo: {ver, editar}}, ex: {"financeiro": {"ver": true, "editar": false}}';

create table if not exists public.colaboradores (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references public.tenants(id) on delete cascade,
  perfil_id    uuid references public.perfis(id) on delete set null,
  nome         text not null,
  email        text,
  telefone     text,
  cpf          text,
  criado_em    timestamptz not null default now()
);

comment on table public.colaboradores is 'Cadastro de pessoas da fazenda — não implica em acesso de login ao sistema.';

-- Precisa vir depois da tabela colaboradores existir (referência).
alter table public.manutencoes
  add column if not exists responsavel_id uuid references public.colaboradores(id) on delete set null;

-- ============================================================================
-- ÍNDICES
-- ============================================================================

create index if not exists idx_profiles_tenant on public.profiles(tenant_id);
create index if not exists idx_propriedades_tenant on public.propriedades(tenant_id);
create index if not exists idx_safras_tenant on public.safras(tenant_id);
create index if not exists idx_talhoes_tenant on public.talhoes(tenant_id);
create index if not exists idx_talhoes_propriedade on public.talhoes(propriedade_id);
create index if not exists idx_safra_talhoes_tenant on public.safra_talhoes(tenant_id);
create index if not exists idx_safra_talhoes_safra on public.safra_talhoes(safra_id);
create index if not exists idx_safra_talhoes_talhao on public.safra_talhoes(talhao_id);
create index if not exists idx_equipamentos_tenant on public.equipamentos(tenant_id);
create index if not exists idx_manutencoes_tenant on public.manutencoes(tenant_id);
create index if not exists idx_estacoes_climaticas_tenant on public.estacoes_climaticas(tenant_id);
create index if not exists idx_estacoes_climaticas_propriedade on public.estacoes_climaticas(propriedade_id);
create index if not exists idx_registros_climaticos_tenant on public.registros_climaticos(tenant_id);
create index if not exists idx_registros_climaticos_estacao on public.registros_climaticos(estacao_id);
create index if not exists idx_manutencoes_equipamento on public.manutencoes(equipamento_id);
create index if not exists idx_abastecimentos_tenant on public.abastecimentos(tenant_id);
create index if not exists idx_abastecimentos_equipamento on public.abastecimentos(equipamento_id);
create index if not exists idx_abastecimentos_insumo on public.abastecimentos(insumo_id);
create index if not exists idx_insumos_tenant on public.insumos(tenant_id);
create index if not exists idx_movimentacoes_tenant on public.movimentacoes_insumo(tenant_id);
create index if not exists idx_movimentacoes_insumo on public.movimentacoes_insumo(insumo_id);
create index if not exists idx_financeiro_tenant on public.lancamentos_financeiros(tenant_id);
create index if not exists idx_financeiro_safra on public.lancamentos_financeiros(safra_id);
create index if not exists idx_perfis_tenant on public.perfis(tenant_id);
create index if not exists idx_colaboradores_tenant on public.colaboradores(tenant_id);
create index if not exists idx_colaboradores_perfil on public.colaboradores(perfil_id);

-- ============================================================================
-- FUNÇÕES AUXILIARES (usadas nas policies de RLS abaixo)
-- create or replace já é idempotente por natureza.
-- ============================================================================

create or replace function public.get_tenant_id()
returns uuid
language sql
security definer
stable
as $$
  select tenant_id from public.profiles where id = auth.uid();
$$;

comment on function public.get_tenant_id() is 'Retorna o tenant_id do usuário autenticado atual — usado em todas as policies de RLS';

create or replace function public.get_papel()
returns text
language sql
security definer
stable
as $$
  select papel from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (select 1 from public.admins where id = auth.uid());
$$;

comment on function public.is_admin() is 'True se o usuário autenticado atual é da equipe FarmSul (acesso total, todos os tenants)';

-- ============================================================================
-- ONBOARDING — cria tenant + profile automaticamente no signup
-- Se raw_user_meta_data trouxer tenant_id (fluxo do Admin FarmSul criando
-- usuário pra um cliente existente), anexa ao tenant indicado em vez de
-- criar um novo. Sem isso, cria tenant novo e vira proprietario dele.
-- ============================================================================

create or replace function public.handle_new_user_signup()
returns trigger
language plpgsql
security definer
as $$
declare
  novo_tenant_id   uuid;
  nome_fazenda     text;
  tenant_indicado  uuid;
  papel_indicado   text;
begin
  tenant_indicado := nullif(new.raw_user_meta_data->>'tenant_id', '')::uuid;

  if tenant_indicado is not null then
    papel_indicado := coalesce(new.raw_user_meta_data->>'papel', 'operador');

    insert into public.profiles (id, tenant_id, nome_completo, papel)
    values (
      new.id,
      tenant_indicado,
      coalesce(new.raw_user_meta_data->>'nome_completo', new.email),
      papel_indicado
    );

    return new;
  end if;

  nome_fazenda := coalesce(new.raw_user_meta_data->>'nome_fazenda', 'Minha Fazenda');

  insert into public.tenants (nome)
  values (nome_fazenda)
  returning id into novo_tenant_id;

  insert into public.profiles (id, tenant_id, nome_completo, papel)
  values (
    new.id,
    novo_tenant_id,
    coalesce(new.raw_user_meta_data->>'nome_completo', new.email),
    'proprietario'
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user_signup();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ENABLE ROW LEVEL SECURITY já é idempotente (não erra se já estiver ligado).
-- ============================================================================

alter table public.tenants enable row level security;
alter table public.profiles enable row level security;
alter table public.admins enable row level security;
alter table public.propriedades enable row level security;
alter table public.safras enable row level security;
alter table public.talhoes enable row level security;
alter table public.safra_talhoes enable row level security;
alter table public.equipamentos enable row level security;
alter table public.manutencoes enable row level security;
alter table public.estacoes_climaticas enable row level security;
alter table public.registros_climaticos enable row level security;
alter table public.insumos enable row level security;
alter table public.movimentacoes_insumo enable row level security;
alter table public.abastecimentos enable row level security;
alter table public.lancamentos_financeiros enable row level security;
alter table public.perfis enable row level security;
alter table public.colaboradores enable row level security;

-- Postgres não tem "create policy if not exists" — por isso todo policy
-- abaixo derruba a versão antiga (se existir) antes de recriar.

-- TENANTS
drop policy if exists "tenant visivel apenas para seus membros" on public.tenants;
create policy "tenant visivel apenas para seus membros"
  on public.tenants for select
  using (id = public.get_tenant_id());

drop policy if exists "tenant: proprietario ou gerente edita os proprios dados" on public.tenants;
create policy "tenant: proprietario ou gerente edita os proprios dados"
  on public.tenants for update
  using (id = public.get_tenant_id() and public.get_papel() in ('proprietario', 'gerente'))
  with check (id = public.get_tenant_id() and public.get_papel() in ('proprietario', 'gerente'));

drop policy if exists "admin: acesso total a tenants" on public.tenants;
create policy "admin: acesso total a tenants"
  on public.tenants for all
  using (public.is_admin())
  with check (public.is_admin());

-- PROFILES
drop policy if exists "profiles visiveis dentro do tenant" on public.profiles;
create policy "profiles visiveis dentro do tenant"
  on public.profiles for select
  using (tenant_id = public.get_tenant_id());

drop policy if exists "usuario pode editar o proprio perfil" on public.profiles;
create policy "usuario pode editar o proprio perfil"
  on public.profiles for update
  using (id = auth.uid());

drop policy if exists "admin: acesso total a profiles" on public.profiles;
create policy "admin: acesso total a profiles"
  on public.profiles for all
  using (public.is_admin())
  with check (public.is_admin());

-- ADMINS
drop policy if exists "admins: visivel apenas para admins" on public.admins;
create policy "admins: visivel apenas para admins"
  on public.admins for select
  using (public.is_admin());

-- Padrão replicado nas tabelas de negócio: acesso total (select/insert/
-- update/delete) restrito ao próprio tenant, mais o bypass de admin.
drop policy if exists "propriedades: acesso restrito ao tenant" on public.propriedades;
create policy "propriedades: acesso restrito ao tenant"
  on public.propriedades for all
  using (tenant_id = public.get_tenant_id())
  with check (tenant_id = public.get_tenant_id());

drop policy if exists "admin: acesso total a propriedades" on public.propriedades;
create policy "admin: acesso total a propriedades"
  on public.propriedades for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "safras: acesso restrito ao tenant" on public.safras;
create policy "safras: acesso restrito ao tenant"
  on public.safras for all
  using (tenant_id = public.get_tenant_id())
  with check (tenant_id = public.get_tenant_id());

drop policy if exists "admin: acesso total a safras" on public.safras;
create policy "admin: acesso total a safras"
  on public.safras for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "talhoes: acesso restrito ao tenant" on public.talhoes;
create policy "talhoes: acesso restrito ao tenant"
  on public.talhoes for all
  using (tenant_id = public.get_tenant_id())
  with check (tenant_id = public.get_tenant_id());

drop policy if exists "admin: acesso total a talhoes" on public.talhoes;
create policy "admin: acesso total a talhoes"
  on public.talhoes for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "safra_talhoes: acesso restrito ao tenant" on public.safra_talhoes;
create policy "safra_talhoes: acesso restrito ao tenant"
  on public.safra_talhoes for all
  using (tenant_id = public.get_tenant_id())
  with check (tenant_id = public.get_tenant_id());

drop policy if exists "equipamentos: acesso restrito ao tenant" on public.equipamentos;
create policy "equipamentos: acesso restrito ao tenant"
  on public.equipamentos for all
  using (tenant_id = public.get_tenant_id())
  with check (tenant_id = public.get_tenant_id());

drop policy if exists "admin: acesso total a equipamentos" on public.equipamentos;
create policy "admin: acesso total a equipamentos"
  on public.equipamentos for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "manutencoes: acesso restrito ao tenant" on public.manutencoes;
create policy "manutencoes: acesso restrito ao tenant"
  on public.manutencoes for all
  using (tenant_id = public.get_tenant_id())
  with check (tenant_id = public.get_tenant_id());

drop policy if exists "admin: acesso total a manutencoes" on public.manutencoes;
create policy "admin: acesso total a manutencoes"
  on public.manutencoes for all
  using (public.is_admin())
  with check (public.is_admin());

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

drop policy if exists "insumos: acesso restrito ao tenant" on public.insumos;
create policy "insumos: acesso restrito ao tenant"
  on public.insumos for all
  using (tenant_id = public.get_tenant_id())
  with check (tenant_id = public.get_tenant_id());

drop policy if exists "admin: acesso total a insumos" on public.insumos;
create policy "admin: acesso total a insumos"
  on public.insumos for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "movimentacoes: acesso restrito ao tenant" on public.movimentacoes_insumo;
create policy "movimentacoes: acesso restrito ao tenant"
  on public.movimentacoes_insumo for all
  using (tenant_id = public.get_tenant_id())
  with check (tenant_id = public.get_tenant_id());

drop policy if exists "admin: acesso total a movimentacoes_insumo" on public.movimentacoes_insumo;
create policy "admin: acesso total a movimentacoes_insumo"
  on public.movimentacoes_insumo for all
  using (public.is_admin())
  with check (public.is_admin());

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

-- LANCAMENTOS_FINANCEIROS: exclusão restrita a proprietario/gerente.
drop policy if exists "financeiro: select dentro do tenant" on public.lancamentos_financeiros;
create policy "financeiro: select dentro do tenant"
  on public.lancamentos_financeiros for select
  using (tenant_id = public.get_tenant_id());

drop policy if exists "financeiro: insert dentro do tenant" on public.lancamentos_financeiros;
create policy "financeiro: insert dentro do tenant"
  on public.lancamentos_financeiros for insert
  with check (tenant_id = public.get_tenant_id());

drop policy if exists "financeiro: update dentro do tenant" on public.lancamentos_financeiros;
create policy "financeiro: update dentro do tenant"
  on public.lancamentos_financeiros for update
  using (tenant_id = public.get_tenant_id())
  with check (tenant_id = public.get_tenant_id());

drop policy if exists "financeiro: delete apenas proprietario ou gerente" on public.lancamentos_financeiros;
create policy "financeiro: delete apenas proprietario ou gerente"
  on public.lancamentos_financeiros for delete
  using (
    tenant_id = public.get_tenant_id()
    and public.get_papel() in ('proprietario', 'gerente')
  );

drop policy if exists "admin: acesso total a lancamentos_financeiros" on public.lancamentos_financeiros;
create policy "admin: acesso total a lancamentos_financeiros"
  on public.lancamentos_financeiros for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "perfis: acesso restrito ao tenant" on public.perfis;
create policy "perfis: acesso restrito ao tenant"
  on public.perfis for all
  using (tenant_id = public.get_tenant_id())
  with check (tenant_id = public.get_tenant_id());

drop policy if exists "colaboradores: acesso restrito ao tenant" on public.colaboradores;
create policy "colaboradores: acesso restrito ao tenant"
  on public.colaboradores for all
  using (tenant_id = public.get_tenant_id())
  with check (tenant_id = public.get_tenant_id());

-- ============================================================================
-- STORAGE — bucket de avatares de perfil
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do nothing;

drop policy if exists "avatares sao publicos para leitura" on storage.objects;
create policy "avatares sao publicos para leitura"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "usuario envia o proprio avatar" on storage.objects;
create policy "usuario envia o proprio avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "usuario atualiza o proprio avatar" on storage.objects;
create policy "usuario atualiza o proprio avatar"
  on storage.objects for update
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "usuario remove o proprio avatar" on storage.objects;
create policy "usuario remove o proprio avatar"
  on storage.objects for delete
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- ============================================================================
-- STORAGE — bucket de fotos de equipamentos (patrimônio)
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('equipamentos', 'equipamentos', true, 5242880, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do nothing;

drop policy if exists "fotos de equipamentos sao publicas para leitura" on storage.objects;
create policy "fotos de equipamentos sao publicas para leitura"
  on storage.objects for select
  using (bucket_id = 'equipamentos');

drop policy if exists "tenant envia foto do proprio equipamento" on storage.objects;
create policy "tenant envia foto do proprio equipamento"
  on storage.objects for insert
  with check (bucket_id = 'equipamentos' and (storage.foldername(name))[1] = public.get_tenant_id()::text);

drop policy if exists "tenant atualiza foto do proprio equipamento" on storage.objects;
create policy "tenant atualiza foto do proprio equipamento"
  on storage.objects for update
  using (bucket_id = 'equipamentos' and (storage.foldername(name))[1] = public.get_tenant_id()::text);

drop policy if exists "tenant remove foto do proprio equipamento" on storage.objects;
create policy "tenant remove foto do proprio equipamento"
  on storage.objects for delete
  using (bucket_id = 'equipamentos' and (storage.foldername(name))[1] = public.get_tenant_id()::text);

-- ============================================================================
-- STORAGE — bucket de notas fiscais de manutenção
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'notas-fiscais',
  'notas-fiscais',
  true,
  10485760,
  array['image/png', 'image/jpeg', 'image/webp', 'application/pdf']
)
on conflict (id) do nothing;

drop policy if exists "notas fiscais sao publicas para leitura" on storage.objects;
create policy "notas fiscais sao publicas para leitura"
  on storage.objects for select
  using (bucket_id = 'notas-fiscais');

drop policy if exists "tenant envia nota fiscal da propria manutencao" on storage.objects;
create policy "tenant envia nota fiscal da propria manutencao"
  on storage.objects for insert
  with check (bucket_id = 'notas-fiscais' and (storage.foldername(name))[1] = public.get_tenant_id()::text);

drop policy if exists "tenant atualiza nota fiscal da propria manutencao" on storage.objects;
create policy "tenant atualiza nota fiscal da propria manutencao"
  on storage.objects for update
  using (bucket_id = 'notas-fiscais' and (storage.foldername(name))[1] = public.get_tenant_id()::text);

drop policy if exists "tenant remove nota fiscal da propria manutencao" on storage.objects;
create policy "tenant remove nota fiscal da propria manutencao"
  on storage.objects for delete
  using (bucket_id = 'notas-fiscais' and (storage.foldername(name))[1] = public.get_tenant_id()::text);

-- ============================================================================
-- SEED — perfis de acesso padrão
-- Já é idempotente por natureza (WHERE NOT EXISTS / só atualiza quem ainda
-- está com permissoes = '{}'::jsonb, ou seja, quem nunca foi preenchido).
-- ============================================================================

insert into public.perfis (tenant_id, nome, descricao)
select t.id, v.nome, v.descricao
from public.tenants t
cross join (
  values
    ('Proprietário', 'Acesso total à fazenda e ao administrativo. Pode adicionar colaboradores, alterar perfis e gerenciar a assinatura.'),
    ('Gerente', 'Acesso total à operação da fazenda. Pode adicionar colaboradores e alterar perfis.'),
    ('Agronômico', 'Pode editar Safras, Registros, Pecuária, Fiscal e Contratos.'),
    ('Operacional', 'Visualiza Safras e Registros. Pode adicionar observações e registrar atividades realizadas.'),
    ('Monitor', 'Visualiza Safras e Registros. Pode realizar monitoramentos e adicionar observações.'),
    ('Financeiro', 'Pode editar Financeiro, Patrimônio, Contratos e Fiscal.'),
    ('Financeiro operacional', 'Pode lançar despesas e receitas no Financeiro. Não visualiza saldo consolidado nem extratos.'),
    ('Estoque', 'Pode editar Patrimônio, Estq. Insumos, Estq. Produção e suas movimentações.'),
    ('Emissor de NF-e', 'Apenas emite notas fiscais pelo módulo Fiscal. Sem acesso a lançamentos financeiros ou saldo.')
) as v(nome, descricao)
where not exists (
  select 1 from public.perfis p where p.tenant_id = t.id and p.nome = v.nome
);

update public.perfis set permissoes = '{
  "equipe": {"ver": true, "editar": true},
  "agronomico": {"ver": true, "editar": true},
  "patrimonio": {"ver": true, "editar": true},
  "financeiro": {"ver": true, "editar": true},
  "fiscal": {"ver": true, "editar": true},
  "contratos": {"ver": true, "editar": true},
  "pecuaria": {"ver": true, "editar": true},
  "estoque": {"ver": true, "editar": true}
}'::jsonb
where nome in ('Proprietário', 'Gerente') and permissoes = '{}'::jsonb;

update public.perfis set permissoes = '{
  "agronomico": {"ver": true, "editar": true},
  "pecuaria": {"ver": true, "editar": true},
  "fiscal": {"ver": true, "editar": true},
  "contratos": {"ver": true, "editar": true}
}'::jsonb
where nome = 'Agronômico' and permissoes = '{}'::jsonb;

update public.perfis set permissoes = '{
  "agronomico": {"ver": true, "editar": false}
}'::jsonb
where nome in ('Operacional', 'Monitor') and permissoes = '{}'::jsonb;

update public.perfis set permissoes = '{
  "financeiro": {"ver": true, "editar": true},
  "patrimonio": {"ver": true, "editar": true},
  "contratos": {"ver": true, "editar": true},
  "fiscal": {"ver": true, "editar": true}
}'::jsonb
where nome = 'Financeiro' and permissoes = '{}'::jsonb;

update public.perfis set permissoes = '{
  "financeiro": {"ver": true, "editar": true}
}'::jsonb
where nome = 'Financeiro operacional' and permissoes = '{}'::jsonb;

update public.perfis set permissoes = '{
  "patrimonio": {"ver": true, "editar": true},
  "estoque": {"ver": true, "editar": true}
}'::jsonb
where nome = 'Estoque' and permissoes = '{}'::jsonb;

update public.perfis set permissoes = '{
  "fiscal": {"ver": true, "editar": true}
}'::jsonb
where nome = 'Emissor de NF-e' and permissoes = '{}'::jsonb;
