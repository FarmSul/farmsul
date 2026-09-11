import { Thermometer } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirectIfPlatformAdmin } from "@/lib/supabase/admin";
import { criarEstacao, atualizarEstacao, excluirEstacao } from "../actions";
import { NovaEstacaoModal } from "./nova-estacao-modal";
import { EstacaoRow } from "./estacao-row";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export default async function EstacoesPage() {
  const supabase = await createClient();
  await redirectIfPlatformAdmin();

  const [{ data: estacoes }, { data: propriedades }] = await Promise.all([
    supabase
      .from("estacoes_climaticas")
      .select("id, nome, tipo, propriedade_id, propriedades(nome)")
      .order("nome"),
    supabase.from("propriedades").select("id, nome").order("nome"),
  ]);

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <NovaEstacaoModal propriedades={propriedades ?? []} action={criarEstacao} />
      </div>

      <Card>
        {estacoes?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Nome</th>
                  <th className="px-6 py-3 font-medium">Tipo</th>
                  <th className="px-6 py-3 font-medium">Propriedade</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {estacoes.map((e) => {
                  const propriedade = Array.isArray(e.propriedades) ? e.propriedades[0] : e.propriedades;
                  return (
                    <EstacaoRow
                      key={e.id}
                      id={e.id}
                      nome={e.nome}
                      tipo={e.tipo}
                      propriedadeId={e.propriedade_id}
                      propriedadeNome={propriedade?.nome}
                      propriedades={propriedades ?? []}
                      atualizarAction={atualizarEstacao}
                      excluirAction={excluirEstacao}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Thermometer}
            title="Nenhuma estação cadastrada"
            description={
              propriedades?.length
                ? "Adicione a primeira estação usando o botão acima."
                : "Cadastre primeiro uma propriedade — a estação sempre pertence a uma."
            }
          />
        )}
      </Card>
    </div>
  );
}
