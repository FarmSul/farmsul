-- ============================================================================
-- FARM SUL — Área da propriedade vira opcional
-- Caso real: a "sede" pode ter uma área pequena (ex: 8ha) enquanto os
-- talhões somam muito mais (terra arrendada em outros sítios, plantada
-- inteiramente sob a mesma propriedade/CNPJ). A área da propriedade não
-- precisa mais ser um número obrigatório — quem carrega a área de verdade
-- é cada talhão, independente do total da propriedade-mãe.
-- ============================================================================

alter table public.propriedades alter column area_ha drop not null;
