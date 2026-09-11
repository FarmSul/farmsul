-- ============================================================================
-- FARM SUL — Tipo de custo da safra (automático/manual), inspirado no fluxo do Aegro
-- ============================================================================

alter table public.safras
  add column if not exists tipo_custo text not null default 'automatico'
    check (tipo_custo in ('automatico', 'manual'));
