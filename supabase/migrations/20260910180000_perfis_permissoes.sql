-- ============================================================================
-- FARM SUL — Permissões granulares por perfil
-- Cada perfil ganha um mapa {modulo: {ver, editar}} guardado em JSONB
-- ============================================================================

alter table public.perfis
  add column if not exists permissoes jsonb not null default '{}'::jsonb;

-- ----------------------------------------------------------------------------
-- Backfill: preenche as permissões dos perfis padrão semeados em
-- 20260910170000_perfis_padrao.sql, de acordo com suas descrições
-- ----------------------------------------------------------------------------
update public.perfis set permissoes = '{
  "equipe": {"ver": true, "editar": true},
  "agronomico": {"ver": true, "editar": true},
  "patrimonio": {"ver": true, "editar": true},
  "financeiro": {"ver": true, "editar": true},
  "fiscal": {"ver": true, "editar": true},
  "contratos": {"ver": true, "editar": true},
  "pecuaria": {"ver": true, "editar": true},
  "estoque": {"ver": true, "editar": true}
}'::jsonb
where nome in ('Proprietário', 'Gerente');

update public.perfis set permissoes = '{
  "agronomico": {"ver": true, "editar": true},
  "pecuaria": {"ver": true, "editar": true},
  "fiscal": {"ver": true, "editar": true},
  "contratos": {"ver": true, "editar": true}
}'::jsonb
where nome = 'Agronômico';

update public.perfis set permissoes = '{
  "agronomico": {"ver": true, "editar": false}
}'::jsonb
where nome in ('Operacional', 'Monitor');

update public.perfis set permissoes = '{
  "financeiro": {"ver": true, "editar": true},
  "patrimonio": {"ver": true, "editar": true},
  "contratos": {"ver": true, "editar": true},
  "fiscal": {"ver": true, "editar": true}
}'::jsonb
where nome = 'Financeiro';

update public.perfis set permissoes = '{
  "financeiro": {"ver": true, "editar": true}
}'::jsonb
where nome = 'Financeiro operacional';

update public.perfis set permissoes = '{
  "patrimonio": {"ver": true, "editar": true},
  "estoque": {"ver": true, "editar": true}
}'::jsonb
where nome = 'Estoque';

update public.perfis set permissoes = '{
  "fiscal": {"ver": true, "editar": true}
}'::jsonb
where nome = 'Emissor de NF-e';
