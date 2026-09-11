import { Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirectIfPlatformAdmin, getCachedUser } from "@/lib/supabase/admin";
import { criarColaborador, atualizarColaborador, excluirColaborador } from "./actions";
import { NovoColaboradorModal } from "./novo-colaborador-modal";
import { EditarColaboradorModal } from "./editar-colaborador-modal";
import { UsuarioSistemaRow } from "./usuario-sistema-row";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export default async function EquipePage() {
  const supabase = await createClient();
  await redirectIfPlatformAdmin();
  const usuarioLogado = await getCachedUser();

  const [{ data: colaboradores }, { data: perfis }, { data: usuarios }] = await Promise.all([
    supabase
      .from("colaboradores")
      .select("id, nome, email, telefone, cpf, perfil_id, perfis(nome)")
      .order("nome"),
    supabase.from("perfis").select("id, nome").order("nome"),
    supabase
      .from("profiles")
      .select("id, nome_completo, papel, telefone, avatar_url")
      .order("nome_completo"),
  ]);

  const lista = (colaboradores ?? []).map((c) => ({
    ...c,
    perfil_nome: (Array.isArray(c.perfis) ? c.perfis[0] : c.perfis)?.nome ?? null,
  }));

  const temItens = (usuarios?.length ?? 0) > 0 || lista.length > 0;

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <NovoColaboradorModal perfis={perfis ?? []} action={criarColaborador} />
      </div>

      <Card>
        {temItens ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Nome</th>
                  <th className="px-6 py-3 font-medium">E-mail</th>
                  <th className="px-6 py-3 font-medium">Telefone</th>
                  <th className="px-6 py-3 font-medium">CPF</th>
                  <th className="px-6 py-3 font-medium">Perfil</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {usuarios?.map((u) => (
                  <UsuarioSistemaRow
                    key={u.id}
                    usuario={u}
                    isSelf={u.id === usuarioLogado?.id}
                    email={u.id === usuarioLogado?.id ? (usuarioLogado?.email ?? "") : null}
                  />
                ))}
                {lista.map((c) => (
                  <EditarColaboradorModal
                    key={c.id}
                    colaborador={c}
                    perfis={perfis ?? []}
                    action={atualizarColaborador}
                    deleteAction={excluirColaborador}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Users}
            title="Nenhum colaborador cadastrado"
            description="Adicione o primeiro colaborador usando o botão acima."
          />
        )}
      </Card>
    </div>
  );
}
