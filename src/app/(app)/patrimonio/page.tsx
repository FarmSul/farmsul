import Link from "next/link";
import { Tractor, Wrench, Receipt, Wallet, Fuel, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirectIfPlatformAdmin } from "@/lib/supabase/admin";
import { TIPO_LABELS, TIPO_MAQUINA_LABELS } from "./labels";
import { DonutChart } from "./donut-chart";
import { IconStatCard } from "@/components/ui/icon-stat-card";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

const CORES_STATUS = {
  ativo: "#3f9d68",
  manutencao: "#d97706",
  inativo: "#71717a",
};

function formatBRL(valor: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);
}

function BarraPercentual({ label, valor, total, cor }: { label: string; valor: number; total: number; cor: string }) {
  const pct = total > 0 ? Math.round((valor / total) * 100) : 0;
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="font-semibold text-foreground">{pct}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-hover">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: cor }} />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        {valor} de {total} equipamento{total === 1 ? "" : "s"}
      </p>
    </div>
  );
}

export default async function PatrimonioVisaoGeralPage() {
  const supabase = await createClient();
  await redirectIfPlatformAdmin();

  const [{ data: equipamentos }, { data: manutencoes }, { data: abastecimentos }] = await Promise.all([
    supabase.from("equipamentos").select("id, tipo, tipo_maquina, valor_aquisicao, status"),
    supabase.from("manutencoes").select("id, custo"),
    supabase.from("abastecimentos").select("id, custo_total"),
  ]);

  const todos = equipamentos ?? [];
  const ativos = todos.filter((e) => e.status === "ativo").length;
  const emManutencao = todos.filter((e) => e.status === "manutencao").length;
  const inativos = todos.filter((e) => e.status === "inativo").length;
  const valorTotal = todos.reduce((soma, e) => soma + (e.valor_aquisicao ?? 0), 0);

  const todasManutencoes = manutencoes ?? [];
  const custoManutencoes = todasManutencoes.reduce((soma, m) => soma + m.custo, 0);
  const custoMedioManutencao = todasManutencoes.length ? custoManutencoes / todasManutencoes.length : 0;

  const custoCombustivel = (abastecimentos ?? []).reduce((soma, a) => soma + a.custo_total, 0);

  function rotuloGrupo(tipo: string, tipoMaquina: string | null) {
    return tipo === "maquina" && tipoMaquina
      ? (TIPO_MAQUINA_LABELS[tipoMaquina] ?? tipoMaquina)
      : (TIPO_LABELS[tipo] ?? tipo);
  }

  const contagemPorTipo = new Map<string, number>();
  todos.forEach((e) => {
    const rotulo = rotuloGrupo(e.tipo, e.tipo_maquina);
    contagemPorTipo.set(rotulo, (contagemPorTipo.get(rotulo) ?? 0) + 1);
  });
  const tipos = Array.from(contagemPorTipo.entries()).sort((a, b) => b[1] - a[1]);

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <IconStatCard icon={Wallet} tone="primary" label="Valor do patrimônio" value={formatBRL(valorTotal)} hint={`${todos.length} equipamentos`} />
        <IconStatCard icon={Tractor} tone="slate" label="Total de ativos" value={todos.length} />
        <IconStatCard icon={Wrench} tone="amber" label="Em manutenção" value={emManutencao} />
        <IconStatCard
          icon={Receipt}
          tone="rose"
          label="Custo em manutenções"
          value={formatBRL(custoManutencoes)}
          hint={`${todasManutencoes.length} registro${todasManutencoes.length === 1 ? "" : "s"}`}
        />
        <IconStatCard icon={Fuel} tone="blue" label="Custo com combustível" value={formatBRL(custoCombustivel)} />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Distribuição por status</h2>
          {todos.length ? (
            <DonutChart
              centerValue={todos.length}
              centerLabel="ativos"
              segments={[
                { label: "Ativo", value: ativos, color: CORES_STATUS.ativo },
                { label: "Em manutenção", value: emManutencao, color: CORES_STATUS.manutencao },
                { label: "Inativo", value: inativos, color: CORES_STATUS.inativo },
              ]}
            />
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">Nenhum equipamento cadastrado ainda.</p>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Saúde operacional</h2>
          <div className="flex flex-col gap-4">
            <BarraPercentual label="Ativos" valor={ativos} total={todos.length} cor={CORES_STATUS.ativo} />
            <BarraPercentual label="Em manutenção" valor={emManutencao} total={todos.length} cor={CORES_STATUS.manutencao} />
            <BarraPercentual label="Inativos" valor={inativos} total={todos.length} cor={CORES_STATUS.inativo} />
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2 border-t border-border pt-4 text-center">
            <div>
              <p className="text-lg font-bold text-foreground">{todos.length}</p>
              <p className="text-xs text-muted-foreground">Ativos</p>
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{todasManutencoes.length}</p>
              <p className="text-xs text-muted-foreground">Manutenções</p>
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{formatBRL(custoMedioManutencao)}</p>
              <p className="text-xs text-muted-foreground">Custo médio</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Ativos por tipo</h2>
          <Link
            href="/patrimonio/ativos"
            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Ver todos os ativos
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {tipos.length ? (
          <div className="flex flex-wrap gap-2">
            {tipos.map(([rotulo, quantidade]) => (
              <Badge key={rotulo} tone="primary">
                {rotulo} · {quantidade}
              </Badge>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Tractor}
            title="Nenhum equipamento cadastrado"
            description="Cadastre o primeiro em Ativos para ver o resumo aqui."
          />
        )}
      </Card>
    </div>
  );
}
