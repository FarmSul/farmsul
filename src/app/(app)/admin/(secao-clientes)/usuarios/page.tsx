import { Users, Trash2, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requirePlatformAdmin } from "@/lib/supabase/admin";
import { atualizarPapelUsuario } from "../../actions";
import { criarUsuarioCliente, excluirUsuarioCliente } from "./actions";
import { PapelSelect } from "./papel-select";
import { NovoUsuarioModal } from "./novo-usuario-modal";
import { IconStatCard } from "@/components/ui/icon-stat-card";
import { Card } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/field";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmButton } from "@/components/ui/confirm-button";

const PAPEIS = ["proprietario", "gerente", "operador", "consultor"];

export default async function UsuariosClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; papel?: string; tenant_id?: string }>;
}) {
  const { q, papel, tenant_id } = await searchParams;
  const supabase = await createClient();
  await requirePlatformAdmin();

  const [{ data: admins }, { data: perfis }, { data: tenants }] = await Promise.all([
    supabase.from("admins").select("id"),
    supabase.from("profiles").select("id, nome_completo, papel, tenant_id, tenants(nome)"),
    supabase.from("tenants").select("id, nome").order("nome"),
  ]);

  const idsInternos = new Set(admins?.map((a) => a.id));
  let usuarios = (perfis ?? []).filter((p) => !idsInternos.has(p.id));
  const totalGeral = usuarios.length;
  const totalProprietarios = usuarios.filter((u) => u.papel === "proprietario").length;

  if (q) usuarios = usuarios.filter((u) => (u.nome_completo ?? "").toLowerCase().includes(q.toLowerCase()));
  if (papel) usuarios = usuarios.filter((u) => u.papel === papel);
  if (tenant_id) usuarios = usuarios.filter((u) => u.tenant_id === tenant_id);

  return (
    <>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <IconStatCard icon={Users} tone="slate" label="Total" value={totalGeral} hint="usuários cadastrados" />
        <IconStatCard icon={Users} tone="primary" label="Proprietários" value={totalProprietarios} />
        <IconStatCard
          icon={Users}
          tone="blue"
          label="Gerentes / operadores / consultores"
          value={totalGeral - totalProprietarios}
        />
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <form method="get" className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input name="q" defaultValue={q} placeholder="Buscar por nome..." className="w-52 pl-9" />
          </div>
          <Select name="papel" defaultValue={papel ?? ""} className="w-40 capitalize">
            <option value="">Todos os papéis</option>
            {PAPEIS.map((p) => (
              <option key={p} value={p} className="capitalize">
                {p}
              </option>
            ))}
          </Select>
          <Select name="tenant_id" defaultValue={tenant_id ?? ""} className="w-44">
            <option value="">Todos os clientes</option>
            {tenants?.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome}
              </option>
            ))}
          </Select>
        </form>
        <NovoUsuarioModal tenants={tenants ?? []} action={criarUsuarioCliente} />
      </div>

      <Card>
        {usuarios.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Nome</th>
                  <th className="px-6 py-3 font-medium">Papel</th>
                  <th className="px-6 py-3 font-medium">Cliente</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => {
                  const tenant = Array.isArray(u.tenants) ? u.tenants[0] : u.tenants;
                  return (
                    <tr key={u.id} className="border-b border-border last:border-0 hover:bg-surface-hover">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar name={u.nome_completo ?? "?"} size="sm" />
                          <span className="font-medium text-foreground">{u.nome_completo ?? "—"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5">
                        <PapelSelect userId={u.id} papel={u.papel} action={atualizarPapelUsuario} />
                      </td>
                      <td className="px-6 py-3.5 text-muted-foreground">{tenant?.nome ?? "—"}</td>
                      <td className="px-6 py-3.5 text-right">
                        <form action={excluirUsuarioCliente}>
                          <input type="hidden" name="id" value={u.id} />
                          <ConfirmButton
                            confirmText={`Excluir o usuário "${u.nome_completo ?? u.id}"? O login dele será removido.`}
                            title="Excluir usuário"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-danger-soft hover:text-danger"
                          >
                            <Trash2 className="h-4 w-4" />
                          </ConfirmButton>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={Users} title="Nenhum usuário encontrado" />
        )}
      </Card>
    </>
  );
}
