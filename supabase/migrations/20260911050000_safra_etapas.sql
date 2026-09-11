-- ============================================================================
-- FARM SUL — Etapas do ciclo da safra
-- Preparação e correção / Plantio / Controle e manejo / Colheita / Venda.
-- Cada registro de custo/movimento que já pode se vincular a uma safra
-- (aplicação de insumo, manutenção, abastecimento, lançamento financeiro,
-- movimentação de produção) agora também pode marcar em qual etapa
-- aconteceu, pra reconstruir a "árvore cronológica" do histórico da safra.
-- ============================================================================

alter table public.movimentacoes_insumo add column if not exists etapa text;
alter table public.manutencoes add column if not exists etapa text;
alter table public.abastecimentos add column if not exists etapa text;
alter table public.lancamentos_financeiros add column if not exists etapa text;
alter table public.estoque_producao add column if not exists etapa text;

do $$
declare
  tabela text;
  nome_constraint text;
  check_etapa text := $chk$ etapa is null or etapa in ('preparo_correcao', 'plantio', 'controle_manejo', 'colheita', 'venda') $chk$;
begin
  foreach tabela in array array['movimentacoes_insumo', 'manutencoes', 'abastecimentos', 'lancamentos_financeiros', 'estoque_producao']
  loop
    nome_constraint := tabela || '_etapa_check';

    select con.conname into nome_constraint
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    where rel.relname = tabela and con.conname = nome_constraint;

    if nome_constraint is null then
      execute format('alter table public.%I add constraint %I check (%s)', tabela, tabela || '_etapa_check', check_etapa);
    end if;
  end loop;
end $$;

create index if not exists idx_movimentacoes_insumo_etapa on public.movimentacoes_insumo(etapa);
create index if not exists idx_manutencoes_etapa on public.manutencoes(etapa);
create index if not exists idx_abastecimentos_etapa on public.abastecimentos(etapa);
create index if not exists idx_lancamentos_financeiros_etapa on public.lancamentos_financeiros(etapa);
create index if not exists idx_estoque_producao_etapa on public.estoque_producao(etapa);
