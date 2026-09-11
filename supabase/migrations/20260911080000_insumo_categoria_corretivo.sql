-- Adiciona "corretivo" às categorias de insumo (calcário, gesso, cama de
-- frango...) para poder filtrar a "Nova aplicação" por etapa: só mostrar
-- corretivos na Preparação e Correção, sementes/fertilizante no Plantio,
-- defensivos/fertilizante no Controle e Manejo.

alter table public.insumos drop constraint if exists insumos_categoria_check;
alter table public.insumos
  add constraint insumos_categoria_check
  check (categoria in ('semente', 'fertilizante', 'defensivo', 'corretivo', 'combustivel', 'outro'));
