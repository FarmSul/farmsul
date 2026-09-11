-- ============================================================================
-- FARM SUL — Patrimônio: tipo em dois níveis + ficha técnica completa
-- "tipo" passa a ser a categoria ampla (Máquina, Veículo, Silo, Pivô,
-- Benfeitoria); "tipo_maquina" só se aplica quando tipo = 'maquina'
-- (Trator, Colheitadeira, Pulverizador, Semeadeira, Adubador, Outro).
-- Também adiciona os campos de ficha técnica: modelo, fabricante, ano de
-- fabricação, vida útil, horímetro atual e observações.
-- ============================================================================

alter table public.equipamentos add column if not exists tipo_maquina text;
alter table public.equipamentos add column if not exists implemento boolean not null default false;
alter table public.equipamentos add column if not exists modelo text;
alter table public.equipamentos add column if not exists fabricante text;
alter table public.equipamentos add column if not exists ano_fabricacao integer;
alter table public.equipamentos add column if not exists vida_util_horas numeric(10,1);
alter table public.equipamentos add column if not exists horimetro_atual numeric(10,1);
alter table public.equipamentos add column if not exists observacoes text;

-- Solta o check antigo de "tipo" ANTES de reescrever os valores (o valor
-- novo "maquina" não existia no domínio antigo). Não assume o nome exato da
-- constraint, já que pode ter sido criada automaticamente pelo Postgres.
do $$
declare
  nome_constraint text;
begin
  select con.conname into nome_constraint
  from pg_constraint con
  join pg_class rel on rel.oid = con.conrelid
  join pg_namespace nsp on nsp.oid = rel.relnamespace
  where nsp.nspname = 'public'
    and rel.relname = 'equipamentos'
    and con.contype = 'c'
    and pg_get_constraintdef(con.oid) ilike '%tipo%'
    and pg_get_constraintdef(con.oid) not ilike '%status%';

  if nome_constraint is not null then
    execute format('alter table public.equipamentos drop constraint %I', nome_constraint);
  end if;
end $$;

-- Migra os dados existentes (tipo antigo era só "tipo de máquina" +
-- "veículo") pro novo esquema em dois níveis.
update public.equipamentos
set
  tipo_maquina = case tipo
    when 'trator' then 'trator'
    when 'colheitadeira' then 'colheitadeira'
    when 'pulverizador' then 'pulverizador'
    when 'implemento' then 'outro'
    when 'outro' then 'outro'
    else null
  end,
  implemento = (tipo = 'implemento'),
  tipo = case tipo
    when 'veiculo' then 'veiculo'
    else 'maquina'
  end
where tipo_maquina is null;

alter table public.equipamentos add constraint equipamentos_tipo_check
  check (tipo in ('maquina', 'veiculo', 'silo', 'pivo', 'benfeitoria'));

alter table public.equipamentos add constraint equipamentos_tipo_maquina_check
  check (tipo_maquina is null or tipo_maquina in ('trator', 'colheitadeira', 'pulverizador', 'semeadeira', 'adubador', 'outro'));
