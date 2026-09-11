"use client";

import { useState, useTransition, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Plus, Trash2, Paperclip, FileText } from "lucide-react";
import { FieldGroup, Input, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

type Peca = { nome: string; quantidade: number; valorUnitario: number };

export type ManutencaoExistente = {
  id: string;
  equipamentoId: string;
  data: string;
  descricao: string;
  maoDeObra: number;
  pecas: { nome: string; quantidade: number; valor_unitario: number }[];
  responsavelId: string | null;
  notaFiscalUrl: string | null;
};

function formatBRL(valor: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);
}

export function AbrirManutencaoModal({
  trigger,
  equipamentos,
  equipamentoFixo,
  colaboradores,
  action,
  manutencao,
}: {
  trigger: ReactNode;
  equipamentos?: { id: string; nome: string }[];
  equipamentoFixo?: { id: string; nome: string };
  colaboradores: { id: string; nome: string }[];
  action: (formData: FormData) => void;
  manutencao?: ManutencaoExistente;
}) {
  const pecasIniciais = (manutencao?.pecas ?? []).map((p) => ({
    nome: p.nome,
    quantidade: p.quantidade,
    valorUnitario: p.valor_unitario,
  }));

  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [pecas, setPecas] = useState<Peca[]>(pecasIniciais);
  const [maoDeObra, setMaoDeObra] = useState(manutencao?.maoDeObra ?? 0);
  const [erro, setErro] = useState<string | null>(null);
  const [notaFiscalNome, setNotaFiscalNome] = useState<string | null>(null);

  const editando = !!manutencao;
  const totalPecas = pecas.reduce((soma, p) => soma + p.quantidade * p.valorUnitario, 0);
  const total = maoDeObra + totalPecas;

  function adicionarPeca() {
    setPecas((atual) => [...atual, { nome: "", quantidade: 1, valorUnitario: 0 }]);
  }

  function atualizarPeca(index: number, campo: keyof Peca, valor: string | number) {
    setPecas((atual) => atual.map((p, i) => (i === index ? { ...p, [campo]: valor } : p)));
  }

  function removerPeca(index: number) {
    setPecas((atual) => atual.filter((_, i) => i !== index));
  }

  function resetar() {
    setPecas(pecasIniciais);
    setMaoDeObra(manutencao?.maoDeObra ?? 0);
    setNotaFiscalNome(null);
    setErro(null);
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
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-border bg-surface p-6 shadow-[var(--shadow-4)] focus:outline-none data-[state=open]:[animation:modal-in_200ms_var(--ease-out-4)]">
          <div className="mb-5 flex items-start justify-between gap-4">
            <Dialog.Title className="text-lg font-semibold text-foreground">
              {editando ? "Editar manutenção" : "Abrir manutenção"}
            </Dialog.Title>
            <Dialog.Close className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-surface-hover hover:text-foreground">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setErro(null);
              if (pecas.some((p) => !p.nome.trim())) {
                setErro("Preencha o nome de todas as peças, ou remova as linhas vazias.");
                return;
              }
              const formData = new FormData(e.currentTarget);
              formData.set(
                "pecas",
                JSON.stringify(
                  pecas.map((p) => ({ nome: p.nome, quantidade: p.quantidade, valor_unitario: p.valorUnitario })),
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
            {manutencao && <input type="hidden" name="id" value={manutencao.id} />}

            {equipamentoFixo ? (
              <>
                <input type="hidden" name="equipamento_id" value={equipamentoFixo.id} />
                <p className="text-sm text-muted-foreground">
                  Equipamento: <span className="font-medium text-foreground">{equipamentoFixo.nome}</span>
                </p>
              </>
            ) : (
              <FieldGroup label="Equipamento" htmlFor="equipamento-manutencao">
                <Select
                  id="equipamento-manutencao"
                  name="equipamento_id"
                  required
                  defaultValue={manutencao?.equipamentoId ?? ""}
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

            <div className="grid grid-cols-2 gap-4">
              <FieldGroup label="Data" htmlFor="data-manutencao">
                <Input
                  id="data-manutencao"
                  name="data"
                  type="date"
                  required
                  defaultValue={manutencao?.data ?? new Date().toISOString().slice(0, 10)}
                />
              </FieldGroup>
              <FieldGroup label="Mão de obra (opcional)" htmlFor="mao-de-obra-manutencao">
                <Input
                  id="mao-de-obra-manutencao"
                  name="mao_de_obra"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={maoDeObra || ""}
                  onChange={(e) => setMaoDeObra(Number(e.target.value) || 0)}
                />
              </FieldGroup>
            </div>

            <FieldGroup label="Descrição do serviço" htmlFor="descricao-manutencao">
              <Input
                id="descricao-manutencao"
                name="descricao"
                placeholder="Troca de óleo e filtros"
                required
                defaultValue={manutencao?.descricao ?? ""}
              />
            </FieldGroup>

            <FieldGroup label="Colaborador responsável (opcional)" htmlFor="responsavel-manutencao">
              <Select
                id="responsavel-manutencao"
                name="responsavel_id"
                defaultValue={manutencao?.responsavelId ?? ""}
              >
                <option value="">Nenhum</option>
                {colaboradores.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </Select>
            </FieldGroup>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Peças / materiais (opcional)</span>
                <button
                  type="button"
                  onClick={adicionarPeca}
                  className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Adicionar peça
                </button>
              </div>

              {pecas.length > 0 && (
                <div className="flex flex-col gap-2 rounded-lg border border-border p-3">
                  {pecas.map((peca, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Input
                        placeholder="Nome da peça"
                        value={peca.nome}
                        onChange={(e) => atualizarPeca(i, "nome", e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        min="1"
                        step="1"
                        value={peca.quantidade}
                        onChange={(e) => atualizarPeca(i, "quantidade", Number(e.target.value) || 1)}
                        className="w-16 text-right"
                        title="Quantidade"
                      />
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0,00"
                        value={peca.valorUnitario || ""}
                        onChange={(e) => atualizarPeca(i, "valorUnitario", Number(e.target.value) || 0)}
                        className="w-28 text-right"
                        title="Valor unitário"
                      />
                      <button
                        type="button"
                        onClick={() => removerPeca(i)}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-danger-soft hover:text-danger"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col">
              <span className="mb-1.5 block text-sm font-medium text-foreground">Nota fiscal (opcional)</span>
              <div className="flex items-center gap-2">
                <label
                  htmlFor="nota-fiscal-abrir-manutencao"
                  className="flex h-[38px] w-fit cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-surface px-3 text-sm text-muted-foreground hover:bg-surface-hover"
                >
                  <Paperclip className="h-4 w-4" />
                  <span className="max-w-[200px] truncate">
                    {notaFiscalNome ?? (manutencao?.notaFiscalUrl ? "Trocar arquivo" : "Anexar arquivo")}
                  </span>
                </label>
                {manutencao?.notaFiscalUrl && !notaFiscalNome && (
                  <a
                    href={manutencao.notaFiscalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Ver nota fiscal atual"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-surface-hover hover:text-primary"
                  >
                    <FileText className="h-4 w-4" />
                  </a>
                )}
              </div>
              <input
                id="nota-fiscal-abrir-manutencao"
                name="nota_fiscal"
                type="file"
                accept="image/png,image/jpeg,image/webp,application/pdf"
                className="hidden"
                onChange={(e) => setNotaFiscalNome(e.target.files?.[0]?.name ?? null)}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg bg-surface-hover px-3 py-2.5 text-sm">
              <span className="text-muted-foreground">Custo total estimado</span>
              <span className="font-semibold text-foreground">{formatBRL(total)}</span>
            </div>

            {erro && <p className="text-sm text-danger">{erro}</p>}

            <Button type="submit" disabled={pending} className="mt-1">
              {pending ? "Salvando..." : editando ? "Salvar alterações" : "Abrir manutenção"}
            </Button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
