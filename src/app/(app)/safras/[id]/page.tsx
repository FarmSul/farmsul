import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { redirectIfPlatformAdmin } from "@/lib/supabase/admin";
import {
  atualizarSafra,
  atualizarSimulacaoSafra,
  excluirSafra,
} from "../actions";
import { criarLancamento, atualizarLancamento, excluirLancamento } from "../../financeiro/actions";
import {
  criarManutencao,
  atualizarManutencao,
  excluirManutencao,
  criarAbastecimento,
  atualizarAbastecimento,
  excluirAbastecimento,
} from "../../patrimonio/actions";
import { criarAplicacao, atualizarAplicacao, excluirAplicacao } from "../../estoque-insumos/actions";
import {
  criarMovimentacao as criarMovimentacaoProducao,
  atualizarMovimentacao as atualizarMovimentacaoProducao,
  excluirMovimentacao as excluirMovimentacaoProducao,
} from "../../estoque-producao/actions";
import { SafraDetail } from "./safra-detail";

export default async function SafraDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  await redirectIfPlatformAdmin();

  const [
    { data: safra },
    { data: talhoesData },
    { data: lancamentos },
    { data: manutencoes },
    { data: abastecimentos },
    { data: producao },
    { data: equipamentos },
    { data: colaboradores },
    { data: combustiveisData },
    { data: aplicacoesData },
    { data: insumosAplicaveisData },
  ] = await Promise.all([
    supabase
      .from("safras")
      .select(
        "id, nome, cultura, data_inicio, data_fim, tipo_custo, sacas_previstas, preco_saca_previsto, safra_talhoes(talhao_id, area_ha)",
      )
      .eq("id", id)
      .single(),
    supabase.from("talhoes").select("id, nome, area_ha, propriedades(nome)").order("nome"),
    supabase
      .from("lancamentos_financeiros")
      .select("id, tipo, categoria, descricao, valor, status, data, etapa, talhao_id, talhoes(nome)")
      .eq("safra_id", id)
      .order("data", { ascending: false }),
    supabase
      .from("manutencoes")
      .select(
        "id, equipamento_id, data, descricao, custo, mao_de_obra, pecas, responsavel_id, nota_fiscal_url, etapa, equipamentos(nome), colaboradores(nome)",
      )
      .eq("safra_id", id)
      .order("data", { ascending: false }),
    supabase
      .from("abastecimentos")
      .select(
        "id, equipamento_id, insumo_id, horimetro, data, litros, custo_total, etapa, equipamentos(nome), insumos(nome)",
      )
      .eq("safra_id", id)
      .order("data", { ascending: false }),
    supabase
      .from("estoque_producao")
      .select("id, produto, tipo, quantidade, unidade, data, etapa")
      .eq("safra_id", id)
      .eq("tipo", "entrada")
      .order("data", { ascending: false }),
    supabase.from("equipamentos").select("id, nome, horimetro_atual").order("nome"),
    supabase.from("colaboradores").select("id, nome").order("nome"),
    supabase
      .from("insumos")
      .select("id, nome, unidade, estoque_atual, custo_medio")
      .eq("categoria", "combustivel")
      .order("nome"),
    supabase
      .from("aplicacoes")
      .select(
        "id, numero, data, etapa, talhao_id, talhoes(nome), movimentacoes_insumo(id, insumo_id, quantidade, quantidade_ha, custo_total, insumos(nome, unidade))",
      )
      .eq("safra_id", id)
      .order("data", { ascending: false }),
    supabase
      .from("insumos")
      .select("id, nome, categoria, unidade, estoque_atual, custo_medio")
      .neq("categoria", "combustivel")
      .order("nome"),
  ]);

  if (!safra) {
    notFound();
  }

  const talhoes = (talhoesData ?? []).map((t) => ({
    id: t.id,
    nome: t.nome,
    area_ha: t.area_ha,
    propriedade_nome: (Array.isArray(t.propriedades) ? t.propriedades[0] : t.propriedades)?.nome ?? null,
  }));

  const areasSafra = Array.isArray(safra.safra_talhoes) ? safra.safra_talhoes : [];
  const defaultSelecionados = Object.fromEntries(areasSafra.map((a) => [a.talhao_id, Number(a.area_ha)]));
  const areaTotal = areasSafra.reduce((soma, a) => soma + Number(a.area_ha), 0);

  const combustiveis = (combustiveisData ?? []).map((c) => ({
    id: c.id,
    nome: c.nome,
    unidade: c.unidade,
    custoMedio: c.custo_medio,
    estoqueAtual: c.estoque_atual,
  }));

  const insumosAplicaveis = (insumosAplicaveisData ?? []).map((i) => ({
    id: i.id,
    nome: i.nome,
    categoria: i.categoria,
    unidade: i.unidade,
    custoMedio: i.custo_medio,
    estoqueAtual: i.estoque_atual,
  }));

  return (
    <SafraDetail
      safra={{
        id: safra.id,
        nome: safra.nome,
        cultura: safra.cultura,
        dataInicio: safra.data_inicio,
        dataFim: safra.data_fim,
        tipoCusto: safra.tipo_custo,
        sacasPrevistas: safra.sacas_previstas,
        precoSacaPrevisto: safra.preco_saca_previsto,
        areaTotal,
      }}
      talhoes={talhoes}
      defaultSelecionados={defaultSelecionados}
      lancamentos={(lancamentos ?? []).map((l) => ({
        id: l.id,
        tipo: l.tipo,
        categoria: l.categoria,
        descricao: l.descricao,
        valor: l.valor,
        status: l.status,
        data: l.data,
        etapa: l.etapa,
        talhaoId: l.talhao_id,
        talhaoNome: (Array.isArray(l.talhoes) ? l.talhoes[0] : l.talhoes)?.nome ?? null,
      }))}
      manutencoes={(manutencoes ?? []).map((m) => ({
        id: m.id,
        equipamentoId: m.equipamento_id,
        data: m.data,
        descricao: m.descricao,
        custo: m.custo,
        maoDeObra: m.mao_de_obra,
        pecas: m.pecas ?? [],
        responsavelId: m.responsavel_id,
        notaFiscalUrl: m.nota_fiscal_url,
        etapa: m.etapa,
        equipamentoNome: (Array.isArray(m.equipamentos) ? m.equipamentos[0] : m.equipamentos)?.nome ?? "—",
        responsavelNome: (Array.isArray(m.colaboradores) ? m.colaboradores[0] : m.colaboradores)?.nome,
      }))}
      abastecimentos={(abastecimentos ?? []).map((a) => ({
        id: a.id,
        equipamentoId: a.equipamento_id,
        insumoId: a.insumo_id,
        horimetro: a.horimetro,
        data: a.data,
        litros: a.litros,
        custoTotal: a.custo_total,
        etapa: a.etapa,
        equipamentoNome: (Array.isArray(a.equipamentos) ? a.equipamentos[0] : a.equipamentos)?.nome ?? "—",
        combustivelNome: (Array.isArray(a.insumos) ? a.insumos[0] : a.insumos)?.nome ?? "—",
      }))}
      aplicacoes={(aplicacoesData ?? []).map((a) => {
        const itens = (a.movimentacoes_insumo ?? []).map((it) => {
          const insumo = Array.isArray(it.insumos) ? it.insumos[0] : it.insumos;
          return {
            id: it.id,
            insumoId: it.insumo_id,
            quantidade: it.quantidade,
            quantidadeHa: it.quantidade_ha,
            custoTotal: it.custo_total,
            insumoNome: insumo?.nome ?? "—",
            unidade: insumo?.unidade ?? "",
          };
        });
        return {
          id: a.id,
          numero: a.numero,
          data: a.data,
          etapa: a.etapa,
          talhaoId: a.talhao_id,
          talhaoNome: (Array.isArray(a.talhoes) ? a.talhoes[0] : a.talhoes)?.nome ?? "—",
          custoTotal: itens.reduce((soma, it) => soma + (it.custoTotal ?? 0), 0),
          itens,
        };
      })}
      producao={producao ?? []}
      equipamentos={(equipamentos ?? []).map((eq) => ({
        id: eq.id,
        nome: eq.nome,
        horimetroAtual: eq.horimetro_atual,
      }))}
      colaboradores={colaboradores ?? []}
      combustiveis={combustiveis}
      insumosAplicaveis={insumosAplicaveis}
      actions={{
        atualizarSafra,
        excluirSafra,
        atualizarSimulacaoSafra,
        criarLancamento,
        atualizarLancamento,
        excluirLancamento,
        criarManutencao,
        atualizarManutencao,
        excluirManutencao,
        criarAbastecimento,
        atualizarAbastecimento,
        excluirAbastecimento,
        criarAplicacao,
        atualizarAplicacao,
        excluirAplicacao,
        criarMovimentacaoProducao,
        atualizarMovimentacaoProducao,
        excluirMovimentacaoProducao,
      }}
    />
  );
}
