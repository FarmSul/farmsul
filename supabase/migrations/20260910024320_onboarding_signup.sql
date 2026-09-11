-- ============================================================================
-- FARM SUL — Onboarding automático
-- Quando alguém se cadastra pela primeira vez, criamos um tenant novo pra ele
-- e o tornamos "proprietario" desse tenant.
--
-- IMPORTANTE: isso cobre o caso de "novo cliente cria a própria conta".
-- Para o caso de "convidar um funcionário para um tenant já existente",
-- você vai precisar de um fluxo separado (ex: tabela de convites) —
-- avise quando quiser que eu monte isso também.
-- ============================================================================

create or replace function public.handle_new_user_signup()
returns trigger
language plpgsql
security definer
as $$
declare
  novo_tenant_id uuid;
  nome_fazenda   text;
begin
  -- Pega o nome da fazenda do metadata enviado no signup (ver nota no fim do arquivo)
  nome_fazenda := coalesce(new.raw_user_meta_data->>'nome_fazenda', 'Minha Fazenda');

  -- Cria o tenant
  insert into public.tenants (nome)
  values (nome_fazenda)
  returning id into novo_tenant_id;

  -- Cria o perfil do usuário como proprietário desse tenant
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

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user_signup();

-- ----------------------------------------------------------------------------
-- NOTA — como chamar isso do frontend (exemplo com supabase-js):
--
-- await supabase.auth.signUp({
--   email: 'produtor@exemplo.com',
--   password: 'senha-segura',
--   options: {
--     data: {
--       nome_completo: 'João da Silva',
--       nome_fazenda: 'Fazenda Boa Vista'
--     }
--   }
-- });
--
-- O trigger acima lê esses dois campos de raw_user_meta_data automaticamente.
-- ----------------------------------------------------------------------------
