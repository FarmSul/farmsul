# Roadmap

Este documento é **aspiracional** — ao contrário dos outros em `docs/`, ele não
descreve o estado atual do sistema, e sim prioridades e próximos passos ainda
não implementados. Nada aqui deve ser tratado como já construído.

## Curto prazo (destravar o que já existe)

- **Financeiro, Pecuária e Estoque de Produção** — hoje bloqueados no menu
  (`src/components/app-shell.tsx`, `locked: true`). O backend e boa parte da
  UI já existem (inclusive usados de dentro de Safras); falta revisar cada
  tela standalone antes de liberar.
- **Diferenciar Operador de Consultor** — hoje os dois papéis têm exatamente
  o mesmo acesso (ver `docs/permissoes.md`). Precisa de uma decisão de
  negócio: o que um consultor externo deveria e não deveria poder fazer.
- **Revisar exclusão de registros operacionais com impacto financeiro** —
  `excluirLancamento`, `excluirManutencao`, `excluirAbastecimento` continuam
  abertos a qualquer papel do tenant. Avaliar se isso deve virar uma ação
  restrita a proprietário/gerente, ou se deve gerar histórico de auditoria em
  vez de bloquear.

## Médio prazo (fechar lacunas de negócio identificadas)

- **Limites e recursos por plano** — `src/lib/planos.ts` só tem nome, preço e
  uma frase de posicionamento. Não há limite de propriedades/talhões/usuários
  por plano nem cobrança recorrente de verdade. Precisa de decisão comercial
  antes de qualquer implementação (ver histórico de decisão em
  `docs/permissoes.md` e nas conversas do projeto).
- **Estoque mínimo por insumo** — o alerta de estoque no dashboard hoje só
  pega o caso extremo (`estoque_atual <= 0`). Um campo de estoque mínimo
  cadastrável por insumo permitiria alertar antes de zerar.
- **Calendário agronômico pra mais culturas** — `calendario-agronomico.ts`
  cobre hoje só Soja e Milho. Sorgo, milheto, trigo, feijão, arroz e algodão
  ainda caem no aviso de "calendário não disponível".
- **Auditoria de ações críticas** — `CLAUDE.md` (regra 6) pede trilha de
  auditoria pra operações críticas; hoje não existe log de quem fez o quê,
  além do `criado_em` de cada registro.

## Mais adiante (decisões arquiteturais maiores)

- **RLS por comando (select/insert/update/delete)** — hoje o controle de
  papel é majoritariamente feito na Server Action, não em RLS (única exceção:
  `tenants`). Isso é suficiente enquanto toda escrita passa por Server Action
  (`src/lib/supabase/client.ts` não é usado hoje) — mas se um dia existir
  escrita direta do cliente (realtime, upload direto), as regras de papel
  também precisam ir pra RLS.
- **Camada de API própria** — hoje não existe; Server Actions falam direto
  com o Supabase. Só reconsiderar isso se surgir necessidade real (app
  mobile nativo, integração de terceiros).
