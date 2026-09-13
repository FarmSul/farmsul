# Banco de dados

Postgres via Supabase. `supabase/schema_atual.sql` é um snapshot **idempotente**
de referência (roda sem erro em qualquer estado do banco), mantido manualmente —
em caso de divergência com o banco real, `supabase/migrations/*.sql` é que vale.
Toda migration nova deve ser espelhada em `schema_atual.sql`.

## Multi-tenancy e RLS

- Toda tabela de negócio tem `tenant_id uuid references public.tenants(id)`.
- Duas funções auxiliares (`security definer`, usadas nas policies):
  - `public.get_tenant_id()` — tenant do usuário autenticado (via `profiles`).
  - `public.is_admin()` — `true` se o usuário é da equipe FarmSul (`admins`),
    dá acesso total independente de tenant.
- Padrão de policy replicado em quase toda tabela:
  ```sql
  create policy "<tabela>: acesso restrito ao tenant"
    on public.<tabela> for all
    using (tenant_id = public.get_tenant_id())
    with check (tenant_id = public.get_tenant_id());

  create policy "admin: acesso total a <tabela>"
    on public.<tabela> for all
    using (public.is_admin())
    with check (public.is_admin());
  ```
- **Exceção conhecida**: `estoque_producao` só tem a policy de tenant, sem
  bypass de admin — reflete o que está de fato aplicado (criado assim numa
  migration anterior), não é um gap para "corrigir" sem avaliar o motivo.
- Getter de tenant no código: `src/lib/supabase/tenant.ts` (`getTenantId`).
  Getter de usuário com cache por request: `src/lib/supabase/admin.ts`
  (`getCachedUser`) — **não reintroduzir** repasse de identidade via headers
  custom (`x-user-id` etc.): já foi tentado, causou bugs de "Usuário não
  autenticado" em Server Actions, e foi revertido.

## Tabelas principais e como se relacionam

```
tenants ← profiles (usuários) ← colaboradores (cadastro, sem login)
tenants ← propriedades ← talhoes ← safra_talhoes → safras
```

- **`safras`**: `cultura`, `data_inicio`, `data_fim`, `tipo_custo`,
  `sacas_previstas`, `preco_saca_previsto` (usados na aba Simulação). Relação
  N:N com `talhoes` via `safra_talhoes` (guarda a área em ha alocada por talhão
  naquela safra).
- **Etapas do ciclo da safra**: coluna `etapa` (nullable, `check` constraint)
  presente em `movimentacoes_insumo`, `manutencoes`, `abastecimentos`,
  `lancamentos_financeiros`, `estoque_producao`, `aplicacoes`. Valores possíveis:
  `preparo_correcao`, `plantio`, `controle_manejo`, `colheita`, `venda` — ver
  `src/app/(app)/safras/etapas.ts` (`ETAPAS`, `ETAPA_LABELS`).
- **`insumos`**: estoque de insumos (`categoria`: `semente`, `fertilizante`,
  `defensivo`, `corretivo`, `combustivel`, `outro`; `estoque_atual`,
  `custo_medio` — média ponderada, recalculada a cada entrada).
- **`aplicacoes`** + **`movimentacoes_insumo`**: uma aplicação agrupa vários
  insumos aplicados juntos numa mesma passada (ex: herbicida + adjuvante), com
  número de ordem (1ª, 2ª...) e talhão. Cada insumo da receita é uma linha em
  `movimentacoes_insumo` (`tipo = 'aplicacao'`) com `aplicacao_id`,
  `quantidade_ha` (dose/ha) e `custo_total` próprios. `movimentacoes_insumo`
  também é usada para `tipo = 'entrada'` (compra) sem `aplicacao_id`.
- **`abastecimentos`**: consumo de combustível por equipamento, com `horimetro`
  opcional — ao registrar, atualiza `equipamentos.horimetro_atual` (só na
  criação, não na edição, pra não sobrescrever com leitura antiga).
- **`manutencoes`**: custo = mão de obra + soma de peças (`jsonb`), opcionalmente
  vinculada a `safra_id` (rateio de custo) e a `colaboradores` (responsável).
- **`lancamentos_financeiros`**: lançamentos manuais de receita/despesa, com
  `talhao_id`, `propriedade_id`, `safra_id` e `etapa` opcionais.
- **`estoque_producao`**: entradas/saídas de produção colhida (`tipo`: `entrada`
  ou `saida`), usada como registro de colheita quando ligada a uma safra.
- **`notas_fiscais`**, **`contratos`**: módulos Fiscal e Contratos — mais simples,
  sem relação direta com safra/talhão hoje.

## Storage

Buckets do Supabase Storage usados hoje: `equipamentos` (fotos), `notas-fiscais`
(comprovantes de manutenção e notas fiscais). Upload centralizado em
`src/lib/supabase/storage.ts` (`uploadArquivo`).

## Fluxo pra alterar o schema

1. Escrever a migration em `supabase/migrations/<timestamp>_<nome>.sql`.
2. `npx supabase db push --linked` (aplica no banco remoto).
3. `npx supabase migration list --linked` (confirmar que `local` e `remote`
   bateram).
4. Espelhar a mudança em `supabase/schema_atual.sql`.
