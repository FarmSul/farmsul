-- ============================================================================
-- FARM SUL — Tamanho da embalagem do insumo
-- Alguns insumos (defensivos, principalmente) vêm em embalagens fechadas de
-- tamanho fixo (ex.: galão de 20 L, pacote de 5 kg). Guardamos esse tamanho
-- pra permitir informar o estoque como "quantidade de embalagens" na tela,
-- convertendo pra unidade base (kg/L) que o resto do sistema já usa.
-- ============================================================================

alter table public.insumos
  add column if not exists tamanho_embalagem numeric(10,2);
