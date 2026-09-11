-- ============================================================================
-- FARM SUL — Admin da plataforma (equipe FarmSul)
-- Cria um papel "acima" dos tenants: alguém da equipe FarmSul que precisa
-- enxergar e gerenciar TODOS os tenants, não só o próprio.
--
-- Diferente de profiles.papel (proprietario/gerente/operador/consultor),
-- que é sempre relativo a UM tenant, um admin FarmSul não pertence a
-- nenhum tenant — por isso é uma tabela separada, não um papel em profiles.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- TABELA: admins
-- Qualquer usuário presente aqui é da equipe FarmSul e tem acesso total.
-- ----------------------------------------------------------------------------
create table public.admins (
  id         uuid primary key references auth.users(id) on delete cascade,
  criado_em  timestamptz not null default now()
);

comment on table public.admins is 'Usuários da equipe FarmSul com acesso administrativo a todos os tenants. Inserção manual apenas — não há signup público para isso.';

-- ----------------------------------------------------------------------------
-- FUNÇÃO AUXILIAR: is_admin()
-- Usada em todas as policies para liberar acesso total à equipe FarmSul.
-- Precisa existir ANTES de qualquer policy que a referencie.
-- ----------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (select 1 from public.admins where id = auth.uid());
$$;

comment on function public.is_admin() is 'True se o usuário autenticado atual é da equipe FarmSul (acesso total, todos os tenants)';

alter table public.admins enable row level security;

-- Um admin pode ver a lista de admins; ninguém mais consegue.
create policy "admins: visivel apenas para admins"
  on public.admins for select
  using (public.is_admin());

-- ----------------------------------------------------------------------------
-- POLICIES DE ADMIN — uma policy adicional por tabela, liberando tudo
-- para quem é admin. Como policies permissivas são combinadas com OR,
-- isso não interfere nas policies de isolamento por tenant já existentes:
-- o usuário comum continua restrito ao próprio tenant, e o admin passa
-- a enxergar/editar todos.
-- ----------------------------------------------------------------------------
create policy "admin: acesso total a tenants"
  on public.tenants for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "admin: acesso total a profiles"
  on public.profiles for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "admin: acesso total a propriedades"
  on public.propriedades for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "admin: acesso total a safras"
  on public.safras for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "admin: acesso total a talhoes"
  on public.talhoes for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "admin: acesso total a equipamentos"
  on public.equipamentos for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "admin: acesso total a manutencoes"
  on public.manutencoes for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "admin: acesso total a insumos"
  on public.insumos for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "admin: acesso total a movimentacoes_insumo"
  on public.movimentacoes_insumo for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "admin: acesso total a lancamentos_financeiros"
  on public.lancamentos_financeiros for all
  using (public.is_admin())
  with check (public.is_admin());

-- ----------------------------------------------------------------------------
-- COMO VIRAR ADMIN (feito manualmente por vocês, equipe FarmSul — não existe
-- signup público para isso):
--
--   1. Crie uma conta normal via signup (isso vira um tenant próprio, que
--      pode ser ignorado/descartado).
--   2. Pegue o seu user id em auth.users (painel do Supabase > Authentication).
--   3. Rode:
--        insert into public.admins (id) values ('SEU-USER-ID-AQUI');
--
-- A partir daí, esse usuário enxerga e edita todos os tenants do sistema.
-- ----------------------------------------------------------------------------
