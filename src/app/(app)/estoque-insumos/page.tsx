import { Database } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirectIfPlatformAdmin } from "@/lib/supabase/admin";
import { criarInsumo, atualizarInsumo, excluirInsumo } from "./actions";
import { NovoInsumoModal } from "./novo-insumo-modal";
import { InsumoRow } from "./insumo-row";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export default async function EstoqueInsumosPage() {
  const supabase = await createClient();
  await redirectIfPlatformAdmin();

  const { data: insumos } = await supabase
    .from("insumos")
    .select("id, nome, categoria, unidade, estoque_atual, custo_medio, tamanho_embalagem")
    .order("nome");

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <NovoInsumoModal action={criarInsumo} />
      </div>

      <Card>
        {insumos?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Nome</th>
                  <th className="px-6 py-3 font-medium">Categoria</th>
                  <th className="px-6 py-3 font-medium">Estoque</th>
                  <th className="px-6 py-3 font-medium">Custo médio</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {insumos.map((i) => (
                  <InsumoRow
                    key={i.id}
                    id={i.id}
                    nome={i.nome}
                    categoria={i.categoria}
                    unidade={i.unidade}
                    estoqueAtual={i.estoque_atual}
                    custoMedio={i.custo_medio}
                    tamanhoEmbalagem={i.tamanho_embalagem}
                    atualizarAction={atualizarInsumo}
                    excluirAction={excluirInsumo}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={Database} title="Nenhum insumo cadastrado" />
        )}
      </Card>
    </div>
  );
}
