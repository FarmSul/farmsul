-- ============================================================================
-- FARM SUL — Desenho da área do talhão (contorno desenhado no mapa)
-- Guardamos como GeoJSON (Polygon) em jsonb; a área em hectares continua
-- sendo um campo manual independente do desenho, igual ao fluxo do Aegro.
-- ============================================================================

alter table public.talhoes
  add column if not exists geom jsonb;
