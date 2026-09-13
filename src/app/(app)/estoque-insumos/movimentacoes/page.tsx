import Link from "next/link";
import { ArrowLeftRight, Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirectIfPlatformAdmin } from "@/lib/supabase/admin";
import { criarEntradaInsumo, criarAplicacaoInsumo, excluirMovimentacaoInsumo } from "../actions";
import { NovaEntradaModal } from "../nova-entrada-modal";
import { NovaAplicacaoModal } from "../nova-aplicacao-modal";
import { IconStatCard } from "@/components/ui/icon-stat-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmButton } from "@/components/ui/confirm-button";

const TIPO_LABELS: Record<string, string> = {
  entrada: "Entrada",
  aplicacao: "Aplicação",
  saida: "Saída",
};

function formatBRL(valor: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);
}

function formatDataCurta(data: string) {
  return new Date(`${data}T00:00:00`).toLocaleDateString("pt-BR");
}

export default async function MovimentacoesInsumoPage() {
  const supabase = await createClient();
  await redirectIfPlatformAdmin();

  const [{ data: movimentacoes }, { data: insumosData }, { data: talhoes }, { data: safras }] = await Promise.all([
    supabase
      .from("movimentacoes_insumo")
      .select(
        "id, insumo_id, talhao_id, safra_id, tipo, quantidade, custo_total, data, insumos(nome, unidade), talhoes(nome), safras(nome)",
      )
      .order("data", { ascending: false }),
    supabase
      .from("insumos")
      .select("id, nome, categoria, unidade, estoque_atual, custo_medio, tamanho_embalagem")
      .order("nome"),
    supabase.from("talhoes").select("id, nome, area_ha").order("nome"),
    supabase.from("safras").select("id, nome").order("nome"),
  ]);

  const insumos = (insumosData ?? []).map((i) => ({
    id: i.id,
    nome: i.nome,
    unidade: i.unidade,
    custoMedio: i.custo_medio,
    estoqueAtual: i.estoque_atual,
    tamanhoEmbalagem: i.tamanho_embalagem,
  }));

  const insumosAplicaveis = (insumosData ?? [])
    .filter((i) => i.categoria !== "combustivel")
    .map((i) => ({ id: i.id, nome: i.nome, unidade: i.unidade, custoMedio: i.custo_medio, estoqueAtual: i.estoque_atual }));

  const mesAtual = new Date().toISOString().slice(0, 7);
  const aplicadoNoMes = (movimentacoes ?? [])
    .filter((m) => m.tipo === "aplicacao" && m.data.slice(0, 7) === mesAtual)
    .reduce((soma, m) => soma + (m.custo_total ?? 0), 0);
  const compradoNoMes = (movimentacoes ?? [])
    .filter((m) => m.tipo === "entrada" && m.data.slice(0, 7) === mesAtual)
    .reduce((soma, m) => soma + (m.custo_total ?? 0), 0);

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <IconStatCard icon={ArrowLeftRight} tone="primary" label="Comprado no mês" value={formatBRL(compradoNoMes)} />
        <IconStatCard icon={ArrowLeftRight} tone="amber" label="Aplicado no mês" value={formatBRL(aplicadoNoMes)} />
      </div>

      <div className="mb-4 flex flex-wrap justify-end gap-2">
        <NovaEntradaModal
          insumos={insumos}
          action={criarEntradaInsumo}
          trigger={
            <Button type="button" variant="secondary">
              <Plus className="h-4 w-4" />
              Nova entrada
            </Button>
          }
        />
        {insumosAplicaveis.length > 0 && (talhoes ?? []).length > 0 ? (
          <NovaAplicacaoModal
            insumos={insumosAplicaveis}
            talhoes={talhoes ?? []}
            safras={safras ?? []}
            action={criarAplicacaoInsumo}
            trigger={
              <Button type="button">
                <Plus className="h-4 w-4" />
                Nova aplicação
              </Button>
            }
          />
        ) : insumosAplicaveis.length === 0 ? (
          <span
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-muted-foreground"
            title="Cadastre um insumo que não seja combustível (semente, fertilizante, defensivo...) na aba Estoque"
          >
            <Plus className="h-4 w-4" />
            Nenhum insumo p/ aplicar
          </span>
        ) : (
          <Link
            href="/talhoes"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover"
            title="Cadastre um talhão antes de registrar uma aplicação"
          >
            <Plus className="h-4 w-4" />
            Cadastrar talhão primeiro
          </Link>
        )}
      </div>

      <Card>
        {movimentacoes?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Insumo</th>
                  <th className="px-6 py-3 font-medium">Tipo</th>
                  <th className="px-6 py-3 font-medium">Quantidade</th>
                  <th className="px-6 py-3 font-medium">Talhão</th>
                  <th className="px-6 py-3 font-medium">Safra</th>
                  <th className="px-6 py-3 font-medium">Custo</th>
                  <th className="px-6 py-3 font-medium">Data</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {movimentacoes.map((m) => {
                  const insumo = Array.isArray(m.insumos) ? m.insumos[0] : m.insumos;
                  const talhao = Array.isArray(m.talhoes) ? m.talhoes[0] : m.talhoes;
                  const safra = Array.isArray(m.safras) ? m.safras[0] : m.safras;
                  return (
                    <tr key={m.id} className="border-b border-border last:border-0 hover:bg-surface-hover">
                      <td className="px-6 py-3.5 font-medium text-foreground">{insumo?.nome ?? "—"}</td>
                      <td className="px-6 py-3.5">
                        <Badge tone={m.tipo === "entrada" ? "primary" : "amber"}>{TIPO_LABELS[m.tipo] ?? m.tipo}</Badge>
                      </td>
                      <td className="px-6 py-3.5 text-muted-foreground">
                        {m.quantidade} {insumo?.unidade}
                      </td>
                      <td className="px-6 py-3.5 text-muted-foreground">{talhao?.nome ?? "—"}</td>
                      <td className="px-6 py-3.5 text-muted-foreground">{safra?.nome ?? "—"}</td>
                      <td className="px-6 py-3.5 text-muted-foreground">{m.custo_total != null ? formatBRL(m.custo_total) : "—"}</td>
                      <td className="px-6 py-3.5 text-muted-foreground">{formatDataCurta(m.data)}</td>
                      <td className="px-6 py-3.5 text-right">
                        <form action={excluirMovimentacaoInsumo}>
                          <input type="hidden" name="id" value={m.id} />
                          <ConfirmButton
                            confirmText="Excluir essa movimentação? O estoque do insumo é ajustado de volta."
                            title="Excluir"
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
          <EmptyState
            icon={ArrowLeftRight}
            title="Nenhuma movimentação registrada"
            description="Registre uma entrada (compra) ou aplicação usando os botões acima."
          />
        )}
      </Card>
    </div>
  );
}
