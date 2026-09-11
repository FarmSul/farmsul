"use client";

import { useState, useTransition, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { FieldGroup, Input, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

export type InsumoEstoque = {
  id: string;
  nome: string;
  unidade: string;
  custoMedio: number | null;
  estoqueAtual: number;
  tamanhoEmbalagem?: number | null;
  categoria?: string;
};

function formatBRL(valor: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);
}

export function NovaEntradaModal({
  trigger,
  insumos,
  action,
}: {
  trigger: ReactNode;
  insumos: InsumoEstoque[];
  action: (formData: FormData) => void;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [insumoId, setInsumoId] = useState(insumos[0]?.id ?? "");
  const [quantidade, setQuantidade] = useState(0);
  const [qtdEmbalagens, setQtdEmbalagens] = useState(0);
  const [custoTotal, setCustoTotal] = useState(0);

  const insumo = insumos.find((i) => i.id === insumoId);
  const tamanhoEmbalagem = insumo?.tamanhoEmbalagem ?? null;
  const precoUnitario = quantidade > 0 && custoTotal > 0 ? custoTotal / quantidade : null;
  const custoMedioAtual = insumo?.custoMedio ?? 0;
  const estoqueAtual = insumo?.estoqueAtual ?? 0;
  const novoCustoMedio =
    precoUnitario != null && estoqueAtual + quantidade > 0
      ? (estoqueAtual * custoMedioAtual + quantidade * precoUnitario) / (estoqueAtual + quantidade)
      : custoMedioAtual;

  function resetar() {
    setInsumoId(insumos[0]?.id ?? "");
    setQuantidade(0);
    setQtdEmbalagens(0);
    setCustoTotal(0);
  }

  function alterarQtdEmbalagens(valor: number) {
    setQtdEmbalagens(valor);
    if (tamanhoEmbalagem) {
      setQuantidade(Math.round(valor * tamanhoEmbalagem * 100) / 100);
    }
  }

  if (!insumos.length) return null;

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
            <Dialog.Title className="text-lg font-semibold text-foreground">Nova entrada (compra)</Dialog.Title>
            <Dialog.Close className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-surface-hover hover:text-foreground">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              startTransition(async () => {
                await action(formData);
                setOpen(false);
                resetar();
              });
            }}
            className="flex flex-col gap-4"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FieldGroup label="Insumo" htmlFor="insumo-entrada">
                <Select id="insumo-entrada" name="insumo_id" required value={insumoId} onChange={(e) => setInsumoId(e.target.value)}>
                  {insumos.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.nome} ({i.estoqueAtual} {i.unidade} em estoque)
                    </option>
                  ))}
                </Select>
              </FieldGroup>
              <FieldGroup label="Data" htmlFor="data-entrada">
                <Input id="data-entrada" name="data" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} />
              </FieldGroup>
            </div>

            {tamanhoEmbalagem ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FieldGroup
                  label={`Embalagens (de ${tamanhoEmbalagem} ${insumo?.unidade})`}
                  htmlFor="qtd-embalagens-entrada"
                >
                  <Input
                    id="qtd-embalagens-entrada"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={qtdEmbalagens || ""}
                    onChange={(e) => alterarQtdEmbalagens(Number(e.target.value) || 0)}
                  />
                </FieldGroup>
                <FieldGroup label={`Total (${insumo?.unidade ?? ""})`} htmlFor="quantidade-entrada">
                  <Input
                    id="quantidade-entrada"
                    name="quantidade"
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={quantidade || ""}
                    onChange={(e) => setQuantidade(Number(e.target.value) || 0)}
                  />
                </FieldGroup>
              </div>
            ) : (
              <FieldGroup label={`Quantidade (${insumo?.unidade ?? ""})`} htmlFor="quantidade-entrada">
                <Input
                  id="quantidade-entrada"
                  name="quantidade"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={quantidade || ""}
                  onChange={(e) => setQuantidade(Number(e.target.value) || 0)}
                />
              </FieldGroup>
            )}

            <FieldGroup label="Custo total (R$, opcional)" htmlFor="custo-entrada">
              <Input
                id="custo-entrada"
                name="custo_total"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={custoTotal || ""}
                onChange={(e) => setCustoTotal(Number(e.target.value) || 0)}
              />
            </FieldGroup>

            {precoUnitario != null && (
              <div className="rounded-lg bg-surface-hover px-3 py-2.5 text-xs text-muted-foreground">
                Custo médio de <span className="font-medium text-foreground">{insumo?.nome}</span> passa de{" "}
                {formatBRL(custoMedioAtual)} para <span className="font-medium text-foreground">{formatBRL(novoCustoMedio)}</span>{" "}
                por {insumo?.unidade} (média ponderada pelo estoque).
              </div>
            )}

            <Button type="submit" disabled={pending} className="mt-1">
              {pending ? "Salvando..." : "Registrar entrada"}
            </Button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
