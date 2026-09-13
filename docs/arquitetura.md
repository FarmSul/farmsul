# Arquitetura

## Stack

- **Next.js 16** (App Router, Turbopack) — ver `AGENTS.md`: essa versão tem
  diferenças de API/convenções em relação ao que modelos de IA "sabem" por padrão
  (ex: `middleware.ts` foi renomeado pra `proxy.ts`). Antes de assumir comportamento
  de uma API do Next, confira `node_modules/next/dist/docs/`.
- **React 19**, **TypeScript**, **Tailwind CSS v4**.
- **Supabase** (Postgres + Auth + Storage) como backend — sem API própria: os
  Server Components/Actions falam direto com o Supabase via `@supabase/ssr`.
- **Radix UI** (`Dialog`, `Tabs`) para modais e abas.
- **lucide-react** para ícones.

Não há camada de API REST/GraphQL própria — a "API" do sistema são os Server
Actions em cada `actions.ts` de módulo, chamados diretamente pelos formulários
(`<form action={minhaAction}>`) ou por `startTransition` em componentes cliente.

## Hospedagem e região

O projeto Supabase (`FarmSul`, ref `ncwdyysobihqomsectjt`) está na região
**`us-east-1`** (Virgínia, AWS) — não em São Paulo, apesar do público ser
majoritariamente do Brasil. `vercel.json` fixa a função em **`iad1`**
(Washington D.C., a região Vercel mais próxima de `us-east-1`), pra minimizar
a latência entre o servidor e o banco — cada tela faz várias idas ao Supabase
numa renderização só (autenticação, perfil, dados da página), então o
trecho servidor↔banco pesa mais que o trecho usuário↔servidor (que é só 1
ida-e-volta por navegação). Se o projeto Supabase for movido pra uma região
mais perto do Brasil no futuro, `vercel.json` precisa acompanhar.

## Estrutura de pastas

```
src/
  app/
    (app)/              # rotas autenticadas (grupo de rotas, não aparece na URL)
      <modulo>/
        page.tsx         # Server Component, busca dados do Supabase
        actions.ts       # "use server" — mutações (criar/atualizar/excluir)
        <algo>-modal.tsx # "use client" — formulário em modal (Radix Dialog)
        <algo>-row.tsx   # "use client" — linha de tabela com modal de edição embutido
      admin/             # área exclusiva do Admin FarmSul
      dashboard/         # tela de início
    (marketing)/         # landing page pública (fora do grupo autenticado)
  components/
    ui/                  # componentes de design system (Button, Card, Badge, Field, FormModal, ConfirmButton...)
    app-shell.tsx         # sidebar + topbar mobile
  lib/
    supabase/            # client.ts (browser), server.ts (Server Components), admin.ts (cache de auth), tenant.ts (getTenantId), storage.ts (upload de arquivo)
supabase/
  migrations/            # uma migration por mudança de schema, aplicada com `supabase db push`
  schema_atual.sql        # snapshot idempotente de referência — não é fonte de verdade se divergir das migrations
```

## Convenções estabelecidas no código

- **Server Component (`page.tsx`) busca os dados, Client Component recebe via
  props.** Regras de negócio (cálculo de custo, validação de estoque, etc.) vivem
  em `actions.ts` ou em funções auxiliares no próprio módulo — não dentro de JSX.
- **Padrão "Fixo"**: quando um modal é aberto a partir de um contexto que já
  define um campo (ex: abrir "Novo abastecimento" de dentro de uma safra já
  define a safra), o componente recebe `xFixo`/`xFixa` e renderiza
  `<input type="hidden" name="x_id" value={xFixo.id} />` + rótulo somente leitura,
  em vez de um `<Select>`.
- **Edição reaproveita o modal de criação**: os modais aceitam uma prop opcional
  com o registro existente (`manutencao?`, `abastecimento?`, `lancamento?`...) —
  quando presente, os campos vêm com `defaultValue` preenchido, o título/label do
  botão muda, e um `<input type="hidden" name="id">` é adicionado. A `action`
  passada pelo componente pai é que decide se é criação ou atualização.
- **Confirmação de exclusão**: usar `<ConfirmButton confirmText="..." title="...">`
  (`src/components/ui/confirm-button.tsx`) dentro de um `<form action={excluirX}>`
  — abre um diálogo estilizado (não `window.confirm`) e submete o form ao
  confirmar.
- **Tabelas** sempre dentro de `<div className="overflow-x-auto"><table>...`.
- **Grids de campos de formulário** usam `grid-cols-1 ... sm:grid-cols-2/3` (nunca
  `grid-cols-2` "nu", sem fallback mobile) — ver histórico de correção de
  responsividade.
- **`revalidatePath`** deve ser chamado pra cada rota afetada por uma mutação,
  incluindo `/safras/${safra_id}` quando o registro tem `safra_id`.
