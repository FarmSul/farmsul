-- ============================================================================
-- FARM SUL — Colaborador responsável pela manutenção
-- ============================================================================

alter table public.manutencoes
  add column if not exists responsavel_id uuid references public.colaboradores(id) on delete set null;
