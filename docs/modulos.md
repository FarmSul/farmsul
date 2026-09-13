# Módulos

Status real de cada item do menu (`src/components/app-shell.tsx`,
`TENANT_NAV_ITEMS`). "Bloqueado" = aparece cinza no menu, sem link, ícone de
cadeado — a página e as ações de banco por trás continuam existindo, só o
acesso direto pelo menu foi desligado.

## Início (`/dashboard`)

Resumo do dia a dia: card por safra ativa (dias desde o início, custo
acumulado), calendário de manejo de referência (dias após início → fases
típicas de manejo, hoje só pra Soja e Milho, `calendario-agronomico.ts` —
estimativa genérica, não é recomendação agronômica) e atividade recente
(últimos eventos das safras ativas).

## Safras (`/safras`, `/safras/[id]`)

Módulo mais desenvolvido. Cadastro de safra (cultura, período, talhões e área
alocada). Tela de detalhe com abas:

- **Visão Geral** — custo total, receita, margem, custo/ha, custo por origem.
- **Histórico** — árvore cronológica agrupada por etapa (Preparação e Correção
  → Plantio → Controle e Manejo → Colheita → Venda), cada evento clicável pra
  editar; mostra também gasto total e gasto/ha por etapa e por talhão.
- **Lançamentos** — hub de ações por etapa (Nova aplicação, Abastecer,
  Registrar colheita, Novo lançamento), cada etapa só mostra as ações e
  categorias de insumo que fazem sentido pra ela.
- **Simulação** — sacas previstas × preço → receita/margem projetada vs. custo
  já realizado.
- **Dados** — edição dos dados cadastrais da safra, exclusão.

## Patrimônio (`/patrimonio`, `/ativos`, `/manutencao`, `/abastecimento`)

Cadastro de equipamentos (máquina/veículo/silo/pivô/benfeitoria, ficha técnica,
foto), manutenções (peças + mão de obra, nota fiscal anexada, rateio opcional
por safra) e abastecimentos (litros, custo, horímetro, rateio opcional por
safra).

**Depreciação** (`depreciacao.ts`): linear por horas de uso — `valor de
aquisição ÷ vida útil em horas × horímetro atual`, sem valor residual (deprecia
até zero ao fim da vida útil). Decisão explícita do usuário: aplicada a
qualquer tipo de equipamento, mesmo os que não têm "horas de uso" no sentido
literal (silo, pivô, benfeitoria) — pra esses, o cálculo só aparece se
horímetro e vida útil em horas forem preenchidos; senão mostra "—". Exibida na
listagem de Ativos, no cadastro de cada equipamento e agregada na Visão Geral.

## Estoque de Insumos (`/estoque-insumos`, `/movimentacoes`)

Cadastro de insumos por categoria (semente, fertilizante, defensivo, corretivo,
combustível, outro), com custo médio ponderado. Movimentações: entrada (compra,
com opção de comprar por embalagem) e aplicação (multi-insumo, por talhão,
numerada, com dose/ha).

## Fiscal (`/fiscal`)

Notas fiscais de entrada/saída, com anexo de arquivo (PDF/imagem) opcional.

## Contratos (`/contratos`)

Cadastro simples de contratos (arrendamento, parceria, compra, venda).

## Registros (`/registros`, `/estacoes`, `/leituras`)

Estações climáticas e leituras (precipitação, temperatura, umidade, pressão)
por propriedade.

## Gestão

- **Equipe** (`/equipe`, `/equipe/perfis`) — colaboradores (cadastro, sem
  login) e perfis de permissão.
- **Propriedades** (`/propriedades`) — cadastro de propriedades/fazendas.
- **Talhões** (`/talhoes`) — cadastro de talhões vinculados a uma propriedade.

## Configurações (`/configuracoes`)

Preferências da conta/tenant.

## Bloqueados por enquanto

- **Financeiro** (`/financeiro`) — lançamentos financeiros gerais existem no
  banco e são usados de dentro de Safras (aba Lançamentos), mas a tela
  standalone está bloqueada no menu até ficar pronta.
- **Pecuária** (`/pecuaria`) — cadastro de lotes existe, bloqueado no menu.
- **Estoque de Produção** (`/estoque-producao`) — entradas/saídas de produção
  existem no banco e são usadas de dentro de Safras (registro de colheita),
  mas a tela standalone está bloqueada no menu.

## Admin FarmSul (`/admin/**`)

Fora do tenant normal — gestão de clientes (tenants), usuários, planos,
financeiro da própria FarmSul. Acesso via `public.is_admin()`.
