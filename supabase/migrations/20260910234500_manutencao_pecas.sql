-- ============================================================================
-- FARM SUL — Custos detalhados da manutenção (mão de obra + peças)
-- `custo` continua sendo o total (mão de obra + soma das peças), calculado
-- pela aplicação no momento do cadastro.
-- ============================================================================

alter table public.manutencoes add column if not exists mao_de_obra numeric(12,2) not null default 0;
alter table public.manutencoes add column if not exists pecas jsonb not null default '[]'::jsonb;
