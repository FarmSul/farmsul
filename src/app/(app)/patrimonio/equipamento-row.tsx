"use client";

import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import * as Tabs from "@radix-ui/react-tabs";
import { useEffect, useRef, useState, useTransition } from "react";
import { Trash2, Tractor, X, Pencil, History, Wrench, ShoppingCart, Fuel, FileText, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { EquipamentoFormFields } from "./equipamento-form-fields";
import { AbrirManutencaoModal } from "./abrir-manutencao-modal";
import { AbastecimentoModal, type Combustivel } from "./abastecimento-modal";
import { TIPO_LABELS, TIPO_MAQUINA_LABELS, STATUS_LABELS } from "./labels";
import { calcularDepreciacao } from "./depreciacao";

function formatBRL(valor: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);
}

type Manutencao = {
  id: string;
  data: string;
  descricao: string;
  custo: number;
  notaFiscalUrl: string | null;
  responsavelNome: string | undefined;
  safraNome: string | undefined;
};

type Abastecimento = {
  id: string;
  data: string;
  litros: number;
  custoTotal: number;
  combustivelNome: string;
  safraNome: string | undefined;
};

const TABS = [
  { value: "dados", label: "Dados", icon: Pencil },
  { value: "historico", label: "Histórico", icon: History },
];

function formatDataLonga(data: string) {
  return new Date(`${data}T00:00:00`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatDataCurta(data: string) {
  return new Date(`${data}T00:00:00`).toLocaleDateString("pt-BR");
}

function AnimatedTabsList({ value }: { value: string }) {
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicator, setIndicator] = useState<{ left: number; width: number }>({ left: 0, width: 0 });

  useEffect(() => {
    const el = triggerRefs.current[value];
    if (el) {
      setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
    }
  }, [value]);

  return (
    <Tabs.List className="relative mb-5 flex gap-5 border-b border-border/50">
      {TABS.map(({ value: tabValue, label, icon: Icon }) => (
        <Tabs.Trigger
          key={tabValue}
          ref={(el) => {
            triggerRefs.current[tabValue] = el;
          }}
          value={tabValue}
          className="flex items-center gap-1.5 px-1 pb-2 text-sm font-medium text-muted-foreground transition-colors data-[state=active]:text-primary"
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

type EquipamentoDados = {
  id: string;
  nome: string;
  tipo: string;
  tipoMaquina: string | null;
  implemento: boolean;
  modelo: string | null;
  fabricante: string | null;
  anoFabricacao: number | null;
  vidaUtilHoras: number | null;
  horimetroAtual: number | null;
  observacoes: string | null;
  status: string;
  dataAquisicao: string | null;
  valorAquisicao: number | null;
  fotoUrl: string | null;
};

function DadosTab({
  dados,
  atualizarAction,
  onSaved,
}: {
  dados: EquipamentoDados;
  atualizarAction: (formData: FormData) => void;
  onSaved: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const depreciacao = calcularDepreciacao(dados.valorAquisicao, dados.vidaUtilHoras, dados.horimetroAtual);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
          await atualizarAction(formData);
          onSaved();
        });
      }}
      className="flex flex-col gap-4"
    >
      <input type="hidden" name="id" value={dados.id} />

      {depreciacao && (
        <div className="grid grid-cols-3 gap-3 rounded-lg bg-surface-hover p-3 text-center">
          <div>
            <p className="text-sm font-semibold text-foreground">{formatBRL(depreciacao.valorAtual)}</p>
            <p className="text-xs text-muted-foreground">Valor atual</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{formatBRL(depreciacao.depreciacaoAcumulada)}</p>
            <p className="text-xs text-muted-foreground">Depreciação acumulada</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{depreciacao.percentualDepreciado.toFixed(0)}%</p>
            <p className="text-xs text-muted-foreground">Vida útil consumida</p>
          </div>
        </div>
      )}
      <EquipamentoFormFields
        idPrefix={`edit-equip-${dados.id}-`}
        defaultNome={dados.nome}
        defaultTipo={dados.tipo}
        defaultTipoMaquina={dados.tipoMaquina ?? "trator"}
        defaultImplemento={dados.implemento}
        defaultModelo={dados.modelo ?? ""}
        defaultFabricante={dados.fabricante ?? ""}
        defaultAnoFabricacao={dados.anoFabricacao ?? ""}
        defaultVidaUtilHoras={dados.vidaUtilHoras ?? ""}
        defaultHorimetroAtual={dados.horimetroAtual ?? ""}
        defaultObservacoes={dados.observacoes ?? ""}
        defaultStatus={dados.status}
        defaultDataAquisicao={dados.dataAquisicao ?? ""}
        defaultValorAquisicao={dados.valorAquisicao ?? ""}
        defaultFotoUrl={dados.fotoUrl}
      />
      <Button type="submit" disabled={pending} className="mt-2">
        {pending ? "Salvando..." : "Salvar alterações"}
      </Button>
    </form>
  );
}

function HistoricoTab({
  equipamentoId,
  equipamentoNome,
  horimetroAtual,
  dataAquisicao,
  manutencoes,
  abastecimentos,
  colaboradores,
  combustiveis,
  safras,
  criarManutencaoAction,
  excluirManutencaoAction,
  criarAbastecimentoAction,
  excluirAbastecimentoAction,
}: {
  equipamentoId: string;
  equipamentoNome: string;
  horimetroAtual: number | null;
  dataAquisicao: string | null;
  manutencoes: Manutencao[];
  abastecimentos: Abastecimento[];
  colaboradores: { id: string; nome: string }[];
  combustiveis: Combustivel[];
  safras: { id: string; nome: string }[];
  criarManutencaoAction: (formData: FormData) => void;
  excluirManutencaoAction: (formData: FormData) => void;
  criarAbastecimentoAction: (formData: FormData) => void;
  excluirAbastecimentoAction: (formData: FormData) => void;
}) {
  const eventos = [
    ...manutencoes.map((m) => ({ tipo: "manutencao" as const, ...m })),
    ...abastecimentos.map((a) => ({ tipo: "abastecimento" as const, ...a })),
  ].sort((a, b) => (a.data < b.data ? 1 : a.data > b.data ? -1 : 0));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap justify-end gap-2">
        <AbrirManutencaoModal
          equipamentoFixo={{ id: equipamentoId, nome: equipamentoNome }}
          colaboradores={colaboradores}
          safras={safras}
          action={criarManutencaoAction}
          trigger={
            <Button type="button" variant="secondary">
              <Plus className="h-4 w-4" />
              Abrir manutenção
            </Button>
          }
        />
        {combustiveis.length > 0 && (
          <AbastecimentoModal
            equipamentoFixo={{ id: equipamentoId, nome: equipamentoNome, horimetroAtual }}
            combustiveis={combustiveis}
            safras={safras}
            action={criarAbastecimentoAction}
            trigger={
              <Button type="button" variant="secondary">
                <Fuel className="h-4 w-4" />
                Abastecer
              </Button>
            }
          />
        )}
      </div>

      {eventos.length || dataAquisicao ? (
        <div className="flex flex-col gap-2">
          {eventos.map((e) =>
            e.tipo === "manutencao" ? (
              <div key={`m-${e.id}`} className="flex items-center gap-3 rounded-lg border border-border p-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                  <Wrench className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{e.descricao}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDataLonga(e.data)}
                    {e.responsavelNome && ` · ${e.responsavelNome}`}
                    {e.safraNome && ` · ${e.safraNome}`}
                    {e.custo > 0 &&
                      ` · ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(e.custo)}`}
                  </p>
                </div>
                {e.notaFiscalUrl && (
                  <a
                    href={e.notaFiscalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Ver nota fiscal"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-hover hover:text-primary"
                  >
                    <FileText className="h-4 w-4" />
                  </a>
                )}
                <form action={excluirManutencaoAction}>
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
            ) : (
              <div key={`a-${e.id}`} className="flex items-center gap-3 rounded-lg border border-border p-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  <Fuel className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    Abastecimento · {e.combustivelNome} · {e.litros} L
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDataLonga(e.data)} ·{" "}
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(e.custoTotal)}
                    {e.safraNome && ` · ${e.safraNome}`}
                  </p>
                </div>
                <form action={excluirAbastecimentoAction}>
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
            ),
          )}

          {dataAquisicao && (
            <div className="flex items-center gap-3 rounded-lg bg-surface-hover p-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                <ShoppingCart className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">Aquisição</p>
                <p className="text-xs text-muted-foreground">{formatDataLonga(dataAquisicao)}</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="py-6 text-center text-sm text-muted-foreground">Nenhum evento registrado ainda.</p>
      )}
    </div>
  );
}

export function EquipamentoRow({
  id,
  nome,
  tipo,
  tipoMaquina,
  implemento,
  modelo,
  fabricante,
  anoFabricacao,
  vidaUtilHoras,
  horimetroAtual,
  observacoes,
  status,
  dataAquisicao,
  valorAquisicao,
  fotoUrl,
  manutencoes,
  abastecimentos,
  colaboradores,
  combustiveis,
  safras,
  atualizarAction,
  excluirAction,
  criarManutencaoAction,
  excluirManutencaoAction,
  criarAbastecimentoAction,
  excluirAbastecimentoAction,
}: {
  id: string;
  nome: string;
  tipo: string;
  tipoMaquina: string | null;
  implemento: boolean;
  modelo: string | null;
  fabricante: string | null;
  anoFabricacao: number | null;
  vidaUtilHoras: number | null;
  horimetroAtual: number | null;
  observacoes: string | null;
  status: string;
  dataAquisicao: string | null;
  valorAquisicao: number | null;
  fotoUrl: string | null;
  manutencoes: Manutencao[];
  abastecimentos: Abastecimento[];
  colaboradores: { id: string; nome: string }[];
  combustiveis: Combustivel[];
  safras: { id: string; nome: string }[];
  atualizarAction: (formData: FormData) => void;
  excluirAction: (formData: FormData) => void;
  criarManutencaoAction: (formData: FormData) => void;
  excluirManutencaoAction: (formData: FormData) => void;
  criarAbastecimentoAction: (formData: FormData) => void;
  excluirAbastecimentoAction: (formData: FormData) => void;
}) {
  const [open, setOpen] = useState(false);
  const [tabValue, setTabValue] = useState("dados");
  const depreciacao = calcularDepreciacao(valorAquisicao, vidaUtilHoras, horimetroAtual);

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setTabValue("dados");
      }}
    >
      <Dialog.Trigger asChild>
        <tr className="cursor-pointer border-b border-border last:border-0 hover:bg-surface-hover">
          <td className="px-6 py-3.5 font-medium text-foreground">
            <span className="flex items-center gap-2.5">
              <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-surface-hover">
                {fotoUrl ? (
                  <Image src={fotoUrl} alt={nome} fill className="object-cover" unoptimized />
                ) : (
                  <Tractor className="h-5 w-5 text-muted-foreground" />
                )}
              </span>
              {nome}
            </span>
          </td>
          <td className="px-6 py-3.5">
            <Badge tone="primary">
              {tipo === "maquina" && tipoMaquina
                ? TIPO_MAQUINA_LABELS[tipoMaquina] ?? tipoMaquina
                : TIPO_LABELS[tipo] ?? tipo}
            </Badge>
          </td>
          <td className="px-6 py-3.5 text-muted-foreground">
            {dataAquisicao ? formatDataCurta(dataAquisicao) : "—"}
          </td>
          <td className="px-6 py-3.5 text-muted-foreground">
            {valorAquisicao != null ? formatBRL(valorAquisicao) : "—"}
          </td>
          <td className="px-6 py-3.5 text-muted-foreground">
            {depreciacao ? (
              <>
                {formatBRL(depreciacao.valorAtual)}
                <span className="ml-1 text-xs">({depreciacao.percentualDepreciado.toFixed(0)}% deprec.)</span>
              </>
            ) : (
              <span title="Cadastre valor de aquisição e vida útil em horas pra calcular">—</span>
            )}
          </td>
          <td className="px-6 py-3.5">
            <Badge tone={status === "manutencao" ? "amber" : status === "inativo" ? "neutral" : "primary"}>
              {STATUS_LABELS[status] ?? status}
            </Badge>
          </td>
          <td className="px-6 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
            <form action={excluirAction}>
              <input type="hidden" name="id" value={id} />
              <ConfirmButton
                confirmText={`Excluir o equipamento "${nome}"?`}
                title="Excluir"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-danger-soft hover:text-danger"
              >
                <Trash2 className="h-4 w-4" />
              </ConfirmButton>
            </form>
          </td>
        </tr>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 data-[state=open]:[animation:overlay-in_150ms_var(--ease-out-3)]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-border bg-surface p-6 shadow-[var(--shadow-4)] focus:outline-none data-[state=open]:[animation:modal-in_200ms_var(--ease-out-4)]">
          <div className="mb-4 flex items-start justify-between gap-4">
            <Dialog.Title className="text-lg font-semibold text-foreground">{nome}</Dialog.Title>
            <Dialog.Close className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-surface-hover hover:text-foreground">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          <Tabs.Root value={tabValue} onValueChange={setTabValue}>
            <AnimatedTabsList value={tabValue} />

            <Tabs.Content value="dados">
              <DadosTab
                dados={{
                  id,
                  nome,
                  tipo,
                  tipoMaquina,
                  implemento,
                  modelo,
                  fabricante,
                  anoFabricacao,
                  vidaUtilHoras,
                  horimetroAtual,
                  observacoes,
                  status,
                  dataAquisicao,
                  valorAquisicao,
                  fotoUrl,
                }}
                atualizarAction={atualizarAction}
                onSaved={() => setOpen(false)}
              />
            </Tabs.Content>
            <Tabs.Content value="historico">
              <HistoricoTab
                equipamentoId={id}
                equipamentoNome={nome}
                horimetroAtual={horimetroAtual}
                dataAquisicao={dataAquisicao}
                manutencoes={manutencoes}
                abastecimentos={abastecimentos}
                colaboradores={colaboradores}
                combustiveis={combustiveis}
                safras={safras}
                criarManutencaoAction={criarManutencaoAction}
                excluirManutencaoAction={excluirManutencaoAction}
                criarAbastecimentoAction={criarAbastecimentoAction}
                excluirAbastecimentoAction={excluirAbastecimentoAction}
              />
            </Tabs.Content>
          </Tabs.Root>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
