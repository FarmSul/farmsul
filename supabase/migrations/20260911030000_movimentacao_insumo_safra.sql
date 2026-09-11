-- ============================================================================
-- FARM SUL — Fase 2 do Mapa de Custos: aplicação de insumos
-- Permite vincular uma movimentação de insumo (entrada/aplicação) a uma
-- safra, no mesmo padrão já usado em manutenções e abastecimentos.
-- ============================================================================

alter table public.movimentacoes_insumo add column if not exists safra_id uuid references public.safras(id) on delete set null;

create index if not exists idx_movimentacoes_insumo_safra on public.movimentacoes_insumo(safra_id);
