"use client";

import { useState, useTransition, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Plus, Trash2 } from "lucide-react";
import { FieldGroup, Input, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import type { InsumoEstoque } from "./nova-entrada-modal";
import type { TalhaoComArea } from "./nova-aplicacao-modal";

type ItemReceita = {
  key: string;
  insumoId: string;
  doseHa: number;
  quantidade: number;
  custoTotal: number;
  custoManual: boolean;
};

function gerarChave() {
  return typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

function criarItemVazio(insumos: InsumoEstoque[]): ItemReceita {
  return {
    key: gerarChave(),
    insumoId: insumos[0]?.id ?? "",
    doseHa: 0,
    quantidade: 0,
    custoTotal: 0,
    custoManual: false,
  };
}

export type AplicacaoExistente = {
  id: string;
  talhaoId: string;
  numero: number;
  data: string;
  itens: { insumoId: string; quantidade: number; doseHa: number | null; custoTotal: number | null }[];
};

function itensIniciais(insumos: InsumoEstoque[], aplicacao?: AplicacaoExistente): ItemReceita[] {
  if (!aplicacao || !aplicacao.itens.length) return [criarItemVazio(insumos)];
  return aplicacao.itens.map((it) => ({
    key: gerarChave(),
    insumoId: it.insumoId,
    doseHa: it.doseHa ?? 0,
    quantidade: it.quantidade,
    custoTotal: it.custoTotal ?? 0,
    custoManual: true,
  }));
}

export function NovaAplicacaoMultiModal({
  trigger,
  insumos,
  talhoes,
  safras,
  safraFixa,
  etapaFixa,
  proximoNumero = 1,
  action,
  aplicacao,
}: {
  trigger: ReactNode;
  insumos: InsumoEstoque[];
  talhoes: TalhaoComArea[];
  safras?: { id: string; nome: string }[];
  safraFixa?: { id: string; nome: string };
  etapaFixa?: string;
  proximoNumero?: number;
  action: (formData: FormData) => void;
  aplicacao?: AplicacaoExistente;
}) {
  const editando = !!aplicacao;
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [talhaoId, setTalhaoId] = useState(aplicacao?.talhaoId ?? "");
  const [numero, setNumero] = useState(aplicacao?.numero ?? proximoNumero);
  const [itens, setItens] = useState<ItemReceita[]>(() => itensIniciais(insumos, aplicacao));
  const [erro, setErro] = useState<string | null>(null);

  const talhao = talhoes.find((t) => t.id === talhaoId);

  // Ao editar, a quantidade original de cada insumo já foi debitada do
  // estoque exibido — soma de volta pra validar contra o que realmente
  // vai sobrar (assume no máx. um item por insumo na receita).
  const creditoOriginalPorInsumo = new Map((aplicacao?.itens ?? []).map((it) => [it.insumoId, it.quantidade]));

  function insumoDoItem(item: ItemReceita) {
    return insumos.find((i) => i.id === item.insumoId);
  }

  function limiteDisponivel(item: ItemReceita) {
    const insumo = insumoDoItem(item);
    if (!insumo) return Infinity;
    return insumo.estoqueAtual + (creditoOriginalPorInsumo.get(item.insumoId) ?? 0);
  }

  function estoqueInsuficiente(item: ItemReceita) {
    return item.quantidade > limiteDisponivel(item);
  }

  function custoSugerido(item: ItemReceita, qtd: number) {
    if (item.custoManual) return item.custoTotal;
    const insumo = insumoDoItem(item);
    return insumo?.custoMedio ? Math.round(qtd * insumo.custoMedio * 100) / 100 : item.custoTotal;
  }

  function atualizarDose(key: string, valor: number) {
    setItens((atual) =>
      atual.map((it) => {
        if (it.key !== key) return it;
        if (talhao && talhao.area_ha > 0) {
          const total = Math.round(valor * talhao.area_ha * 100) / 100;
          return { ...it, doseHa: valor, quantidade: total, custoTotal: custoSugerido(it, total) };
        }
        return { ...it, doseHa: valor };
      }),
    );
  }

  function atualizarQuantidade(key: string, valor: number) {
    setItens((atual) =>
      atual.map((it) => {
        if (it.key !== key) return it;
        const doseHa = talhao && talhao.area_ha > 0 ? Math.round((valor / talhao.area_ha) * 100) / 100 : it.doseHa;
        return { ...it, quantidade: valor, doseHa, custoTotal: custoSugerido(it, valor) };
      }),
    );
  }

  function atualizarInsumoItem(key: string, insumoId: string) {
    setItens((atual) =>
      atual.map((it) => {
        if (it.key !== key) return it;
        const proximo = { ...it, insumoId };
        return { ...proximo, custoTotal: custoSugerido(proximo, proximo.quantidade) };
      }),
    );
  }

  function atualizarCustoItem(key: string, valor: number) {
    setItens((atual) => atual.map((it) => (it.key === key ? { ...it, custoTotal: valor, custoManual: true } : it)));
  }

  function atualizarTalhao(id: string) {
    setTalhaoId(id);
    const novoTalhao = talhoes.find((t) => t.id === id);
    if (!novoTalhao || novoTalhao.area_ha <= 0) return;
    setItens((atual) =>
      atual.map((it) => {
        if (it.doseHa > 0) {
          const total = Math.round(it.doseHa * novoTalhao.area_ha * 100) / 100;
          return { ...it, quantidade: total, custoTotal: custoSugerido(it, total) };
        }
        if (it.quantidade > 0) {
          return { ...it, doseHa: Math.round((it.quantidade / novoTalhao.area_ha) * 100) / 100 };
        }
        return it;
      }),
    );
  }

  function adicionarItem() {
    setItens((atual) => [...atual, criarItemVazio(insumos)]);
  }

  function removerItem(key: string) {
    setItens((atual) => (atual.length > 1 ? atual.filter((it) => it.key !== key) : atual));
  }

  function resetar() {
    setTalhaoId(aplicacao?.talhaoId ?? "");
    setNumero(aplicacao?.numero ?? proximoNumero);
    setItens(itensIniciais(insumos, aplicacao));
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
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-border bg-surface p-6 shadow-[var(--shadow-4)] focus:outline-none data-[state=open]:[animation:modal-in_200ms_var(--ease-out-4)]">
          <div className="mb-5 flex items-start justify-between gap-4">
            <Dialog.Title className="text-lg font-semibold text-foreground">
              {editando ? "Editar aplicação" : "Nova aplicação"}
            </Dialog.Title>
            <Dialog.Close className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-surface-hover hover:text-foreground">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setErro(null);
              if (!talhaoId) {
                setErro("Selecione o talhão.");
                return;
              }
              if (itens.some((it) => it.quantidade <= 0)) {
                setErro("Informe a quantidade (ou dose por hectare) de todos os insumos da receita.");
                return;
              }
              const itemInsuficiente = itens.find(estoqueInsuficiente);
              if (itemInsuficiente) {
                const insumo = insumoDoItem(itemInsuficiente);
                setErro(
                  `Estoque insuficiente de ${insumo?.nome}: só há ${limiteDisponivel(itemInsuficiente)} ${insumo?.unidade}.`,
                );
                return;
              }
              const formData = new FormData(e.currentTarget);
              formData.set(
                "itens",
                JSON.stringify(
                  itens.map((it) => ({
                    insumo_id: it.insumoId,
                    quantidade: it.quantidade,
                    quantidade_ha: it.doseHa || null,
                    custo_total: it.custoTotal || null,
                  })),
                ),
              );
              startTransition(async () => {
                await action(formData);
                setOpen(false);
                resetar();
              });
            }}
            className="flex flex-col gap-4"
          >
            {aplicacao && <input type="hidden" name="id" value={aplicacao.id} />}
            {etapaFixa && <input type="hidden" name="etapa" value={etapaFixa} />}
            <input type="hidden" name="numero" value={numero} />

            <div className="grid grid-cols-3 gap-4">
              <FieldGroup label="Talhão" htmlFor="talhao-aplicacao-multi">
                <Select
                  id="talhao-aplicacao-multi"
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

              <FieldGroup label="Nº da aplicação" htmlFor="numero-aplicacao-multi">
                <Input
                  id="numero-aplicacao-multi"
                  type="number"
                  min="1"
                  step="1"
                  value={numero}
                  onChange={(e) => setNumero(Number(e.target.value) || 1)}
                />
              </FieldGroup>

              <FieldGroup label="Data" htmlFor="data-aplicacao-multi">
                <Input
                  id="data-aplicacao-multi"
                  name="data"
                  type="date"
                  required
                  defaultValue={aplicacao?.data ?? new Date().toISOString().slice(0, 10)}
                />
              </FieldGroup>
            </div>

            {safraFixa ? (
              <>
                <input type="hidden" name="safra_id" value={safraFixa.id} />
                <p className="text-sm text-muted-foreground">
                  Safra: <span className="font-medium text-foreground">{safraFixa.nome}</span>
                </p>
              </>
            ) : (
              <FieldGroup label="Safra (opcional)" htmlFor="safra-aplicacao-multi">
                <Select id="safra-aplicacao-multi" name="safra_id" defaultValue="">
                  <option value="">Nenhuma</option>
                  {safras?.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nome}
                    </option>
                  ))}
                </Select>
              </FieldGroup>
            )}

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Receita (insumos aplicados juntos)</span>
                <button
                  type="button"
                  onClick={adicionarItem}
                  className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Adicionar insumo
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {itens.map((item) => {
                  const insumo = insumoDoItem(item);
                  const insuficiente = estoqueInsuficiente(item);
                  return (
                    <div key={item.key} className="flex flex-col gap-2 rounded-lg border border-border p-3">
                      <div className="flex items-center gap-2">
                        <Select
                          value={item.insumoId}
                          onChange={(e) => atualizarInsumoItem(item.key, e.target.value)}
                          className="flex-1"
                        >
                          {insumos.map((i) => (
                            <option key={i.id} value={i.id}>
                              {i.nome} ({i.estoqueAtual} {i.unidade} em estoque)
                            </option>
                          ))}
                        </Select>
                        <button
                          type="button"
                          onClick={() => removerItem(item.key)}
                          disabled={itens.length === 1}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-danger-soft hover:text-danger disabled:opacity-30"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <span className="mb-1 block text-xs text-muted-foreground">Dose ({insumo?.unidade ?? ""}/ha)</span>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0,00"
                            value={item.doseHa || ""}
                            onChange={(e) => atualizarDose(item.key, Number(e.target.value) || 0)}
                            disabled={!talhao}
                            title={!talhao ? "Selecione o talhão primeiro" : undefined}
                          />
                        </div>
                        <div>
                          <span className="mb-1 block text-xs text-muted-foreground">Total ({insumo?.unidade ?? ""})</span>
                          <Input
                            type="number"
                            step="0.01"
                            min="0.01"
                            placeholder="0,00"
                            value={item.quantidade || ""}
                            onChange={(e) => atualizarQuantidade(item.key, Number(e.target.value) || 0)}
                            className={insuficiente ? "border-danger text-danger focus:border-danger focus:ring-danger/20" : ""}
                          />
                        </div>
                        <div>
                          <span className="mb-1 block text-xs text-muted-foreground">Custo (R$)</span>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0,00"
                            value={item.custoTotal || ""}
                            onChange={(e) => atualizarCustoItem(item.key, Number(e.target.value) || 0)}
                          />
                        </div>
                      </div>
                      {insuficiente && insumo && (
                        <p className="text-xs text-danger">
                          Só há {limiteDisponivel(item)} {insumo.unidade} de {insumo.nome} em estoque.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {erro && <p className="text-sm text-danger">{erro}</p>}

            <Button type="submit" disabled={pending} className="mt-1">
              {pending ? "Salvando..." : editando ? "Salvar alterações" : "Registrar aplicação"}
            </Button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
