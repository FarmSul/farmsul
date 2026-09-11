import { Wallet, TrendingUp, Building2, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requirePlatformAdmin } from "@/lib/supabase/admin";
import { PLANOS, type PlanoId } from "@/lib/planos";
import { PageBanner } from "@/components/ui/page-banner";
import { IconStatCard } from "@/components/ui/icon-stat-card";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Input, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

function formatBRL(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function FinanceiroPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; plano?: string }>;
}) {
  const { q, plano } = await searchParams;
  const supabase = await createClient();
  await requirePlatformAdmin();

  const { data: tenants } = await supabase
    .from("tenants")
    .select("id, nome, plano, criado_em")
    .order("criado_em", { ascending: false });

  const mrr = (tenants ?? []).reduce((soma, t) => soma + (PLANOS[t.plano as PlanoId]?.preco ?? 0), 0);

  let listaFiltrada = tenants ?? [];
  if (q) listaFiltrada = listaFiltrada.filter((t) => t.nome.toLowerCase().includes(q.toLowerCase()));
  if (plano) listaFiltrada = listaFiltrada.filter((t) => t.plano === plano);

  return (
    <div>
      <PageBanner
        icon={Wallet}
        title="Financeiro"
        description="Estimativa de receita, calculada a partir do plano de cada cliente. Valores fixos definidos em src/lib/planos.ts — ainda sem cobrança real integrada."
        tags={["MRR", "Receita por cliente"]}
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <IconStatCard
          icon={TrendingUp}
          tone="amber"
          label="MRR estimado"
          value={formatBRL(mrr)}
          hint="por mês, somando todos os clientes"
        />
        <IconStatCard icon={Building2} tone="slate" label="Clientes ativos" value={tenants?.length ?? 0} />
      </div>

      <form method="get" className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input name="q" defaultValue={q} placeholder="Buscar cliente..." className="w-56 pl-9" />
        </div>
        <Select name="plano" defaultValue={plano ?? ""} className="w-40">
          <option value="">Todos os planos</option>
          <option value="essencial">Essencial</option>
          <option value="avancado">Avançado</option>
          <option value="consultoria">Consultoria</option>
        </Select>
        <Button type="submit" variant="secondary">
          Filtrar
        </Button>
      </form>

      <Card>
        {listaFiltrada.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Cliente</th>
                  <th className="px-6 py-3 font-medium">Plano</th>
                  <th className="px-6 py-3 font-medium">Valor/mês</th>
                </tr>
              </thead>
              <tbody>
                {listaFiltrada.map((t) => {
                  const info = PLANOS[t.plano as PlanoId];
                  return (
                    <tr key={t.id} className="border-b border-border last:border-0 hover:bg-surface-hover">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar name={t.nome} size="sm" />
                          <span className="font-medium text-foreground">{t.nome}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5">
                        <Badge tone={info?.tone ?? "neutral"}>{info?.label ?? t.plano}</Badge>
                      </td>
                      <td className="px-6 py-3.5 text-muted-foreground">{formatBRL(info?.preco ?? 0)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={Wallet} title="Nenhum cliente encontrado" />
        )}
      </Card>
    </div>
  );
}
