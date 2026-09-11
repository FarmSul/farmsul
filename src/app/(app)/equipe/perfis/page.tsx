import { ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirectIfPlatformAdmin } from "@/lib/supabase/admin";
import { criarPerfil, atualizarPerfil, excluirPerfil } from "./actions";
import { NovoPerfilModal } from "./novo-perfil-modal";
import { EditarPerfilModal } from "./editar-perfil-modal";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export default async function PerfisPage() {
  const supabase = await createClient();
  await redirectIfPlatformAdmin();

  const { data: perfis } = await supabase
    .from("perfis")
    .select("id, nome, descricao, permissoes")
    .order("nome");

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <NovoPerfilModal action={criarPerfil} />
      </div>

      <Card>
        {perfis?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Nome</th>
                  <th className="px-6 py-3 font-medium">Descrição</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {perfis.map((p) => (
                  <EditarPerfilModal key={p.id} perfil={p} action={atualizarPerfil} deleteAction={excluirPerfil} />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={ShieldCheck}
            title="Nenhum perfil cadastrado"
            description="Crie o primeiro perfil de acesso usando o botão acima."
          />
        )}
      </Card>
    </div>
  );
}
