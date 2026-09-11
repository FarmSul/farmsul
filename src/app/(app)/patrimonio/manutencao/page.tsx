import { Wrench, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirectIfPlatformAdmin } from "@/lib/supabase/admin";
import { criarManutencao, atualizarManutencao, excluirManutencao } from "../actions";
import { AbrirManutencaoModal } from "../abrir-manutencao-modal";
import { ManutencaoRow } from "./manutencao-row";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default async function PatrimonioManutencaoPage() {
  const supabase = await createClient();
  await redirectIfPlatformAdmin();

  const [{ data: manutencoes }, { data: equipamentos }, { data: colaboradores }] = await Promise.all([
    supabase
      .from("manutencoes")
      .select(
        "id, equipamento_id, data, descricao, custo, mao_de_obra, pecas, responsavel_id, nota_fiscal_url, equipamentos(nome), colaboradores(nome)",
      )
      .order("data", { ascending: false }),
    supabase.from("equipamentos").select("id, nome").order("nome"),
    supabase.from("colaboradores").select("id, nome").order("nome"),
  ]);

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <AbrirManutencaoModal
          equipamentos={equipamentos ?? []}
          colaboradores={colaboradores ?? []}
          action={criarManutencao}
          trigger={
            <Button type="button">
              <Plus className="h-4 w-4" />
              Abrir manutenção
            </Button>
          }
        />
      </div>

      <Card>
        {manutencoes?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Equipamento</th>
                  <th className="px-6 py-3 font-medium">Data</th>
                  <th className="px-6 py-3 font-medium">Serviço</th>
                  <th className="px-6 py-3 font-medium">Responsável</th>
                  <th className="px-6 py-3 font-medium">Peças</th>
                  <th className="px-6 py-3 font-medium">Custo total</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {manutencoes.map((m) => {
                  const equipamento = Array.isArray(m.equipamentos) ? m.equipamentos[0] : m.equipamentos;
                  const responsavel = Array.isArray(m.colaboradores) ? m.colaboradores[0] : m.colaboradores;
                  return (
                    <ManutencaoRow
                      key={m.id}
                      equipamentoNome={equipamento?.nome ?? "—"}
                      responsavelNome={responsavel?.nome}
                      equipamentos={equipamentos ?? []}
                      colaboradores={colaboradores ?? []}
                      manutencao={{
                        id: m.id,
                        equipamentoId: m.equipamento_id,
                        data: m.data,
                        descricao: m.descricao,
                        custo: m.custo,
                        maoDeObra: m.mao_de_obra,
                        pecas: Array.isArray(m.pecas) ? m.pecas : [],
                        responsavelId: m.responsavel_id,
                        notaFiscalUrl: m.nota_fiscal_url,
                      }}
                      atualizarAction={atualizarManutencao}
                      excluirAction={excluirManutencao}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Wrench}
            title="Nenhuma manutenção registrada"
            description="Abra a primeira manutenção usando o botão acima."
          />
        )}
      </Card>
    </div>
  );
}
