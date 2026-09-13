import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Home,
  Sprout,
  CalendarDays,
  History,
  TrendingDown,
  Wrench,
  Fuel,
  FlaskConical,
  Package,
  TrendingUp,
  TrendingDown as TrendingDownIcon,
  ArrowRight,
  CheckCircle2,
  MapPin,
  LandPlot,
  Tractor,
  Database,
  AlertTriangle,
  CloudRain,
  BarChart3,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCachedUser, getPerfilAtual, redirectIfPlatformAdmin } from "@/lib/supabase/admin";
import { PageBanner } from "@/components/ui/page-banner";
import { IconStatCard } from "@/components/ui/icon-stat-card";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { CULTURAS } from "../safras/culturas";
import { CALENDARIO_AGRONOMICO } from "./calendario-agronomico";

function formatBRL(valor: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);
}

function formatHa(valor: number) {
  return `${valor.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} ha`;
}

function diasEntre(dataInicio: string, referencia: Date) {
  const inicio = new Date(`${dataInicio}T00:00:00`);
  return Math.floor((referencia.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDataCurta(data: string) {
  return new Date(`${data}T00:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

type Evento = {
  data: string;
  safraNome: string;
  icon: typeof Wrench;
  cor: string;
  resumo: string;
};

export default async function DashboardPage() {
  const user = await getCachedUser();

  if (!user) {
    redirect("/login");
  }

  await redirectIfPlatformAdmin();

  const supabase = await createClient();
  const hoje = new Date();
  const hojeStr = hoje.toISOString().slice(0, 10);

  const inicioGrafico = new Date(hoje.getFullYear(), hoje.getMonth() - 5, 1);
  const inicioGraficoStr = inicioGrafico.toISOString().slice(0, 10);

  const [
    perfil,
    { data: todasSafras },
    { data: propriedades },
    { data: talhoes },
    { data: equipamentos },
    { data: insumos },
    { data: ultimaLeitura },
    { data: lancamentosGrafico },
    { data: manutencoesGrafico },
    { data: abastecimentosGrafico },
    { data: aplicacoesGrafico },
  ] = await Promise.all([
    getPerfilAtual(),
    supabase.from("safras").select("id, nome, cultura, data_inicio, data_fim").order("data_inicio", { ascending: false }),
    supabase.from("propriedades").select("id, area_ha"),
    supabase.from("talhoes").select("id, area_ha"),
    supabase.from("equipamentos").select("id, status"),
    supabase.from("insumos").select("id, nome, unidade, estoque_atual, custo_medio"),
    supabase
      .from("registros_climaticos")
      .select("data, precipitacao_mm, temperatura_c, umidade_pct, estacoes_climaticas(nome, propriedades(nome))")
      .order("data", { ascending: false })
      .limit(1),
    supabase
      .from("lancamentos_financeiros")
      .select("valor, data")
      .eq("tipo", "despesa")
      .eq("status", "realizado")
      .gte("data", inicioGraficoStr),
    supabase.from("manutencoes").select("custo, data").gte("data", inicioGraficoStr),
    supabase.from("abastecimentos").select("custo_total, data").gte("data", inicioGraficoStr),
    supabase.from("movimentacoes_insumo").select("custo_total, data").eq("tipo", "aplicacao").gte("data", inicioGraficoStr),
  ]);

  const leitura = (ultimaLeitura ?? [])[0];
  const estacaoLeitura = leitura ? (Array.isArray(leitura.estacoes_climaticas) ? leitura.estacoes_climaticas[0] : leitura.estacoes_climaticas) : null;
  const propriedadeLeitura = estacaoLeitura
    ? Array.isArray(estacaoLeitura.propriedades)
      ? estacaoLeitura.propriedades[0]
      : estacaoLeitura.propriedades
    : null;

  const mesesGrafico = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - 5 + i, 1);
    return { chave: d.toISOString().slice(0, 7), label: d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "") };
  });
  const gastosPorMes = Object.fromEntries(mesesGrafico.map((m) => [m.chave, 0])) as Record<string, number>;
  for (const l of lancamentosGrafico ?? []) {
    const chave = l.data.slice(0, 7);
    if (chave in gastosPorMes) gastosPorMes[chave] += l.valor;
  }
  for (const m of manutencoesGrafico ?? []) {
    const chave = m.data.slice(0, 7);
    if (chave in gastosPorMes) gastosPorMes[chave] += m.custo;
  }
  for (const a of abastecimentosGrafico ?? []) {
    const chave = a.data.slice(0, 7);
    if (chave in gastosPorMes) gastosPorMes[chave] += a.custo_total;
  }
  for (const ap of aplicacoesGrafico ?? []) {
    const chave = ap.data.slice(0, 7);
    if (chave in gastosPorMes) gastosPorMes[chave] += ap.custo_total ?? 0;
  }
  const maxGasto = Math.max(...mesesGrafico.map((m) => gastosPorMes[m.chave]), 1);
  const temGastos = mesesGrafico.some((m) => gastosPorMes[m.chave] > 0);

  const primeiroNome = (perfil?.nome_completo ?? user.email ?? "").split(" ")[0];

  const ativas = (todasSafras ?? []).filter((s) => s.data_inicio <= hojeStr && (!s.data_fim || s.data_fim >= hojeStr));
  const semSafraAtiva = ativas.length === 0;
  const recentesSemAtiva = semSafraAtiva ? (todasSafras ?? []).slice(0, 3) : [];
  const safrasParaCards = (semSafraAtiva ? recentesSemAtiva : ativas).slice(0, 3);
  const idsConsulta = safrasParaCards.map((s) => s.id);

  const areaPropriedades = (propriedades ?? []).reduce((soma, p) => soma + Number(p.area_ha), 0);
  const areaTalhoes = (talhoes ?? []).reduce((soma, t) => soma + Number(t.area_ha), 0);
  const equipamentosAtivos = (equipamentos ?? []).filter((e) => e.status === "ativo").length;
  const equipamentosManutencao = (equipamentos ?? []).filter((e) => e.status === "manutencao").length;
  const valorEstoqueInsumos = (insumos ?? []).reduce(
    (soma, i) => soma + Number(i.estoque_atual) * Number(i.custo_medio ?? 0),
    0,
  );
  const insumosZerados = (insumos ?? []).filter((i) => Number(i.estoque_atual) <= 0);

  let custoPorSafra: Record<string, number> = {};
  let eventos: Evento[] = [];

  if (idsConsulta.length > 0) {
    const [{ data: lancamentos }, { data: manutencoes }, { data: abastecimentos }, { data: aplicacoes }, { data: producao }] =
      await Promise.all([
        supabase
          .from("lancamentos_financeiros")
          .select("id, tipo, categoria, valor, status, data, safra_id")
          .in("safra_id", idsConsulta)
          .order("data", { ascending: false }),
        supabase
          .from("manutencoes")
          .select("id, descricao, custo, data, safra_id, equipamentos(nome)")
          .in("safra_id", idsConsulta)
          .order("data", { ascending: false }),
        supabase
          .from("abastecimentos")
          .select("id, litros, custo_total, data, safra_id, equipamentos(nome), insumos(nome)")
          .in("safra_id", idsConsulta)
          .order("data", { ascending: false }),
        supabase
          .from("aplicacoes")
          .select("id, numero, data, safra_id, talhoes(nome), movimentacoes_insumo(custo_total)")
          .in("safra_id", idsConsulta)
          .order("data", { ascending: false }),
        supabase
          .from("estoque_producao")
          .select("id, produto, quantidade, unidade, data, safra_id")
          .in("safra_id", idsConsulta)
          .eq("tipo", "entrada")
          .order("data", { ascending: false }),
      ]);

    const nomeSafra = (id: string | null) => safrasParaCards.find((s) => s.id === id)?.nome ?? "—";

    custoPorSafra = Object.fromEntries(idsConsulta.map((id) => [id, 0]));

    for (const l of lancamentos ?? []) {
      if (l.tipo === "despesa" && l.status === "realizado" && l.safra_id) {
        custoPorSafra[l.safra_id] = (custoPorSafra[l.safra_id] ?? 0) + l.valor;
      }
      if (l.safra_id) {
        eventos.push({
          data: l.data,
          safraNome: nomeSafra(l.safra_id),
          icon: l.tipo === "receita" ? TrendingUp : TrendingDownIcon,
          cor: l.tipo === "receita" ? "text-primary bg-primary-soft" : "text-rose-700 bg-rose-100 dark:bg-rose-950 dark:text-rose-300",
          resumo: `${l.categoria} · ${formatBRL(l.valor)}`,
        });
      }
    }

    for (const m of manutencoes ?? []) {
      if (m.safra_id) {
        custoPorSafra[m.safra_id] = (custoPorSafra[m.safra_id] ?? 0) + m.custo;
        const equipamento = Array.isArray(m.equipamentos) ? m.equipamentos[0] : m.equipamentos;
        eventos.push({
          data: m.data,
          safraNome: nomeSafra(m.safra_id),
          icon: Wrench,
          cor: "text-amber-700 bg-amber-100 dark:bg-amber-950 dark:text-amber-300",
          resumo: `Manutenção · ${equipamento?.nome ?? m.descricao}`,
        });
      }
    }

    for (const a of abastecimentos ?? []) {
      if (a.safra_id) {
        custoPorSafra[a.safra_id] = (custoPorSafra[a.safra_id] ?? 0) + a.custo_total;
        const equipamento = Array.isArray(a.equipamentos) ? a.equipamentos[0] : a.equipamentos;
        const insumo = Array.isArray(a.insumos) ? a.insumos[0] : a.insumos;
        eventos.push({
          data: a.data,
          safraNome: nomeSafra(a.safra_id),
          icon: Fuel,
          cor: "text-blue-700 bg-blue-100 dark:bg-blue-950 dark:text-blue-300",
          resumo: `Abastecimento · ${insumo?.nome ?? "combustível"} · ${equipamento?.nome ?? ""}`,
        });
      }
    }

    for (const ap of aplicacoes ?? []) {
      if (ap.safra_id) {
        const custo = (ap.movimentacoes_insumo ?? []).reduce((soma, it) => soma + (it.custo_total ?? 0), 0);
        custoPorSafra[ap.safra_id] = (custoPorSafra[ap.safra_id] ?? 0) + custo;
        const talhao = Array.isArray(ap.talhoes) ? ap.talhoes[0] : ap.talhoes;
        eventos.push({
          data: ap.data,
          safraNome: nomeSafra(ap.safra_id),
          icon: FlaskConical,
          cor: "text-teal-700 bg-teal-100 dark:bg-teal-950 dark:text-teal-300",
          resumo: `${ap.numero}ª aplicação · ${talhao?.nome ?? "—"}`,
        });
      }
    }

    for (const p of producao ?? []) {
      if (p.safra_id) {
        eventos.push({
          data: p.data,
          safraNome: nomeSafra(p.safra_id),
          icon: Package,
          cor: "text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300",
          resumo: `Colheita · ${p.produto} · ${p.quantidade} ${p.unidade}`,
        });
      }
    }

    eventos = eventos.sort((a, b) => (a.data < b.data ? 1 : a.data > b.data ? -1 : 0)).slice(0, 6);
  }

  return (
    <div>
      <PageBanner
        icon={Home}
        title={`Olá, ${primeiroNome}`}
        description="Resumo do seu negócio agora."
        tags={ativas.length ? ativas.map((s) => s.nome) : undefined}
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <IconStatCard
          icon={MapPin}
          tone="slate"
          label="Propriedades"
          value={String((propriedades ?? []).length)}
          hint={(propriedades ?? []).length ? formatHa(areaPropriedades) : undefined}
        />
        <IconStatCard
          icon={LandPlot}
          tone="primary"
          label="Talhões"
          value={String((talhoes ?? []).length)}
          hint={(talhoes ?? []).length ? formatHa(areaTalhoes) : undefined}
        />
        <IconStatCard
          icon={Tractor}
          tone="amber"
          label="Equipamentos"
          value={String((equipamentos ?? []).length)}
          hint={
            (equipamentos ?? []).length
              ? `${equipamentosAtivos} ativos${equipamentosManutencao ? ` · ${equipamentosManutencao} em manutenção` : ""}`
              : undefined
          }
        />
        <IconStatCard
          icon={Database}
          tone="blue"
          label="Estoque de insumos"
          value={formatBRL(valorEstoqueInsumos)}
          hint={`${(insumos ?? []).length} insumo${(insumos ?? []).length === 1 ? "" : "s"} cadastrado${(insumos ?? []).length === 1 ? "" : "s"}`}
        />
      </div>

      {insumosZerados.length > 0 && (
        <Card className="mb-6 flex items-center gap-3 border-danger/30 bg-danger-soft p-4">
          <AlertTriangle className="h-5 w-5 shrink-0 text-danger" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-danger">
              {insumosZerados.length} insumo{insumosZerados.length === 1 ? "" : "s"} com estoque zerado
            </p>
            <p className="truncate text-xs text-danger/80">{insumosZerados.map((i) => i.nome).join(", ")}</p>
          </div>
          <Link href="/estoque-insumos" className="ml-auto shrink-0 text-sm font-medium text-danger hover:underline">
            Ver estoque
          </Link>
        </Card>
      )}

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
            <BarChart3 className="h-4 w-4" />
            Gastos por mês
          </h2>
          {temGastos ? (
            <div className="flex items-end justify-between gap-2" style={{ height: 120 }}>
              {mesesGrafico.map((m) => {
                const valor = gastosPorMes[m.chave];
                const alturaPct = Math.max((valor / maxGasto) * 100, valor > 0 ? 4 : 0);
                return (
                  <div key={m.chave} className="group relative flex flex-1 flex-col items-center gap-2">
                    <div className="relative flex h-24 w-full items-end justify-center">
                      <div
                        className="w-full max-w-8 rounded-t-md bg-primary transition-opacity group-hover:opacity-80"
                        style={{ height: `${alturaPct}%` }}
                      />
                      <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background opacity-0 shadow-[var(--shadow-2)] transition-opacity group-hover:opacity-100">
                        {formatBRL(valor)}
                      </div>
                    </div>
                    <span className="text-xs capitalize text-muted-foreground">{m.label}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nenhum gasto registrado nos últimos 6 meses.
            </p>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
            <CloudRain className="h-4 w-4" />
            Última leitura climática
          </h2>
          {leitura ? (
            <div>
              <p className="text-xs text-muted-foreground">
                {estacaoLeitura?.nome ?? "Estação"}
                {propriedadeLeitura?.nome ? ` · ${propriedadeLeitura.nome}` : ""} · {formatDataCurta(leitura.data)}
              </p>
              <div className="mt-3 grid grid-cols-3 gap-3">
                <div>
                  <p className="text-lg font-semibold text-foreground">
                    {leitura.temperatura_c != null ? `${leitura.temperatura_c}°C` : "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">Temperatura</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-foreground">
                    {leitura.precipitacao_mm != null ? `${leitura.precipitacao_mm} mm` : "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">Chuva</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-foreground">
                    {leitura.umidade_pct != null ? `${leitura.umidade_pct}%` : "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">Umidade</p>
                </div>
              </div>
              <Link
                href="/registros/leituras"
                className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                Ver histórico
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <EmptyState icon={CloudRain} title="Nenhuma leitura climática registrada" />
          )}
        </Card>
      </div>

      {(todasSafras ?? []).length === 0 ? (
        <Card>
          <EmptyState
            icon={Sprout}
            title="Nenhuma safra cadastrada"
            description="Cadastre uma safra para acompanhar aqui o calendário de manejo, os custos acumulados e a atividade recente."
          />
        </Card>
      ) : (
        <div className="flex flex-col gap-6">
          {semSafraAtiva && (
            <p className="text-sm text-muted-foreground">
              Nenhuma safra em andamento no momento. Mostrando a{recentesSemAtiva.length === 1 ? "" : "s"} mais
              recente{recentesSemAtiva.length === 1 ? "" : "s"} cadastrada{recentesSemAtiva.length === 1 ? "" : "s"}.
            </p>
          )}

          <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
            {safrasParaCards.map((safra) => {
              const culturaLabel = CULTURAS.find((c) => c.value === safra.cultura)?.label ?? safra.cultura;
              const dias = diasEntre(safra.data_inicio, hoje);
              const custo = custoPorSafra[safra.id] ?? 0;
              return (
                <Card key={safra.id} className="p-5">
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{safra.nome}</p>
                      <p className="text-xs text-muted-foreground">{culturaLabel}</p>
                    </div>
                    <Badge tone="primary">{dias >= 0 ? `${dias} dias` : "não iniciada"}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingDown className="h-4 w-4 shrink-0 text-rose-600" />
                    Custo acumulado: <span className="font-medium text-foreground">{formatBRL(custo)}</span>
                  </div>
                  <Link
                    href={`/safras/${safra.id}`}
                    className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    Ver detalhes
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="flex flex-col gap-4">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <CalendarDays className="h-4 w-4" />
                Calendário de manejo
              </h2>
              {safrasParaCards
                .filter((s) => s.cultura in CALENDARIO_AGRONOMICO)
                .map((safra) => {
                  const dias = diasEntre(safra.data_inicio, hoje);
                  const fases = CALENDARIO_AGRONOMICO[safra.cultura];
                  return (
                    <Card key={safra.id} className="p-5">
                      <p className="mb-1 text-sm font-semibold text-foreground">{safra.nome}</p>
                      <p className="mb-4 text-xs text-muted-foreground">
                        Estimativa genérica a partir do início da safra — ajuste pela sua região, cultivar e
                        acompanhamento agronômico.
                      </p>
                      <div className="flex flex-col gap-1">
                        {fases.map((fase, i) => {
                          const atual = dias >= fase.inicio && dias <= fase.fim;
                          const passada = dias > fase.fim;
                          return (
                            <div
                              key={i}
                              className={`flex gap-3 rounded-lg border p-3 ${
                                atual
                                  ? "border-primary/30 bg-primary-soft"
                                  : passada
                                    ? "border-transparent opacity-50"
                                    : "border-border"
                              }`}
                            >
                              <span className="mt-0.5 shrink-0">
                                {passada ? (
                                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <span
                                    className={`flex h-4 w-4 items-center justify-center rounded-full ${atual ? "bg-primary" : "bg-border"}`}
                                  />
                                )}
                              </span>
                              <div className="min-w-0">
                                <p
                                  className={`text-sm font-medium ${atual ? "text-primary" : "text-foreground"}`}
                                >
                                  {fase.titulo}{" "}
                                  <span className="font-normal text-muted-foreground">
                                    ({fase.inicio}–{fase.fim} dias)
                                  </span>
                                </p>
                                <p className="text-xs text-muted-foreground">{fase.descricao}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                  );
                })}
              {safrasParaCards.every((s) => !(s.cultura in CALENDARIO_AGRONOMICO)) && (
                <Card className="p-5">
                  <p className="text-sm text-muted-foreground">
                    Calendário de manejo de referência ainda não disponível para a(s) cultura(s) dessa(s) safra(s).
                  </p>
                </Card>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <History className="h-4 w-4" />
                Atividade recente
              </h2>
              <Card className="p-2">
                {eventos.length ? (
                  <div className="flex flex-col">
                    {eventos.map((e, i) => (
                      <div key={i} className="flex items-center gap-3 p-3">
                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${e.cor}`}>
                          <e.icon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">{e.resumo}</p>
                          <p className="text-xs text-muted-foreground">
                            {e.safraNome} · {formatDataCurta(e.data)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState icon={History} title="Nenhuma atividade registrada ainda" />
                )}
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
