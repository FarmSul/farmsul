import Link from "next/link";
import { Building2, ShieldCheck, Users, Wallet, ArrowRight, Home } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requirePlatformAdmin } from "@/lib/supabase/admin";
import { PLANOS, type PlanoId } from "@/lib/planos";
import { PageBanner } from "@/components/ui/page-banner";
import { IconStatCard } from "@/components/ui/icon-stat-card";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";

function formatBRL(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function AdminInicioPage() {
  const supabase = await createClient();
  await requirePlatformAdmin();

  const [{ data: tenants }, { data: admins }, { data: profiles }] = await Promise.all([
    supabase.from("tenants").select("id, nome, plano, criado_em").order("criado_em", { ascending: false }),
    supabase.from("admins").select("id"),
    supabase.from("profiles").select("id"),
  ]);

  const totalClientes = tenants?.length ?? 0;
  const totalInternos = admins?.length ?? 0;
  const totalUsuariosClientes = (profiles?.length ?? 0) - totalInternos;
  const mrr = (tenants ?? []).reduce((soma, t) => soma + (PLANOS[t.plano as PlanoId]?.preco ?? 0), 0);
  const ultimosClientes = (tenants ?? []).slice(0, 5);

  return (
    <div>
      <PageBanner
        icon={Home}
        title="Início"
        description="Panorama operacional da plataforma FarmSul: clientes, receita e equipe."
        tags={["Clientes", "Receita", "Equipe"]}
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <IconStatCard icon={Building2} tone="slate" label="Clientes" value={totalClientes} />
        <IconStatCard icon={ShieldCheck} tone="primary" label="Usuários internos" value={totalInternos} />
        <IconStatCard icon={Users} tone="blue" label="Usuários dos clientes" value={totalUsuariosClientes} />
        <IconStatCard icon={Wallet} tone="amber" label="MRR estimado" value={formatBRL(mrr)} />
      </div>

      <Card>
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-sm font-semibold text-foreground">Últimos clientes cadastrados</h2>
          <Link
            href="/admin/clientes"
            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Ver todos
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {ultimosClientes.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <tbody>
                {ultimosClientes.map((t) => {
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
                      <td className="px-6 py-3.5 text-right text-muted-foreground">
                        {new Date(t.criado_em).toLocaleDateString("pt-BR")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={Building2} title="Nenhum cliente cadastrado ainda" />
        )}
      </Card>
    </div>
  );
}
