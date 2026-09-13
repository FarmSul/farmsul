"use client";

import Link from "next/link";
import * as Tabs from "@radix-ui/react-tabs";
import { useEffect, useRef, useState, useTransition } from "react";
import {
  ArrowLeft,
  Sprout,
  LayoutDashboard,
  History,
  ClipboardList,
  Calculator,
  Pencil,
  Trash2,
  TrendingUp,
  TrendingDown,
  Scale,
  Ruler,
  Plus,
  Wrench,
  Fuel,
  FileText,
  Package,
  FlaskConical,
  ChevronDown,
  Layers,
  ShieldCheck,
  ShoppingCart,
  type LucideIcon,
} from "lucide-react";
import { PageBanner } from "@/components/ui/page-banner";
import { IconStatCard } from "@/components/ui/icon-stat-card";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { FieldGroup, Input } from "@/components/ui/field";
import { SafraFormFields, CULTURAS, type Talhao } from "../safra-form-fields";
import { ETAPAS, type EtapaValue } from "../etapas";
import { NovoLancamentoModal } from "../../financeiro/novo-lancamento-modal";
import { AbrirManutencaoModal } from "../../patrimonio/abrir-manutencao-modal";
import { AbastecimentoModal, type Combustivel, type EquipamentoAbastecivel } from "../../patrimonio/abastecimento-modal";
import { NovaAplicacaoMultiModal } from "../../estoque-insumos/nova-aplicacao-multi-modal";
import type { InsumoEstoque } from "../../estoque-insumos/nova-entrada-modal";
import { NovaMovimentacaoModal } from "../../estoque-producao/nova-movimentacao-modal";

type SafraInfo = {
  id: string;
  nome: string;
  cultura: string;
  dataInicio: string;
  dataFim: string | null;
  tipoCusto: string;
  sacasPrevistas: number | null;
  precoSacaPrevisto: number | null;
  areaTotal: number;
};

type Lancamento = {
  id: string;
  tipo: string;
  categoria: string;
  descricao: string | null;
  valor: number;
  status: string;
  data: string;
  etapa: string | null;
  talhaoId: string | null;
  talhaoNome: string | null;
};

type ManutencaoItem = {
  id: string;
  equipamentoId: string;
  data: string;
  descricao: string;
  custo: number;
  maoDeObra: number;
  pecas: { nome: string; quantidade: number; valor_unitario: number }[];
  responsavelId: string | null;
  notaFiscalUrl: string | null;
  etapa: string | null;
  equipamentoNome: string;
  responsavelNome: string | undefined;
};

type AbastecimentoItem = {
  id: string;
  equipamentoId: string;
  insumoId: string;
  horimetro: number | null;
  data: string;
  litros: number;
  custoTotal: number;
  etapa: string | null;
  equipamentoNome: string;
  combustivelNome: string;
};

type ProducaoItem = {
  id: string;
  produto: string;
  tipo: string;
  quantidade: number;
  unidade: string;
  data: string;
  etapa: string | null;
};

type ItemAplicacao = {
  id: string;
  insumoId: string;
  quantidade: number;
  quantidadeHa: number | null;
  custoTotal: number | null;
  insumoNome: string;
  unidade: string;
};

type AplicacaoItem = {
  id: string;
  numero: number;
  data: string;
  etapa: string | null;
  talhaoId: string;
  talhaoNome: string;
  custoTotal: number;
  itens: ItemAplicacao[];
};

type EventoItem =
  | ({ evento: "lancamento" } & Lancamento)
  | ({ evento: "manutencao" } & ManutencaoItem)
  | ({ evento: "abastecimento" } & AbastecimentoItem)
  | ({ evento: "aplicacao" } & AplicacaoItem)
  | ({ evento: "producao" } & ProducaoItem);

function formatBRL(valor: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);
}

function formatDataLonga(data: string) {
  return new Date(`${data}T00:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

function formatDataCurta(data: string) {
  return new Date(`${data}T00:00:00`).toLocaleDateString("pt-BR");
}

function custoDoEvento(e: EventoItem): number {
  if (e.evento === "lancamento") return e.tipo === "despesa" && e.status === "realizado" ? e.valor : 0;
  if (e.evento === "manutencao") return e.custo;
  if (e.evento === "abastecimento") return e.custoTotal;
  if (e.evento === "aplicacao") return e.custoTotal;
  return 0;
}

function talhaoDoEvento(e: EventoItem): { id: string; nome: string } | null {
  if (e.evento === "aplicacao") return { id: e.talhaoId, nome: e.talhaoNome };
  if (e.evento === "lancamento" && e.talhaoId && e.talhaoNome) return { id: e.talhaoId, nome: e.talhaoNome };
  return null;
}

const ETAPA_ICONS: Record<string, LucideIcon> = {
  preparo_correcao: Layers,
  plantio: Sprout,
  controle_manejo: ShieldCheck,
  colheita: Package,
  venda: ShoppingCart,
};

const ETAPA_CATEGORIAS_INSUMO: Record<string, string[]> = {
  preparo_correcao: ["corretivo"],
  plantio: ["semente", "fertilizante"],
  controle_manejo: ["defensivo", "fertilizante"],
};

const ETAPA_DESCRICOES: Record<string, string> = {
  preparo_correcao:
    "Calagem, gessagem, dessecação e preparo do solo antes do plantio. Gradagem, rolo-faca, aluguel de máquina ou serviço de terceiro (ex: espalhamento de calcário) entram como Novo lançamento, com o talhão selecionado.",
  plantio: "Sementes e adubação de base — registre a dose por hectare em cada talhão.",
  controle_manejo:
    "Herbicidas, defensivos e fertilizantes de cobertura ao longo do ciclo. Pulverização ou outro serviço feito por terceiro entra como Novo lançamento, com o talhão selecionado.",
  colheita: "Produção colhida por talhão. Serviço de colheita terceirizado entra como Novo lançamento.",
  venda: "Lançamentos de receita da venda dos grãos.",
};

const TABS = [
  { value: "geral", label: "Visão Geral", icon: LayoutDashboard },
  { value: "historico", label: "Histórico", icon: History },
  { value: "lancamentos", label: "Lançamentos", icon: ClipboardList },
  { value: "simulacao", label: "Simulação", icon: Calculator },
  { value: "dados", label: "Dados", icon: Pencil },
];

function AnimatedTabsList({ value }: { value: string }) {
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicator, setIndicator] = useState<{ left: number; width: number }>({ left: 0, width: 0 });

  useEffect(() => {
    const el = triggerRefs.current[value];
    if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
  }, [value]);

  return (
    <Tabs.List className="relative mb-6 flex gap-6 overflow-x-auto border-b border-border/50">
      {TABS.map(({ value: tabValue, label, icon: Icon }) => (
        <Tabs.Trigger
          key={tabValue}
          ref={(el) => {
            triggerRefs.current[tabValue] = el;
          }}
          value={tabValue}
          className="flex shrink-0 items-center gap-1.5 whitespace-nowrap px-0.5 pb-3 text-sm font-medium text-muted-foreground transition-colors data-[state=active]:text-primary"
        >
          <Icon className="h-4 w-4" />
          {label}
        </Tabs.Trigger>
      ))}
      <span
        className="absolute bottom-0 h-px bg-primary transition-[left,width] duration-[220ms]"
        style={{ left: indicator.left, width: indicator.width, transitionTimingFunction: "var(--ease-out-3)" }}
      />
    </Tabs.List>
  );
}

type Actions = {
  atualizarSafra: (formData: FormData) => void;
  excluirSafra: (formData: FormData) => void;
  atualizarSimulacaoSafra: (formData: FormData) => void;
  criarLancamento: (formData: FormData) => void;
  atualizarLancamento: (formData: FormData) => void;
  excluirLancamento: (formData: FormData) => void;
  criarManutencao: (formData: FormData) => void;
  atualizarManutencao: (formData: FormData) => void;
  excluirManutencao: (formData: FormData) => void;
  criarAbastecimento: (formData: FormData) => void;
  atualizarAbastecimento: (formData: FormData) => void;
  excluirAbastecimento: (formData: FormData) => void;
  criarAplicacao: (formData: FormData) => void;
  atualizarAplicacao: (formData: FormData) => void;
  excluirAplicacao: (formData: FormData) => void;
  criarMovimentacaoProducao: (formData: FormData) => void;
  atualizarMovimentacaoProducao: (formData: FormData) => void;
  excluirMovimentacaoProducao: (formData: FormData) => void;
};

export function SafraDetail({
  safra,
  talhoes,
  defaultSelecionados,
  lancamentos,
  manutencoes,
  abastecimentos,
  aplicacoes,
  producao,
  equipamentos,
  colaboradores,
  combustiveis,
  insumosAplicaveis,
  actions,
}: {
  safra: SafraInfo;
  talhoes: Talhao[];
  defaultSelecionados: Record<string, number>;
  lancamentos: Lancamento[];
  manutencoes: ManutencaoItem[];
  abastecimentos: AbastecimentoItem[];
  aplicacoes: AplicacaoItem[];
  producao: ProducaoItem[];
  equipamentos: EquipamentoAbastecivel[];
  colaboradores: { id: string; nome: string }[];
  combustiveis: Combustivel[];
  insumosAplicaveis: InsumoEstoque[];
  actions: Actions;
}) {
  const [tabValue, setTabValue] = useState("geral");

  const culturaLabel = CULTURAS.find((c) => c.value === safra.cultura)?.label ?? safra.cultura;

  const receitaRealizada = lancamentos
    .filter((l) => l.tipo === "receita" && l.status === "realizado")
    .reduce((soma, l) => soma + l.valor, 0);
  const despesaLancamentos = lancamentos
    .filter((l) => l.tipo === "despesa" && l.status === "realizado")
    .reduce((soma, l) => soma + l.valor, 0);
  const custoManutencoes = manutencoes.reduce((soma, m) => soma + m.custo, 0);
  const custoAbastecimentos = abastecimentos.reduce((soma, a) => soma + a.custoTotal, 0);
  const custoAplicacoes = aplicacoes.reduce((soma, a) => soma + (a.custoTotal ?? 0), 0);
  const custoTotal = despesaLancamentos + custoManutencoes + custoAbastecimentos + custoAplicacoes;
  const margemAtual = receitaRealizada - custoTotal;
  const custoPorHa = safra.areaTotal > 0 ? custoTotal / safra.areaTotal : 0;

  const safraFixa = { id: safra.id, nome: safra.nome };

  const eventos: EventoItem[] = [
    ...lancamentos.map((l) => ({ evento: "lancamento" as const, ...l })),
    ...manutencoes.map((m) => ({ evento: "manutencao" as const, ...m })),
    ...abastecimentos.map((a) => ({ evento: "abastecimento" as const, ...a })),
    ...aplicacoes.map((a) => ({ evento: "aplicacao" as const, ...a })),
    ...producao.map((p) => ({ evento: "producao" as const, ...p })),
  ].sort((a, b) => (a.data < b.data ? 1 : a.data > b.data ? -1 : 0));

  return (
    <div>
      <div className="mb-4">
        <Link
          href="/safras"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Safras
        </Link>
      </div>

      <PageBanner
        icon={Sprout}
        title={safra.nome}
        description={`${culturaLabel} · ${formatDataCurta(safra.dataInicio)}${safra.dataFim ? ` — ${formatDataCurta(safra.dataFim)}` : ""}`}
        tags={[culturaLabel, safra.tipoCusto === "manual" ? "Custo manual" : "Custo automático"]}
      />

      <Tabs.Root value={tabValue} onValueChange={setTabValue}>
        <AnimatedTabsList value={tabValue} />

        <Tabs.Content value="geral">
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
            <IconStatCard icon={TrendingDown} tone="rose" label="Custo total" value={formatBRL(custoTotal)} />
            <IconStatCard icon={TrendingUp} tone="primary" label="Receita realizada" value={formatBRL(receitaRealizada)} />
            <IconStatCard
              icon={Scale}
              tone={margemAtual >= 0 ? "primary" : "rose"}
              label="Margem atual"
              value={formatBRL(margemAtual)}
            />
            <IconStatCard icon={Ruler} tone="slate" label="Área total" value={`${safra.areaTotal.toLocaleString("pt-BR")} ha`} />
            <IconStatCard icon={Scale} tone="amber" label="Custo / ha" value={formatBRL(custoPorHa)} />
          </div>

          <Card className="p-5">
            <h2 className="mb-4 text-sm font-semibold text-foreground">Custo por origem</h2>
            <div className="flex flex-wrap gap-2">
              <Badge tone="primary">Lançamentos · {formatBRL(despesaLancamentos)}</Badge>
              <Badge tone="amber">Manutenção · {formatBRL(custoManutencoes)}</Badge>
              <Badge tone="neutral">Abastecimento · {formatBRL(custoAbastecimentos)}</Badge>
              <Badge tone="blue">Aplicação de insumo · {formatBRL(custoAplicacoes)}</Badge>
            </div>
            {producao.length > 0 && (
              <>
                <h3 className="mb-2 mt-5 text-sm font-semibold text-foreground">Produção registrada</h3>
                <div className="flex flex-wrap gap-2">
                  {producao.map((p) => (
                    <Badge key={p.id} tone="primary">
                      {p.produto} · {p.quantidade} {p.unidade}
                    </Badge>
                  ))}
                </div>
              </>
            )}
          </Card>
        </Tabs.Content>

        <Tabs.Content value="historico">
          <HistoricoTab
            eventos={eventos}
            areaTotal={safra.areaTotal}
            defaultSelecionados={defaultSelecionados}
            safraFixa={safraFixa}
            talhoes={talhoes}
            equipamentos={equipamentos}
            colaboradores={colaboradores}
            combustiveis={combustiveis}
            insumosAplicaveis={insumosAplicaveis}
            actions={actions}
          />
        </Tabs.Content>

        <Tabs.Content value="lancamentos">
          <LancamentosTab
            safraFixa={safraFixa}
            talhoes={talhoes}
            equipamentos={equipamentos}
            combustiveis={combustiveis}
            insumosAplicaveis={insumosAplicaveis}
            aplicacoes={aplicacoes}
            actions={actions}
          />
        </Tabs.Content>

        <Tabs.Content value="simulacao">
          <SimulacaoTab safra={safra} custoTotal={custoTotal} receitaRealizada={receitaRealizada} action={actions.atualizarSimulacaoSafra} />
        </Tabs.Content>

        <Tabs.Content value="dados">
          <DadosTab safra={safra} talhoes={talhoes} defaultSelecionados={defaultSelecionados} actions={actions} />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}

function EventoRow({
  evento: e,
  actions,
  safraFixa,
  talhoes,
  equipamentos,
  colaboradores,
  combustiveis,
  insumosAplicaveis,
}: {
  evento: EventoItem;
  actions: Actions;
  safraFixa: { id: string; nome: string };
  talhoes: Talhao[];
  equipamentos: EquipamentoAbastecivel[];
  colaboradores: { id: string; nome: string }[];
  combustiveis: Combustivel[];
  insumosAplicaveis: InsumoEstoque[];
}) {
  const rowClass =
    "flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-surface-hover";

  if (e.evento === "lancamento") {
    const receita = e.tipo === "receita";
    return (
      <NovoLancamentoModal
        action={actions.atualizarLancamento}
        safraFixa={safraFixa}
        talhoes={talhoes}
        lancamento={{
          id: e.id,
          tipo: e.tipo,
          categoria: e.categoria,
          descricao: e.descricao,
          valor: e.valor,
          status: e.status,
          data: e.data,
          talhaoId: e.talhaoId,
        }}
        trigger={
          <div className={rowClass}>
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${receita ? "bg-primary-soft text-primary" : "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"}`}
            >
              {receita ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{e.categoria}</p>
              <p className="text-xs text-muted-foreground">
                {formatDataLonga(e.data)} · {formatBRL(e.valor)}
                {e.status === "planejado" && " · planejado"}
              </p>
            </div>
            <form action={actions.excluirLancamento} onClick={(ev) => ev.stopPropagation()}>
              <input type="hidden" name="id" value={e.id} />
              <ConfirmButton
                confirmText="Excluir esse lançamento?"
                title="Excluir"
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-danger-soft hover:text-danger"
              >
                <Trash2 className="h-4 w-4" />
              </ConfirmButton>
            </form>
          </div>
        }
      />
    );
  }
  if (e.evento === "manutencao") {
    return (
      <AbrirManutencaoModal
        equipamentos={equipamentos}
        colaboradores={colaboradores}
        safraFixa={safraFixa}
        action={actions.atualizarManutencao}
        manutencao={{
          id: e.id,
          equipamentoId: e.equipamentoId,
          safraId: safraFixa.id,
          data: e.data,
          descricao: e.descricao,
          maoDeObra: e.maoDeObra,
          pecas: e.pecas,
          responsavelId: e.responsavelId,
          notaFiscalUrl: e.notaFiscalUrl,
        }}
        trigger={
          <div className={rowClass}>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
              <Wrench className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {e.descricao} · {e.equipamentoNome}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDataLonga(e.data)}
                {e.responsavelNome && ` · ${e.responsavelNome}`}
                {e.custo > 0 && ` · ${formatBRL(e.custo)}`}
              </p>
            </div>
            {e.notaFiscalUrl && (
              <a
                href={e.notaFiscalUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Ver nota fiscal"
                onClick={(ev) => ev.stopPropagation()}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-hover hover:text-primary"
              >
                <FileText className="h-4 w-4" />
              </a>
            )}
            <form action={actions.excluirManutencao} onClick={(ev) => ev.stopPropagation()}>
              <input type="hidden" name="id" value={e.id} />
              <ConfirmButton
                confirmText="Excluir esse registro de manutenção?"
                title="Excluir"
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-danger-soft hover:text-danger"
              >
                <Trash2 className="h-4 w-4" />
              </ConfirmButton>
            </form>
          </div>
        }
      />
    );
  }
  if (e.evento === "abastecimento") {
    return (
      <AbastecimentoModal
        equipamentos={equipamentos}
        combustiveis={combustiveis}
        safraFixa={safraFixa}
        action={actions.atualizarAbastecimento}
        abastecimento={{
          id: e.id,
          equipamentoId: e.equipamentoId,
          insumoId: e.insumoId,
          safraId: safraFixa.id,
          litros: e.litros,
          custoTotal: e.custoTotal,
          horimetro: e.horimetro,
          data: e.data,
        }}
        trigger={
          <div className={rowClass}>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              <Fuel className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                Abastecimento · {e.combustivelNome} · {e.litros} L · {e.equipamentoNome}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDataLonga(e.data)} · {formatBRL(e.custoTotal)}
              </p>
            </div>
            <form action={actions.excluirAbastecimento} onClick={(ev) => ev.stopPropagation()}>
              <input type="hidden" name="id" value={e.id} />
              <ConfirmButton
                confirmText="Excluir esse abastecimento? O litro consumido volta pro estoque do combustível."
                title="Excluir"
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-danger-soft hover:text-danger"
              >
                <Trash2 className="h-4 w-4" />
              </ConfirmButton>
            </form>
          </div>
        }
      />
    );
  }
  if (e.evento === "aplicacao") {
    return (
      <NovaAplicacaoMultiModal
        insumos={insumosAplicaveis}
        talhoes={talhoes}
        safraFixa={safraFixa}
        action={actions.atualizarAplicacao}
        aplicacao={{
          id: e.id,
          talhaoId: e.talhaoId,
          numero: e.numero,
          data: e.data,
          itens: e.itens.map((it) => ({
            insumoId: it.insumoId,
            quantidade: it.quantidade,
            doseHa: it.quantidadeHa,
            custoTotal: it.custoTotal,
          })),
        }}
        trigger={
          <div className="flex cursor-pointer flex-col gap-2 rounded-lg border border-border p-3 transition-colors hover:bg-surface-hover">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
                <FlaskConical className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {e.numero}ª aplicação · {e.talhaoNome}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDataLonga(e.data)} · {e.itens.length} insumo{e.itens.length === 1 ? "" : "s"}
                  {e.custoTotal > 0 && ` · ${formatBRL(e.custoTotal)}`}
                </p>
              </div>
              <form action={actions.excluirAplicacao} onClick={(ev) => ev.stopPropagation()}>
                <input type="hidden" name="id" value={e.id} />
                <ConfirmButton
                  confirmText="Excluir essa aplicação inteira? O estoque de todos os insumos dela volta pro que era antes."
                  title="Excluir"
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-danger-soft hover:text-danger"
                >
                  <Trash2 className="h-4 w-4" />
                </ConfirmButton>
              </form>
            </div>
            <div className="ml-12 flex flex-col gap-1 border-l border-border pl-3">
              {e.itens.map((it) => (
                <p key={it.id} className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{it.insumoNome}</span>
                  {it.quantidadeHa != null && ` · ${it.quantidadeHa} ${it.unidade}/ha`} · {it.quantidade} {it.unidade}{" "}
                  total
                  {it.custoTotal != null && ` · ${formatBRL(it.custoTotal)}`}
                </p>
              ))}
            </div>
          </div>
        }
      />
    );
  }
  return (
    <NovaMovimentacaoModal
      safras={[]}
      safraFixa={safraFixa}
      title="Editar colheita"
      action={actions.atualizarMovimentacaoProducao}
      movimentacao={{
        id: e.id,
        produto: e.produto,
        tipo: e.tipo,
        quantidade: e.quantidade,
        unidade: e.unidade,
        local: null,
        data: e.data,
      }}
      trigger={
        <div className={rowClass}>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            <Package className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">Colheita · {e.produto}</p>
            <p className="text-xs text-muted-foreground">
              {formatDataLonga(e.data)} · {e.quantidade} {e.unidade}
            </p>
          </div>
          <form action={actions.excluirMovimentacaoProducao} onClick={(ev) => ev.stopPropagation()}>
            <input type="hidden" name="id" value={e.id} />
            <ConfirmButton
              confirmText="Excluir esse registro de colheita?"
              title="Excluir"
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-danger-soft hover:text-danger"
            >
              <Trash2 className="h-4 w-4" />
            </ConfirmButton>
          </form>
        </div>
      }
    />
  );
}

function GastoPorTalhao({ eventos, defaultSelecionados }: { eventos: EventoItem[]; defaultSelecionados: Record<string, number> }) {
  const porTalhao = new Map<string, { nome: string; custo: number }>();
  let custoSemTalhao = 0;

  for (const e of eventos) {
    const custo = custoDoEvento(e);
    if (custo <= 0) continue;
    const t = talhaoDoEvento(e);
    if (t) {
      const atual = porTalhao.get(t.id) ?? { nome: t.nome, custo: 0 };
      atual.custo += custo;
      porTalhao.set(t.id, atual);
    } else {
      custoSemTalhao += custo;
    }
  }

  if (porTalhao.size === 0 && custoSemTalhao === 0) return null;

  return (
    <div className="mb-3 flex flex-col gap-1.5 rounded-lg bg-surface-hover p-3">
      <p className="text-xs font-semibold text-foreground">Gasto por talhão</p>
      {Array.from(porTalhao.entries()).map(([talhaoId, info]) => {
        const area = defaultSelecionados[talhaoId];
        const custoHa = area ? info.custo / area : null;
        return (
          <div key={talhaoId} className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {info.nome}
              {area ? ` (${area} ha)` : ""}
            </span>
            <span className="font-medium text-foreground">
              {formatBRL(info.custo)}
              {custoHa != null && ` · ${formatBRL(custoHa)}/ha`}
            </span>
          </div>
        );
      })}
      {custoSemTalhao > 0 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Sem talhão específico</span>
          <span className="font-medium text-foreground">{formatBRL(custoSemTalhao)}</span>
        </div>
      )}
    </div>
  );
}

function HistoricoTab({
  eventos,
  areaTotal,
  defaultSelecionados,
  safraFixa,
  talhoes,
  equipamentos,
  colaboradores,
  combustiveis,
  insumosAplicaveis,
  actions,
}: {
  eventos: EventoItem[];
  areaTotal: number;
  defaultSelecionados: Record<string, number>;
  safraFixa: { id: string; nome: string };
  talhoes: Talhao[];
  equipamentos: EquipamentoAbastecivel[];
  colaboradores: { id: string; nome: string }[];
  combustiveis: Combustivel[];
  insumosAplicaveis: InsumoEstoque[];
  actions: Actions;
}) {
  const [abertas, setAbertas] = useState<Record<string, boolean>>({});

  function toggle(key: string) {
    setAbertas((atual) => ({ ...atual, [key]: !atual[key] }));
  }

  if (!eventos.length) {
    return (
      <Card className="p-5">
        <p className="py-6 text-center text-sm text-muted-foreground">
          Nenhum evento registrado nessa safra ainda. Use a aba Lançamentos para começar.
        </p>
      </Card>
    );
  }

  const grupos = ETAPAS.map((etapa) => ({
    ...etapa,
    eventos: eventos.filter((e) => e.etapa === etapa.value),
  }));
  const semEtapa = eventos.filter((e) => !e.etapa);

  return (
    <div className="flex flex-col gap-3">
      {grupos.map((grupo) => {
        const Icon = ETAPA_ICONS[grupo.value] ?? Layers;
        const custoEtapa = grupo.eventos.reduce((soma, e) => soma + custoDoEvento(e), 0);
        const custoPorHaEtapa = areaTotal > 0 ? custoEtapa / areaTotal : 0;
        return (
          <Card key={grupo.value} className="overflow-hidden p-0">
            <button
              type="button"
              onClick={() => toggle(grupo.value)}
              className="flex w-full items-center justify-between gap-3 px-5 py-3.5 text-left hover:bg-surface-hover"
            >
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-soft text-primary">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-sm font-semibold text-foreground">{grupo.label}</span>
                <Badge tone="neutral">{grupo.eventos.length}</Badge>
              </div>
              <div className="flex items-center gap-3">
                {custoEtapa > 0 && (
                  <span className="hidden text-xs text-muted-foreground sm:inline">
                    {formatBRL(custoEtapa)}
                    {areaTotal > 0 && ` · ${formatBRL(custoPorHaEtapa)}/ha`}
                  </span>
                )}
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${abertas[grupo.value] ? "rotate-180" : ""}`}
                />
              </div>
            </button>
            {abertas[grupo.value] && (
              <div className="flex flex-col gap-2 border-t border-border p-4">
                {grupo.eventos.length ? (
                  <>
                    <GastoPorTalhao eventos={grupo.eventos} defaultSelecionados={defaultSelecionados} />
                    {grupo.eventos.map((e) => (
                      <EventoRow
                        key={`${e.evento}-${e.id}`}
                        evento={e}
                        actions={actions}
                        safraFixa={safraFixa}
                        talhoes={talhoes}
                        equipamentos={equipamentos}
                        colaboradores={colaboradores}
                        combustiveis={combustiveis}
                        insumosAplicaveis={insumosAplicaveis}
                      />
                    ))}
                  </>
                ) : (
                  <p className="py-2 text-center text-sm text-muted-foreground">Nada registrado nessa etapa ainda.</p>
                )}
              </div>
            )}
          </Card>
        );
      })}

      {semEtapa.length > 0 && (
        <Card className="overflow-hidden p-0">
          <button
            type="button"
            onClick={() => toggle("sem_etapa")}
            className="flex w-full items-center justify-between gap-3 px-5 py-3.5 text-left hover:bg-surface-hover"
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-hover text-muted-foreground">
                <History className="h-4 w-4" />
              </span>
              <span className="text-sm font-semibold text-foreground">Sem etapa definida</span>
              <Badge tone="neutral">{semEtapa.length}</Badge>
            </div>
            <ChevronDown
              className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${abertas["sem_etapa"] ? "rotate-180" : ""}`}
            />
          </button>
          {abertas["sem_etapa"] && (
            <div className="flex flex-col gap-2 border-t border-border p-4">
              {semEtapa.map((e) => (
                <EventoRow
                  key={`${e.evento}-${e.id}`}
                  evento={e}
                  actions={actions}
                  safraFixa={safraFixa}
                  talhoes={talhoes}
                  equipamentos={equipamentos}
                  colaboradores={colaboradores}
                  combustiveis={combustiveis}
                  insumosAplicaveis={insumosAplicaveis}
                />
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

function LancamentosTab({
  safraFixa,
  talhoes,
  equipamentos,
  combustiveis,
  insumosAplicaveis,
  aplicacoes,
  actions,
}: {
  safraFixa: { id: string; nome: string };
  talhoes: Talhao[];
  equipamentos: EquipamentoAbastecivel[];
  combustiveis: Combustivel[];
  insumosAplicaveis: InsumoEstoque[];
  aplicacoes: AplicacaoItem[];
  actions: Actions;
}) {
  return (
    <div className="flex flex-col gap-4">
      {ETAPAS.map((etapa) => {
        const Icon = ETAPA_ICONS[etapa.value] ?? Layers;
        const valor = etapa.value as EtapaValue;
        const categoriasDaEtapa = ETAPA_CATEGORIAS_INSUMO[valor];
        const insumosDaEtapa = categoriasDaEtapa
          ? insumosAplicaveis.filter((i) => categoriasDaEtapa.includes(i.categoria ?? ""))
          : [];
        const mostraAplicacao = !!categoriasDaEtapa;
        const mostraAbastecimento = valor !== "venda";

        return (
          <Card key={etapa.value} className="p-5">
            <div className="mb-1 flex items-center gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                <Icon className="h-4 w-4" />
              </span>
              <h3 className="text-sm font-semibold text-foreground">{etapa.label}</h3>
            </div>
            <p className="mb-4 text-xs text-muted-foreground">{ETAPA_DESCRICOES[etapa.value]}</p>

            <div className="flex flex-wrap gap-2">
              {mostraAplicacao &&
                (insumosDaEtapa.length > 0 && talhoes.length > 0 ? (
                  <NovaAplicacaoMultiModal
                    insumos={insumosDaEtapa}
                    talhoes={talhoes}
                    safraFixa={safraFixa}
                    etapaFixa={etapa.value}
                    proximoNumero={aplicacoes.filter((a) => a.etapa === etapa.value).length + 1}
                    action={actions.criarAplicacao}
                    trigger={
                      <Button type="button" variant="secondary">
                        <FlaskConical className="h-4 w-4" />
                        Nova aplicação
                      </Button>
                    }
                  />
                ) : (
                  <Link
                    href="/estoque-insumos"
                    className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover"
                    title={`Cadastre um insumo de categoria ${categoriasDaEtapa?.join(" ou ")} antes de aplicar`}
                  >
                    <FlaskConical className="h-4 w-4" />
                    Cadastrar insumo primeiro
                  </Link>
                ))}

              {valor === "colheita" && (
                <NovaMovimentacaoModal
                  safras={[]}
                  safraFixa={safraFixa}
                  etapaFixa={etapa.value}
                  title="Nova colheita"
                  defaultTipo="entrada"
                  action={actions.criarMovimentacaoProducao}
                  trigger={
                    <Button type="button" variant="secondary">
                      <Package className="h-4 w-4" />
                      Registrar colheita
                    </Button>
                  }
                />
              )}

              {mostraAbastecimento && combustiveis.length > 0 && (
                <AbastecimentoModal
                  equipamentos={equipamentos}
                  combustiveis={combustiveis}
                  safraFixa={safraFixa}
                  etapaFixa={etapa.value}
                  action={actions.criarAbastecimento}
                  trigger={
                    <Button type="button" variant="secondary">
                      <Fuel className="h-4 w-4" />
                      Abastecer
                    </Button>
                  }
                />
              )}

              <NovoLancamentoModal
                action={actions.criarLancamento}
                safraFixa={safraFixa}
                etapaFixa={etapa.value}
                talhoes={talhoes}
                defaultTipo={valor === "venda" ? "receita" : "despesa"}
                trigger={
                  <Button type="button" variant="secondary">
                    <Plus className="h-4 w-4" />
                    {valor === "venda" ? "Registrar venda" : "Novo lançamento"}
                  </Button>
                }
              />
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function SimulacaoTab({
  safra,
  custoTotal,
  receitaRealizada,
  action,
}: {
  safra: SafraInfo;
  custoTotal: number;
  receitaRealizada: number;
  action: (formData: FormData) => void;
}) {
  const [pending, startTransition] = useTransition();
  const [sacas, setSacas] = useState(safra.sacasPrevistas ?? 0);
  const [preco, setPreco] = useState(safra.precoSacaPrevisto ?? 0);
  const [salvo, setSalvo] = useState(false);

  const receitaProjetada = sacas * preco;
  const margemProjetada = receitaProjetada - custoTotal;
  const margemProjetadaPorHa = safra.areaTotal > 0 ? margemProjetada / safra.areaTotal : 0;
  const produtividadePrevista = safra.areaTotal > 0 ? sacas / safra.areaTotal : 0;

  return (
    <div className="flex flex-col gap-6">
      <Card className="p-5">
        <h2 className="mb-1 text-sm font-semibold text-foreground">Estimativa de produtividade e preço</h2>
        <p className="mb-4 text-xs text-muted-foreground">
          Preencha a expectativa da safra pra simular a margem — comparando com o custo já registrado até agora.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            startTransition(async () => {
              await action(formData);
              setSalvo(true);
              setTimeout(() => setSalvo(false), 2000);
            });
          }}
          className="flex flex-col gap-4"
        >
          <input type="hidden" name="id" value={safra.id} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FieldGroup label="Sacas previstas" htmlFor="sacas-previstas">
              <Input
                id="sacas-previstas"
                name="sacas_previstas"
                type="number"
                step="0.01"
                min="0"
                placeholder="0"
                value={sacas || ""}
                onChange={(e) => setSacas(Number(e.target.value) || 0)}
              />
            </FieldGroup>
            <FieldGroup label="Preço estimado por saca (R$)" htmlFor="preco-saca">
              <Input
                id="preco-saca"
                name="preco_saca_previsto"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={preco || ""}
                onChange={(e) => setPreco(Number(e.target.value) || 0)}
              />
            </FieldGroup>
          </div>
          <Button type="submit" disabled={pending} className="self-start">
            {pending ? "Salvando..." : salvo ? "Salvo ✓" : "Salvar estimativa"}
          </Button>
        </form>
      </Card>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <IconStatCard icon={TrendingUp} tone="primary" label="Receita projetada" value={formatBRL(receitaProjetada)} />
        <IconStatCard icon={TrendingDown} tone="rose" label="Custo até agora" value={formatBRL(custoTotal)} />
        <IconStatCard
          icon={Scale}
          tone={margemProjetada >= 0 ? "primary" : "rose"}
          label="Margem projetada"
          value={formatBRL(margemProjetada)}
          hint={safra.areaTotal > 0 ? `${formatBRL(margemProjetadaPorHa)}/ha` : undefined}
        />
        <IconStatCard
          icon={Package}
          tone="slate"
          label="Produtividade prevista"
          value={safra.areaTotal > 0 ? `${produtividadePrevista.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} sc/ha` : "—"}
        />
      </div>

      <Card className="p-5">
        <p className="text-sm text-muted-foreground">
          Receita já realizada (lançamentos): <span className="font-medium text-foreground">{formatBRL(receitaRealizada)}</span>.
          A simulação acima usa a expectativa de sacas × preço, independente do que já foi lançado como receita — é uma
          projeção, não substitui os lançamentos reais da aba Histórico.
        </p>
      </Card>
    </div>
  );
}

function DadosTab({
  safra,
  talhoes,
  defaultSelecionados,
  actions,
}: {
  safra: SafraInfo;
  talhoes: Talhao[];
  defaultSelecionados: Record<string, number>;
  actions: Actions;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          startTransition(async () => {
            await actions.atualizarSafra(formData);
          });
        }}
        className="flex flex-col gap-4"
      >
        <input type="hidden" name="id" value={safra.id} />
        <SafraFormFields
          idPrefix={`safra-detail-${safra.id}-`}
          talhoes={talhoes}
          defaultCultura={safra.cultura}
          defaultDataInicio={safra.dataInicio}
          defaultDataFim={safra.dataFim ?? ""}
          defaultNome={safra.nome}
          defaultTipoCusto={safra.tipoCusto}
          defaultSelecionados={defaultSelecionados}
        />
        <Button type="submit" disabled={pending} className="mt-2 self-start">
          {pending ? "Salvando..." : "Salvar alterações"}
        </Button>
      </form>

      <Card className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm font-medium text-foreground">Excluir safra</p>
          <p className="text-xs text-muted-foreground">
            Remove a safra e os vínculos de área com os talhões. Lançamentos, manutenções e abastecimentos já
            registrados continuam existindo, apenas sem a safra vinculada.
          </p>
        </div>
        <form action={actions.excluirSafra}>
          <input type="hidden" name="id" value={safra.id} />
          <ConfirmButton
            confirmText={`Excluir a safra "${safra.nome}"?`}
            title="Excluir"
            className="inline-flex items-center gap-2 rounded-lg border border-danger/30 px-4 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger-soft"
          >
            <Trash2 className="h-4 w-4" />
            Excluir
          </ConfirmButton>
        </form>
      </Card>
    </div>
  );
}
