"use client";

import { useState, useTransition, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { FieldGroup, Input, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import type { InsumoEstoque } from "./nova-entrada-modal";

export type TalhaoComArea = { id: string; nome: string; area_ha: number };

export function NovaAplicacaoModal({
  trigger,
  insumos,
  talhoes,
  safras,
  safraFixa,
  etapaFixa,
  action,
}: {
  trigger: ReactNode;
  insumos: InsumoEstoque[];
  talhoes: TalhaoComArea[];
  safras?: { id: string; nome: string }[];
  safraFixa?: { id: string; nome: string };
  etapaFixa?: string;
  action: (formData: FormData) => void;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [insumoId, setInsumoId] = useState(insumos[0]?.id ?? "");
  const [talhaoId, setTalhaoId] = useState("");
  const [dosePorHa, setDosePorHa] = useState(0);
  const [quantidade, setQuantidade] = useState(0);
  const [custoTotal, setCustoTotal] = useState(0);
  const [custoManual, setCustoManual] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const insumo = insumos.find((i) => i.id === insumoId);
  const talhao = talhoes.find((t) => t.id === talhaoId);
  const estoqueInsuficiente = !!insumo && quantidade > insumo.estoqueAtual;

  function recomputarCusto(qtd: number, custoMedio: number | null | undefined) {
    if (!custoManual && custoMedio) {
      setCustoTotal(Math.round(qtd * custoMedio * 100) / 100);
    }
  }

  function atualizarDose(valor: number) {
    setDosePorHa(valor);
    if (talhao && talhao.area_ha > 0) {
      const total = Math.round(valor * talhao.area_ha * 100) / 100;
      setQuantidade(total);
      recomputarCusto(total, insumo?.custoMedio);
    }
  }

  function atualizarTalhao(id: string) {
    setTalhaoId(id);
    const novoTalhao = talhoes.find((t) => t.id === id);
    if (novoTalhao && novoTalhao.area_ha > 0) {
      if (dosePorHa > 0) {
        const total = Math.round(dosePorHa * novoTalhao.area_ha * 100) / 100;
        setQuantidade(total);
        recomputarCusto(total, insumo?.custoMedio);
      } else if (quantidade > 0) {
        setDosePorHa(Math.round((quantidade / novoTalhao.area_ha) * 100) / 100);
      }
    }
  }

  function atualizarQuantidade(valor: number) {
    setQuantidade(valor);
    if (talhao && talhao.area_ha > 0) {
      setDosePorHa(Math.round((valor / talhao.area_ha) * 100) / 100);
    }
    recomputarCusto(valor, insumo?.custoMedio);
  }

  function atualizarInsumo(id: string) {
    setInsumoId(id);
    const novo = insumos.find((i) => i.id === id);
    recomputarCusto(quantidade, novo?.custoMedio);
  }

  function resetar() {
    setInsumoId(insumos[0]?.id ?? "");
    setTalhaoId("");
    setDosePorHa(0);
    setQuantidade(0);
    setCustoTotal(0);
    setCustoManual(false);
    setErro(null);
  }

  if (!insumos.length || !talhoes.length) return null;

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
            <Dialog.Title className="text-lg font-semibold text-foreground">Nova aplicação</Dialog.Title>
            <Dialog.Close className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-surface-hover hover:text-foreground">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setErro(null);
              if (quantidade <= 0) {
                setErro("Informe a quantidade aplicada (direto ou via dose por hectare).");
                return;
              }
              if (insumo && quantidade > insumo.estoqueAtual) {
                setErro(`Estoque insuficiente: só há ${insumo.estoqueAtual} ${insumo.unidade} de ${insumo.nome}.`);
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

            <FieldGroup label="Insumo" htmlFor="insumo-aplicacao">
              <Select
                id="insumo-aplicacao"
                name="insumo_id"
                required
                value={insumoId}
                onChange={(e) => atualizarInsumo(e.target.value)}
              >
                {insumos.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.nome} ({i.estoqueAtual} {i.unidade} em estoque)
                  </option>
                ))}
              </Select>
            </FieldGroup>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FieldGroup label="Talhão" htmlFor="talhao-aplicacao">
                <Select
                  id="talhao-aplicacao"
                  name="talhao_id"
                  required
                  value={talhaoId}
                  onChange={(e) => atualizarTalhao(e.target.value)}
                >
                  <option value="" disabled>
                    Selecione o talhão
                  </option>
                  {talhoes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nome} ({t.area_ha} ha)
                    </option>
                  ))}
                </Select>
              </FieldGroup>
              {safraFixa ? (
                <div>
                  <span className="mb-1.5 block text-sm font-medium text-foreground">Safra</span>
                  <input type="hidden" name="safra_id" value={safraFixa.id} />
                  <p className="flex h-[38px] items-center text-sm text-muted-foreground">{safraFixa.nome}</p>
                </div>
              ) : (
                <FieldGroup label="Safra (opcional)" htmlFor="safra-aplicacao">
                  <Select id="safra-aplicacao" name="safra_id" defaultValue="">
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

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FieldGroup label={`Dose por hectare (${insumo?.unidade ?? ""}/ha, opcional)`} htmlFor="dose-aplicacao">
                <Input
                  id="dose-aplicacao"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={dosePorHa || ""}
                  onChange={(e) => atualizarDose(Number(e.target.value) || 0)}
                  disabled={!talhao}
                  title={!talhao ? "Selecione o talhão primeiro" : undefined}
                />
              </FieldGroup>
              <FieldGroup label={`Quantidade total (${insumo?.unidade ?? ""})`} htmlFor="quantidade-aplicacao">
                <Input
                  id="quantidade-aplicacao"
                  name="quantidade"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={quantidade || ""}
                  onChange={(e) => atualizarQuantidade(Number(e.target.value) || 0)}
                  className={estoqueInsuficiente ? "border-danger text-danger focus:border-danger focus:ring-danger/20" : ""}
                />
              </FieldGroup>
            </div>
            {talhao && dosePorHa > 0 && (
              <p className="-mt-2 text-xs text-muted-foreground">
                {dosePorHa} {insumo?.unidade}/ha × {talhao.area_ha} ha = {quantidade} {insumo?.unidade}
              </p>
            )}
            {estoqueInsuficiente && insumo && (
              <p className="-mt-2 text-xs text-danger">
                Só há {insumo.estoqueAtual} {insumo.unidade} em estoque.
              </p>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FieldGroup label="Custo total (R$, opcional)" htmlFor="custo-aplicacao">
                <Input
                  id="custo-aplicacao"
                  name="custo_total"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={custoTotal || ""}
                  onChange={(e) => {
                    setCustoManual(true);
                    setCustoTotal(Number(e.target.value) || 0);
                  }}
                />
              </FieldGroup>
              <FieldGroup label="Data" htmlFor="data-aplicacao">
                <Input id="data-aplicacao" name="data" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} />
              </FieldGroup>
            </div>

            {erro && <p className="text-sm text-danger">{erro}</p>}

            <Button type="submit" disabled={pending || estoqueInsuficiente} className="mt-1">
              {pending ? "Salvando..." : "Registrar aplicação"}
            </Button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
