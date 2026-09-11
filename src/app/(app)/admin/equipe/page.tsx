import { ShieldCheck, Trash2, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requirePlatformAdmin, getCachedUser } from "@/lib/supabase/admin";
import { promoverAdmin, revogarAdmin } from "../actions";
import { PageBanner } from "@/components/ui/page-banner";
import { IconStatCard } from "@/components/ui/icon-stat-card";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/field";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { PromoverAdminModal } from "./promover-admin-modal";

export default async function EquipePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();
  await requirePlatformAdmin();

  const usuarioAtual = await getCachedUser();

  const [{ data: admins }, { data: todosPerfis }] = await Promise.all([
    supabase.from("admins").select("id, criado_em").order("criado_em", { ascending: true }),
    supabase.from("profiles").select("id, nome_completo"),
  ]);

  const nomePorId = new Map(todosPerfis?.map((p) => [p.id, p.nome_completo]));
  const idsAdmins = new Set(admins?.map((a) => a.id));
  const candidatos = (todosPerfis ?? []).filter((p) => !idsAdmins.has(p.id));

  const listaFiltrada = (admins ?? []).filter((a) => {
    if (!q) return true;
    const nome = (nomePorId.get(a.id) ?? "").toLowerCase();
    return nome.includes(q.toLowerCase());
  });

  return (
    <div>
      <PageBanner
        icon={ShieldCheck}
        title="Usuários internos"
        description="Equipe FarmSul com acesso administrativo a todos os clientes."
        tags={["Equipe", "Acesso total"]}
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <IconStatCard icon={ShieldCheck} tone="primary" label="Admins ativos" value={admins?.length ?? 0} />
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <form method="get">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input name="q" defaultValue={q} placeholder="Buscar por nome..." className="w-56 pl-9" />
          </div>
        </form>
        <PromoverAdminModal candidatos={candidatos} action={promoverAdmin} />
      </div>

      <Card>
        {listaFiltrada.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Nome</th>
                  <th className="px-6 py-3 font-medium">Admin desde</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {listaFiltrada.map((a) => (
                  <tr key={a.id} className="border-b border-border last:border-0 hover:bg-surface-hover">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={nomePorId.get(a.id) ?? "?"} size="sm" />
                        <span className="font-medium text-foreground">{nomePorId.get(a.id) ?? "—"}</span>
                        {a.id === usuarioAtual?.id && (
                          <span className="text-xs text-muted-foreground">(você)</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-muted-foreground">
                      {new Date(a.criado_em).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      {a.id !== usuarioAtual?.id && (
                        <form action={revogarAdmin}>
                          <input type="hidden" name="id" value={a.id} />
                          <ConfirmButton
                            confirmText={`Remover o acesso de admin de "${nomePorId.get(a.id) ?? a.id}"?`}
                            title="Revogar acesso"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-danger-soft hover:text-danger"
                          >
                            <Trash2 className="h-4 w-4" />
                          </ConfirmButton>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={ShieldCheck} title="Nenhum usuário interno encontrado" />
        )}
      </Card>
    </div>
  );
}
