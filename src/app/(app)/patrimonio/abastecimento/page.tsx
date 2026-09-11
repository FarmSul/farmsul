import Link from "next/link";
import { Fuel, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirectIfPlatformAdmin } from "@/lib/supabase/admin";
import { criarAbastecimento, atualizarAbastecimento, excluirAbastecimento } from "../actions";
import { AbastecimentoModal } from "../abastecimento-modal";
import { AbastecimentoRow } from "./abastecimento-row";
import { IconStatCard } from "@/components/ui/icon-stat-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default async function AbastecimentoPage() {
  const supabase = await createClient();
  await redirectIfPlatformAdmin();

  const [{ data: abastecimentos }, { data: equipamentos }, { data: combustiveisData }, { data: safras }] =
    await Promise.all([
      supabase
        .from("abastecimentos")
        .select(
          "id, equipamento_id, insumo_id, safra_id, litros, custo_total, horimetro, data, equipamentos(nome), insumos(nome), safras(nome)",
        )
        .order("data", { ascending: false }),
      supabase.from("equipamentos").select("id, nome, horimetro_atual").order("nome"),
      supabase
        .from("insumos")
        .select("id, nome, unidade, estoque_atual, custo_medio")
        .eq("categoria", "combustivel")
        .order("nome"),
      supabase.from("safras").select("id, nome").order("nome"),
    ]);

  const equipamentosAbastecimento = (equipamentos ?? []).map((eq) => ({
    id: eq.id,
    nome: eq.nome,
    horimetroAtual: eq.horimetro_atual,
  }));

  const combustiveis = (combustiveisData ?? []).map((c) => ({
    id: c.id,
    nome: c.nome,
    unidade: c.unidade,
    custoMedio: c.custo_medio,
    estoqueAtual: c.estoque_atual,
  }));

  const custoTotalMes = (abastecimentos ?? [])
    .filter((a) => a.data.slice(0, 7) === new Date().toISOString().slice(0, 7))
    .reduce((soma, a) => soma + a.custo_total, 0);

  return (
    <div>
      {combustiveis.length ? (
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <IconStatCard
            icon={Fuel}
            tone="amber"
            label="Custo no mês"
            value={new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(custoTotalMes)}
          />
          {combustiveis.slice(0, 3).map((c) => (
            <IconStatCard key={c.id} icon={Fuel} tone="slate" label={c.nome} value={`${c.estoqueAtual} ${c.unidade}`} hint="em estoque" />
          ))}
        </div>
      ) : null}

      <div className="mb-4 flex justify-end">
        {combustiveis.length ? (
          <AbastecimentoModal
            equipamentos={equipamentosAbastecimento}
            combustiveis={combustiveis}
            safras={safras ?? []}
            action={criarAbastecimento}
            trigger={
              <Button type="button">
                <Plus className="h-4 w-4" />
                Novo abastecimento
              </Button>
            }
          />
        ) : (
          <Link
            href="/estoque-insumos"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover"
            title="Cadastre um combustível no Estoque de Insumos antes"
          >
            <Plus className="h-4 w-4" />
            Cadastrar combustível primeiro
          </Link>
        )}
      </div>

      <Card>
        {abastecimentos?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Equipamento</th>
                  <th className="px-6 py-3 font-medium">Data</th>
                  <th className="px-6 py-3 font-medium">Combustível</th>
                  <th className="px-6 py-3 font-medium">Litros</th>
                  <th className="px-6 py-3 font-medium">Custo</th>
                  <th className="px-6 py-3 font-medium">Horímetro</th>
                  <th className="px-6 py-3 font-medium">Safra</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {abastecimentos.map((a) => {
                  const equipamento = Array.isArray(a.equipamentos) ? a.equipamentos[0] : a.equipamentos;
                  const insumo = Array.isArray(a.insumos) ? a.insumos[0] : a.insumos;
                  const safra = Array.isArray(a.safras) ? a.safras[0] : a.safras;
                  return (
                    <AbastecimentoRow
                      key={a.id}
                      equipamentoNome={equipamento?.nome ?? "—"}
                      combustivelNome={insumo?.nome ?? "—"}
                      safraNome={safra?.nome}
                      equipamentos={equipamentosAbastecimento}
                      combustiveis={combustiveis}
                      safras={safras ?? []}
                      abastecimento={{
                        id: a.id,
                        equipamentoId: a.equipamento_id,
                        insumoId: a.insumo_id,
                        safraId: a.safra_id,
                        litros: a.litros,
                        custoTotal: a.custo_total,
                        horimetro: a.horimetro,
                        data: a.data,
                      }}
                      atualizarAction={atualizarAbastecimento}
                      excluirAction={excluirAbastecimento}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Fuel}
            title="Nenhum abastecimento registrado"
            description={
              combustiveis.length
                ? "Registre o primeiro abastecimento usando o botão acima."
                : "Cadastre um combustível (diesel, gasolina...) no Estoque de Insumos primeiro."
            }
          />
        )}
      </Card>
    </div>
  );
}
