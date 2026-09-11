"use client";

import { useState, useTransition, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { FieldGroup, Input, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

export type Combustivel = { id: string; nome: string; unidade: string; custoMedio: number | null; estoqueAtual: number };

export type EquipamentoAbastecivel = { id: string; nome: string; horimetroAtual: number | null };

export type AbastecimentoExistente = {
  id: string;
  equipamentoId: string;
  insumoId: string;
  safraId: string | null;
  litros: number;
  custoTotal: number;
  horimetro: number | null;
  data: string;
};

export function AbastecimentoModal({
  trigger,
  equipamentos,
  equipamentoFixo,
  combustiveis,
  safras,
  safraFixa,
  etapaFixa,
  action,
  abastecimento,
}: {
  trigger: ReactNode;
  equipamentos?: EquipamentoAbastecivel[];
  equipamentoFixo?: EquipamentoAbastecivel;
  combustiveis: Combustivel[];
  safras?: { id: string; nome: string }[];
  safraFixa?: { id: string; nome: string };
  etapaFixa?: string;
  action: (formData: FormData) => void;
  abastecimento?: AbastecimentoExistente;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [equipamentoId, setEquipamentoId] = useState(
    equipamentoFixo?.id ?? abastecimento?.equipamentoId ?? equipamentos?.[0]?.id ?? "",
  );
  const [insumoId, setInsumoId] = useState(abastecimento?.insumoId ?? combustiveis[0]?.id ?? "");
  const [litros, setLitros] = useState(abastecimento?.litros ?? 0);
  const [custoTotal, setCustoTotal] = useState(abastecimento?.custoTotal ?? 0);
  const [custoManual, setCustoManual] = useState(!!abastecimento);
  const [erro, setErro] = useState<string | null>(null);

  const editando = !!abastecimento;
  const combustivelSelecionado = combustiveis.find((c) => c.id === insumoId);
  const equipamentoSelecionado = equipamentoFixo ?? equipamentos?.find((eq) => eq.id === equipamentoId);

  // Ao editar sem trocar o combustível, o litro desse abastecimento ainda
  // não foi devolvido ao estoque exibido — soma de volta pra validar certo.
  const limiteDisponivel = combustivelSelecionado
    ? combustivelSelecionado.estoqueAtual + (editando && abastecimento.insumoId === insumoId ? abastecimento.litros : 0)
    : Infinity;
  const estoqueInsuficiente = litros > limiteDisponivel;

  function atualizarLitros(valor: number) {
    setLitros(valor);
    if (!custoManual && combustivelSelecionado?.custoMedio) {
      setCustoTotal(Math.round(valor * combustivelSelecionado.custoMedio * 100) / 100);
    }
  }

  function atualizarInsumo(id: string) {
    setInsumoId(id);
    const combustivel = combustiveis.find((c) => c.id === id);
    if (!custoManual && combustivel?.custoMedio) {
      setCustoTotal(Math.round(litros * combustivel.custoMedio * 100) / 100);
    }
  }

  function resetar() {
    setEquipamentoId(equipamentoFixo?.id ?? abastecimento?.equipamentoId ?? equipamentos?.[0]?.id ?? "");
    setInsumoId(abastecimento?.insumoId ?? combustiveis[0]?.id ?? "");
    setLitros(abastecimento?.litros ?? 0);
    setCustoTotal(abastecimento?.custoTotal ?? 0);
    setCustoManual(!!abastecimento);
    setErro(null);
  }

  if (!combustiveis.length) {
    return null;
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) resetar();
      }}
    >
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 data-[state=open]:[animation:overlay-in_150ms_var(--ease-out-3)]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-border bg-surface p-6 shadow-[var(--shadow-4)] focus:outline-none data-[state=open]:[animation:modal-in_200ms_var(--ease-out-4)]">
          <div className="mb-5 flex items-start justify-between gap-4">
            <Dialog.Title className="text-lg font-semibold text-foreground">
              {editando ? "Editar abastecimento" : "Novo abastecimento"}
            </Dialog.Title>
            <Dialog.Close className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-surface-hover hover:text-foreground">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setErro(null);
              if (litros <= 0) {
                setErro("Informe a quantidade de litros abastecida.");
                return;
              }
              if (estoqueInsuficiente && combustivelSelecionado) {
                setErro(
                  `Estoque insuficiente: só há ${limiteDisponivel} ${combustivelSelecionado.unidade} de ${combustivelSelecionado.nome}.`,
                );
                return;
              }
              const formData = new FormData(e.currentTarget);
              startTransition(async () => {
                await action(formData);
                setOpen(false);
                resetar();
              });
            }}
            className="flex flex-col gap-4"
          >
            {etapaFixa && <input type="hidden" name="etapa" value={etapaFixa} />}
            {abastecimento && <input type="hidden" name="id" value={abastecimento.id} />}

            {equipamentoFixo ? (
              <>
                <input type="hidden" name="equipamento_id" value={equipamentoFixo.id} />
                <p className="text-sm text-muted-foreground">
                  Equipamento: <span className="font-medium text-foreground">{equipamentoFixo.nome}</span>
                </p>
              </>
            ) : (
              <FieldGroup label="Equipamento" htmlFor="equipamento-abastecimento">
                <Select
                  id="equipamento-abastecimento"
                  name="equipamento_id"
                  required
                  value={equipamentoId}
                  onChange={(e) => setEquipamentoId(e.target.value)}
                >
                  <option value="" disabled>
                    Selecione o equipamento
                  </option>
                  {equipamentos?.map((eq) => (
                    <option key={eq.id} value={eq.id}>
                      {eq.nome}
                    </option>
                  ))}
                </Select>
              </FieldGroup>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FieldGroup label="Combustível" htmlFor="insumo-abastecimento">
                <Select
                  id="insumo-abastecimento"
                  name="insumo_id"
                  required
                  value={insumoId}
                  onChange={(e) => atualizarInsumo(e.target.value)}
                >
                  {combustiveis.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome} ({c.estoqueAtual} {c.unidade} em estoque)
                    </option>
                  ))}
                </Select>
              </FieldGroup>
              <FieldGroup label="Data" htmlFor="data-abastecimento">
                <Input
                  id="data-abastecimento"
                  name="data"
                  type="date"
                  required
                  defaultValue={abastecimento?.data ?? new Date().toISOString().slice(0, 10)}
                />
              </FieldGroup>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FieldGroup label={`Litros (${combustivelSelecionado?.unidade ?? "l"})`} htmlFor="litros-abastecimento">
                <Input
                  id="litros-abastecimento"
                  name="litros"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={litros || ""}
                  onChange={(e) => atualizarLitros(Number(e.target.value) || 0)}
                  className={
                    estoqueInsuficiente
                      ? "border-danger text-danger focus:border-danger focus:ring-danger/20"
                      : ""
                  }
                />
                {estoqueInsuficiente && combustivelSelecionado && (
                  <p className="mt-1 text-xs text-danger">
                    Só há {limiteDisponivel} {combustivelSelecionado.unidade} em estoque.
                  </p>
                )}
              </FieldGroup>
              <FieldGroup label="Custo total (R$)" htmlFor="custo-abastecimento">
                <Input
                  id="custo-abastecimento"
                  name="custo_total"
                  type="number"
                  step="0.01"
                  min="0"
                  value={custoTotal || ""}
                  onChange={(e) => {
                    setCustoManual(true);
                    setCustoTotal(Number(e.target.value) || 0);
                  }}
                />
              </FieldGroup>
            </div>

            {safraFixa && <input type="hidden" name="safra_id" value={safraFixa.id} />}

            <div className={safraFixa ? "" : "grid grid-cols-1 gap-4 sm:grid-cols-2"}>
              <FieldGroup label="Horímetro / hodômetro atual (opcional)" htmlFor="horimetro-abastecimento">
                <Input
                  id="horimetro-abastecimento"
                  name="horimetro"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="0,0"
                  defaultValue={abastecimento?.horimetro ?? ""}
                />
                {equipamentoSelecionado?.horimetroAtual != null && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Anterior: {equipamentoSelecionado.horimetroAtual}
                  </p>
                )}
              </FieldGroup>

              {!safraFixa && (
                <FieldGroup label="Safra (opcional)" htmlFor="safra-abastecimento">
                  <Select id="safra-abastecimento" name="safra_id" defaultValue={abastecimento?.safraId ?? ""}>
                    <option value="">Nenhuma</option>
                    {safras?.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nome}
                      </option>
                    ))}
                  </Select>
                </FieldGroup>
              )}
            </div>

            {erro && <p className="text-sm text-danger">{erro}</p>}

            <Button type="submit" disabled={pending || estoqueInsuficiente} className="mt-1">
              {pending ? "Salvando..." : editando ? "Salvar alterações" : "Registrar abastecimento"}
            </Button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
