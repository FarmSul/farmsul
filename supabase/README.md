# FarmSul — Schema Supabase

Schema inicial multi-tenant para o FarmSul, com isolamento de dados via Row-Level Security (RLS).

## Como aplicar

1. Crie um projeto novo em [supabase.com](https://supabase.com)
2. Vá em **SQL Editor** no painel
3. Rode os arquivos **nesta ordem exata**:
   1. `001_schema_inicial.sql` — cria as tabelas
   2. `002_row_level_security.sql` — ativa o isolamento entre fazendas
   3. `003_onboarding_signup.sql` — automatiza a criação de tenant no cadastro
   4. `004_admin_farmsul.sql` — cria o papel de admin da plataforma (equipe FarmSul), com acesso a todos os tenants

## O que já está pronto

- **10 tabelas** cobrindo o MVP essencial: propriedades, safras, talhões, equipamentos, manutenções, insumos, movimentações de insumo e financeiro
- **Isolamento total por tenant** via RLS — mesmo com bug na aplicação, uma fazenda não consegue ler dados de outra
- **4 papéis de usuário**: proprietário, gerente, operador, consultor (o campo já existe; regras de tela por papel ficam por conta do frontend)
- **Onboarding automático**: quando alguém se cadastra, já vira "proprietário" do próprio tenant, sem passo manual
- **Admin FarmSul**: tabela `admins` separada dos tenants, com acesso total a todos os dados de todos os clientes — para a equipe FarmSul gerenciar a plataforma. Não tem signup público; primeiro admin é inserido manualmente via SQL (instruções no final de `004_admin_farmsul.sql`)

## O que falta decidir com você antes de ir pra frente

- **Convite de funcionários**: hoje o trigger só cobre "criar conta nova = criar tenant novo". Se um gerente for convidar um operador para o *mesmo* tenant, precisamos de uma tabela de convites (`convites` com token, email, tenant_id, papel) — é rápido de montar quando você quiser.
- **Multi-propriedade por consultor**: se um agrônomo/consultor for acessar várias fazendas diferentes, o modelo atual (`profiles.tenant_id` único) não cobre isso — precisaria de uma tabela `consultor_tenant` (many-to-many). Vale a pena já prever se essa é uma persona que você quer atender desde o início.
- **Storage de arquivos**: se for anexar notas fiscais, fotos de pragas no talhão etc., o Supabase Storage também precisa de policies próprias — ainda não incluído aqui.

## Testando o isolamento

Depois de rodar os três arquivos, o jeito mais rápido de confirmar que o RLS está funcionando:

1. Crie dois usuários de teste via signup (isso cria dois tenants diferentes automaticamente)
2. Logado como o usuário 1, tente rodar `select * from propriedades` — só deve aparecer o que pertence a ele
3. Tente inserir uma propriedade passando o `tenant_id` do usuário 2 manualmente — a policy `with check` deve bloquear
