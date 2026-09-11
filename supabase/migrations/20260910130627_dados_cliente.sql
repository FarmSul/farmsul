-- ============================================================================
-- FARM SUL — Dados cadastrais do cliente (CNPJ/CPF, responsável, endereço)
-- ============================================================================

alter table public.tenants add column if not exists cnpj_cpf text;
alter table public.tenants add column if not exists responsavel text;
alter table public.tenants add column if not exists uf text;
alter table public.tenants add column if not exists cidade text;
alter table public.tenants add column if not exists cep text;
