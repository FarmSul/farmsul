-- ============================================================================
-- FARM SUL — Perfis padrão de acesso
-- Semeia perfis para todos os tenants existentes, com base nos módulos do
-- FarmSul (ver sidebar) e nos níveis de acesso observados no Aegro
-- ============================================================================

insert into public.perfis (tenant_id, nome, descricao)
select t.id, v.nome, v.descricao
from public.tenants t
cross join (
  values
    ('Proprietário', 'Acesso total à fazenda e ao administrativo. Pode adicionar colaboradores, alterar perfis e gerenciar a assinatura.'),
    ('Gerente', 'Acesso total à operação da fazenda. Pode adicionar colaboradores e alterar perfis.'),
    ('Agronômico', 'Pode editar Safras, Registros, Pecuária, Fiscal e Contratos.'),
    ('Operacional', 'Visualiza Safras e Registros. Pode adicionar observações e registrar atividades realizadas.'),
    ('Monitor', 'Visualiza Safras e Registros. Pode realizar monitoramentos e adicionar observações.'),
    ('Financeiro', 'Pode editar Financeiro, Patrimônio, Contratos e Fiscal.'),
    ('Financeiro operacional', 'Pode lançar despesas e receitas no Financeiro. Não visualiza saldo consolidado nem extratos.'),
    ('Estoque', 'Pode editar Patrimônio, Estq. Insumos, Estq. Produção e suas movimentações.'),
    ('Emissor de NF-e', 'Apenas emite notas fiscais pelo módulo Fiscal. Sem acesso a lançamentos financeiros ou saldo.')
) as v(nome, descricao)
where not exists (
  select 1 from public.perfis p where p.tenant_id = t.id and p.nome = v.nome
);
