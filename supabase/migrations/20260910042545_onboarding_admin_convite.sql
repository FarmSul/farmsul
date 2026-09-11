-- ============================================================================
-- FARM SUL — Onboarding: suporte a usuário criado pelo Admin FarmSul
-- para um tenant JÁ EXISTENTE (em vez de sempre criar um tenant novo).
--
-- Quando o Admin FarmSul cria um usuário de cliente pela tela "Usuários dos
-- clientes", ele passa tenant_id + papel no metadata do usuário. Se esses
-- campos existirem, o trigger anexa o perfil ao tenant indicado em vez de
-- criar um tenant novo. O fluxo de autocadastro (signup público) continua
-- funcionando exatamente como antes.
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
