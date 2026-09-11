import Link from "next/link";
import { Building2, Layers, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requirePlatformAdmin } from "@/lib/supabase/admin";
import { PLANOS, PLANO_IDS } from "@/lib/planos";
import { criarCliente, atualizarCliente, excluirCliente } from "../../actions";
import { ClienteRow } from "./cliente-row";
import { NovoClienteModal } from "./novo-cliente-modal";
import { IconStatCard } from "@/components/ui/icon-stat-card";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/field";
import { EmptyState } from "@/components/ui/empty-state";

export default async function AdminClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; plano?: string }>;
}) {
  const { q, plano } = await searchParams;
  const supabase = await createClient();
  await requirePlatformAdmin();

  let query = supabase
    .from("tenants")
    .select("id, nome, plano, cnpj_cpf, responsavel, uf, cidade, cep, criado_em")
    .order("criado_em", { ascending: false });

  if (q) query = query.ilike("nome", `%${q}%`);

  const [{ data: tenantsFiltrados }, { data: profiles }] = await Promise.all([
    query,
    supabase.from("profiles").select("tenant_id"),
  ]);

  const contagemPorTenant = new Map<string, number>();
  profiles?.forEach((p) => {
    contagemPorTenant.set(p.tenant_id, (contagemPorTenant.get(p.tenant_id) ?? 0) + 1);
  });

  const todos = tenantsFiltrados ?? [];
  const contagemPorPlano = new Map<string, number>();
  todos.forEach((t) => contagemPorPlano.set(t.plano, (contagemPorPlano.get(t.plano) ?? 0) + 1));

  const tenants = plano ? todos.filter((t) => t.plano === plano) : todos;

  function hrefPill(p?: string) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (p) params.set("plano", p);
    const qs = params.toString();
    return qs ? `?${qs}` : "?";
  }

  const pillBase =
    "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors border";
  const pillActive = "border-primary bg-primary-soft text-primary";
  const pillInactive = "border-border text-muted-foreground hover:bg-surface-hover hover:text-foreground";

  return (
    <>
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <IconStatCard icon={Building2} tone="slate" label="Total" value={todos.length} hint="clientes cadastrados" />
        {PLANO_IDS.map((id) => (
          <IconStatCard
            key={id}
            icon={Layers}
            tone={PLANOS[id].tone}
            label={PLANOS[id].label}
            value={contagemPorPlano.get(id) ?? 0}
          />
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Link href={hrefPill()} className={`${pillBase} ${!plano ? pillActive : pillInactive}`}>
            Todos {todos.length}
          </Link>
          {PLANO_IDS.map((id) => (
            <Link
              key={id}
              href={hrefPill(id)}
              className={`${pillBase} ${plano === id ? pillActive : pillInactive}`}
            >
              {PLANOS[id].label} {contagemPorPlano.get(id) ?? 0}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <form method="get">
            {plano && <input type="hidden" name="plano" value={plano} />}
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input name="q" defaultValue={q} placeholder="Buscar cliente..." className="w-56 pl-9" />
            </div>
          </form>
          <NovoClienteModal action={criarCliente} />
        </div>
      </div>

      <Card>
        {tenants.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Cliente</th>
                  <th className="px-6 py-3 font-medium">Plano</th>
                  <th className="px-6 py-3 font-medium">R$/mês</th>
                  <th className="px-6 py-3 font-medium">Usuários</th>
                  <th className="px-6 py-3 font-medium">Criado em</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((t) => (
                  <ClienteRow
                    key={t.id}
                    id={t.id}
                    nome={t.nome}
                    plano={t.plano}
                    usuarios={contagemPorTenant.get(t.id) ?? 0}
                    cnpjCpf={t.cnpj_cpf}
                    responsavel={t.responsavel}
                    uf={t.uf}
                    cidade={t.cidade}
                    cep={t.cep}
                    criadoEm={new Date(t.criado_em).toLocaleDateString("pt-BR")}
                    atualizarAction={atualizarCliente}
                    excluirAction={excluirCliente}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={Building2} title="Nenhum cliente encontrado" />
        )}
      </Card>
    </>
  );
}
