-- ============================================================================
-- FARM SUL — Safra como hub de custo (Fase 1 do "Mapa de Custos")
-- Permite atribuir manutenções e abastecimentos a uma safra específica
-- (opcional — nem toda operação de equipamento é de uma safra só), e guarda
-- os parâmetros da simulação de produtividade/preço dentro da própria safra.
-- ============================================================================

alter table public.manutencoes add column if not exists safra_id uuid references public.safras(id) on delete set null;
alter table public.abastecimentos add column if not exists safra_id uuid references public.safras(id) on delete set null;

alter table public.safras add column if not exists sacas_previstas numeric(12,2);
alter table public.safras add column if not exists preco_saca_previsto numeric(10,2);

create index if not exists idx_manutencoes_safra on public.manutencoes(safra_id);
create index if not exists idx_abastecimentos_safra on public.abastecimentos(safra_id);
