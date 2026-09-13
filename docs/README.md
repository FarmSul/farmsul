# Documentação do FarmSul

Este diretório existe porque `CLAUDE.md` (regra 3.1) exige consultar a documentação
antes de alterar qualquer módulo. Os documentos aqui descrevem o estado **atual**
do sistema — não o roadmap nem a visão de produto completa.

- [`arquitetura.md`](./arquitetura.md) — stack, convenções de código, estrutura de pastas.
- [`banco-de-dados.md`](./banco-de-dados.md) — modelo de dados, multi-tenancy, RLS, migrations.
- [`modulos.md`](./modulos.md) — o que cada módulo do menu faz hoje, e o que está bloqueado/pendente.
- [`permissoes.md`](./permissoes.md) — o que cada papel (proprietário, gerente, operador, consultor) pode fazer de fato hoje.
- [`roadmap.md`](./roadmap.md) — prioridades e próximos passos conhecidos (aspiracional, não é estado atual).

## Produto, em uma frase

FarmSul é um SaaS multi-tenant de gestão rural: cada cliente (tenant) cadastra suas
propriedades, talhões e safras, e registra ao longo do ciclo da safra tudo que gera
custo ou produção — insumos aplicados, combustível, manutenção de máquinas, mão de
obra, colheita e venda — para acompanhar custo real por safra/talhão/hectare.

## Papéis de acesso

- **Admin FarmSul** — administra a plataforma inteira, todos os tenants (rotas
  `src/app/(app)/admin/**`). Bypass de RLS via `public.is_admin()`.
- **Proprietário, Gerente, Operador, Consultor** — papéis dentro de um tenant
  (`profiles.papel`), escopados ao próprio `tenant_id`. Ver
  [`permissoes.md`](./permissoes.md) pra o que cada um pode fazer de fato.
- **Colaboradores** — cadastro de pessoas da fazenda (`colaboradores`), não implica
  login/acesso ao sistema — é só referência (ex: responsável por uma manutenção).

## Antes de mexer em um módulo

1. Leia a seção correspondente em [`modulos.md`](./modulos.md) — o que já existe,
   o que está bloqueado, e por quê.
2. Se a mudança toca o banco, leia [`banco-de-dados.md`](./banco-de-dados.md) e
   `supabase/schema_atual.sql` (fonte de referência das tabelas — mas em caso de
   divergência, `supabase/migrations/*.sql` é que manda).
3. Rode `npx tsc --noEmit` e `npx eslint <arquivos>` antes de considerar concluído.
