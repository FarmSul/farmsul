import { Tractor } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirectIfPlatformAdmin } from "@/lib/supabase/admin";
import {
  criarEquipamento,
  atualizarEquipamento,
  excluirEquipamento,
  criarManutencao,
  excluirManutencao,
  criarAbastecimento,
  excluirAbastecimento,
} from "../actions";
import { NovoEquipamentoModal } from "../novo-equipamento-modal";
import { EquipamentoRow } from "../equipamento-row";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export default async function PatrimonioAtivosPage() {
  const supabase = await createClient();
  await redirectIfPlatformAdmin();

  const [
    { data: equipamentos },
    { data: manutencoesData },
    { data: colaboradores },
    { data: abastecimentosData },
    { data: combustiveisData },
  ] = await Promise.all([
    supabase
      .from("equipamentos")
      .select(
        "id, nome, tipo, tipo_maquina, implemento, modelo, fabricante, ano_fabricacao, vida_util_horas, horimetro_atual, observacoes, data_aquisicao, valor_aquisicao, status, foto_url",
      )
      .order("nome"),
    supabase
      .from("manutencoes")
      .select("id, equipamento_id, data, descricao, custo, nota_fiscal_url, colaboradores(nome)")
      .order("data", { ascending: false }),
    supabase.from("colaboradores").select("id, nome").order("nome"),
    supabase
      .from("abastecimentos")
      .select("id, equipamento_id, data, litros, custo_total, insumos(nome)")
      .order("data", { ascending: false }),
    supabase
      .from("insumos")
      .select("id, nome, unidade, estoque_atual, custo_medio")
      .eq("categoria", "combustivel")
      .order("nome"),
  ]);

  const combustiveis = (combustiveisData ?? []).map((c) => ({
    id: c.id,
    nome: c.nome,
    unidade: c.unidade,
    custoMedio: c.custo_medio,
    estoqueAtual: c.estoque_atual,
  }));

  const abastecimentosPorEquipamento = new Map<
    string,
    { id: string; data: string; litros: number; custoTotal: number; combustivelNome: string }[]
  >();
  abastecimentosData?.forEach((a) => {
    const insumo = Array.isArray(a.insumos) ? a.insumos[0] : a.insumos;
    const lista = abastecimentosPorEquipamento.get(a.equipamento_id) ?? [];
    lista.push({
      id: a.id,
      data: a.data,
      litros: a.litros,
      custoTotal: a.custo_total,
      combustivelNome: insumo?.nome ?? "—",
    });
    abastecimentosPorEquipamento.set(a.equipamento_id, lista);
  });

  const manutencoesPorEquipamento = new Map<
    string,
    {
      id: string;
      data: string;
      descricao: string;
      custo: number;
      notaFiscalUrl: string | null;
      responsavelNome: string | undefined;
    }[]
  >();
  manutencoesData?.forEach((m) => {
    const responsavel = Array.isArray(m.colaboradores) ? m.colaboradores[0] : m.colaboradores;
    const lista = manutencoesPorEquipamento.get(m.equipamento_id) ?? [];
    lista.push({
      id: m.id,
      data: m.data,
      descricao: m.descricao,
      custo: m.custo,
      notaFiscalUrl: m.nota_fiscal_url,
      responsavelNome: responsavel?.nome,
    });
    manutencoesPorEquipamento.set(m.equipamento_id, lista);
  });

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <NovoEquipamentoModal action={criarEquipamento} />
      </div>

      <Card>
        {equipamentos?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Nome</th>
                  <th className="px-6 py-3 font-medium">Tipo</th>
                  <th className="px-6 py-3 font-medium">Aquisição</th>
                  <th className="px-6 py-3 font-medium">Valor</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {equipamentos.map((e) => (
                  <EquipamentoRow
                    key={e.id}
                    id={e.id}
                    nome={e.nome}
                    tipo={e.tipo}
                    tipoMaquina={e.tipo_maquina}
                    implemento={e.implemento}
                    modelo={e.modelo}
                    fabricante={e.fabricante}
                    anoFabricacao={e.ano_fabricacao}
                    vidaUtilHoras={e.vida_util_horas}
                    horimetroAtual={e.horimetro_atual}
                    observacoes={e.observacoes}
                    status={e.status}
                    dataAquisicao={e.data_aquisicao}
                    valorAquisicao={e.valor_aquisicao}
                    fotoUrl={e.foto_url}
                    manutencoes={manutencoesPorEquipamento.get(e.id) ?? []}
                    abastecimentos={abastecimentosPorEquipamento.get(e.id) ?? []}
                    colaboradores={colaboradores ?? []}
                    combustiveis={combustiveis}
                    atualizarAction={atualizarEquipamento}
                    excluirAction={excluirEquipamento}
                    criarManutencaoAction={criarManutencao}
                    excluirManutencaoAction={excluirManutencao}
                    criarAbastecimentoAction={criarAbastecimento}
                    excluirAbastecimentoAction={excluirAbastecimento}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Tractor}
            title="Nenhum equipamento cadastrado"
            description="Adicione o primeiro equipamento usando o botão acima."
          />
        )}
      </Card>
    </div>
  );
}
