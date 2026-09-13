# Permissões

Estado real do controle de acesso por papel — não o ideal, o que está de fato
implementado hoje. `profiles.papel` aceita `proprietario`, `gerente`,
`operador`, `consultor` (`supabase/schema_atual.sql`).

## Onde a permissão é aplicada

Não existe uma camada de autorização central nem policies de RLS por comando
(select/insert/update/delete) diferenciando papel — com uma exceção
(`tenants`, ver abaixo). O controle é feito **na camada de Server Action**,
via `requerGestao()` (`src/lib/supabase/tenant.ts`), chamada no início da
função antes de qualquer leitura de `formData`.

Isso funciona porque **toda mutação do sistema passa por Server Action** —
`src/lib/supabase/client.ts` (cliente Supabase de browser) não é importado em
nenhum lugar do app hoje. Se algum dia existir um caminho de escrita direto do
cliente pro Supabase (ex: realtime, upload direto), esse ponto de checagem
deixa de valer sozinho e as regras precisam ir também pra RLS.

## O que cada papel pode fazer hoje

- **Proprietário / Gerente** — acesso total dentro do próprio tenant,
  incluindo excluir cadastros estruturais e editar dados da empresa.
- **Operador / Consultor** — mesmo acesso de leitura e de **registro
  operacional do dia a dia** (criar/editar lançamento financeiro, aplicação de
  insumo, abastecimento, manutenção, colheita) que proprietário/gerente, mas
  **não conseguem excluir cadastros estruturais** (ver lista abaixo) nem
  editar os dados da empresa em Configurações.

Hoje o sistema **não distingue operador de consultor** em nenhum ponto — os
dois têm exatamente o mesmo acesso. Se o negócio quiser diferenciar (ex:
consultor só devendo enxergar, não registrar), isso ainda precisa ser
definido e implementado.

## Ações restritas a Proprietário/Gerente (via `requerGestao`)

| Ação | Arquivo |
| --- | --- |
| Editar dados da empresa | `configuracoes/actions.ts` (`atualizarEmpresa`, via RLS na tabela `tenants`) |
| Excluir propriedade | `propriedades/actions.ts` |
| Excluir talhão | `talhoes/actions.ts` |
| Excluir safra | `safras/actions.ts` |
| Excluir equipamento | `patrimonio/actions.ts` |
| Excluir insumo (cadastro) | `estoque-insumos/actions.ts` |
| Excluir colaborador | `equipe/actions.ts` |
| Excluir perfil de permissão | `equipe/perfis/actions.ts` |
| Excluir contrato | `contratos/actions.ts` |
| Excluir nota fiscal | `fiscal/actions.ts` |
| Excluir lote (pecuária) | `pecuaria/actions.ts` |
| Excluir estação climática | `registros/actions.ts` |

`atualizarEmpresa` é o único caso enforced por **RLS** (`tenants: proprietario
ou gerente edita os proprios dados`, checando `public.get_papel()`), porque já
existia assim antes dessa rodada. Todo o resto é checado em TypeScript, no
início da Server Action.

## O que fica de propósito fora dessa restrição

Exclusão de registros **operacionais** (não cadastrais) continua aberta a
qualquer papel do tenant, por ser rotina de campo, não gestão estrutural:

- `excluirLancamento` (financeiro)
- `excluirManutencao`, `excluirAbastecimento` (patrimônio)
- `excluirAplicacao`, `excluirMovimentacaoInsumo` (estoque de insumos)
- `excluirMovimentacao` (estoque de produção / colheita)
- `excluirRegistroClimatico` (registros)

Isso foi uma decisão de escopo, não um esquecimento — mas vale revisão futura,
principalmente pra `excluirLancamento` (excluir uma despesa/receita distorce
o custo calculado de uma safra silenciosamente). Se quiser, dá pra restringir
essas também, mas isso tira de operador uma capacidade que hoje ele usa livre
no dia a dia (ex: corrigir um lançamento errado sem precisar do
gerente/proprietário).

## Ações de plataforma (Admin FarmSul)

Fora desse eixo — `src/app/(app)/admin/**` é protegido por
`requirePlatformAdmin()`/`public.is_admin()`, checando se o usuário é da
equipe FarmSul, não o papel dele dentro de um tenant.
