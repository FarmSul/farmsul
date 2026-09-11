"use client";

import { Trash2 } from "lucide-react";
import { FormModal } from "@/components/ui/form-modal";
import { Badge } from "@/components/ui/badge";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { InsumoFormFields } from "./insumo-form-fields";

const CATEGORIA_LABELS: Record<string, string> = {
  semente: "Semente",
  fertilizante: "Fertilizante",
  defensivo: "Defensivo",
  corretivo: "Corretivo",
  combustivel: "Combustível",
  outro: "Outro",
};

export function InsumoRow({
  id,
  nome,
  categoria,
  unidade,
  estoqueAtual,
  custoMedio,
  tamanhoEmbalagem,
  atualizarAction,
  excluirAction,
}: {
  id: string;
  nome: string;
  categoria: string;
  unidade: string;
  estoqueAtual: number;
  custoMedio: number | null;
  tamanhoEmbalagem: number | null;
  atualizarAction: (formData: FormData) => void;
  excluirAction: (formData: FormData) => void;
}) {
  return (
    <FormModal
      title="Editar insumo"
      action={atualizarAction}
      submitLabel="Salvar alterações"
      maxWidth="max-w-xl"
      trigger={
        <tr className="cursor-pointer border-b border-border last:border-0 hover:bg-surface-hover">
          <td className="px-6 py-3.5 font-medium text-foreground">{nome}</td>
          <td className="px-6 py-3.5">
            <Badge tone="primary">{CATEGORIA_LABELS[categoria] ?? categoria}</Badge>
          </td>
          <td className="px-6 py-3.5 text-muted-foreground">
            {estoqueAtual} {unidade}
            {tamanhoEmbalagem ? (
              <span className="text-xs">
                {" "}
                · {(estoqueAtual / tamanhoEmbalagem).toFixed(1)} emb. de {tamanhoEmbalagem} {unidade}
              </span>
            ) : null}
          </td>
          <td className="px-6 py-3.5 text-muted-foreground">{custoMedio ? `R$ ${custoMedio}` : "—"}</td>
          <td className="px-6 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
            <form action={excluirAction}>
              <input type="hidden" name="id" value={id} />
              <ConfirmButton
                confirmText={`Excluir o insumo "${nome}"?`}
                title="Excluir"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-danger-soft hover:text-danger"
              >
                <Trash2 className="h-4 w-4" />
              </ConfirmButton>
            </form>
          </td>
        </tr>
      }
    >
      <input type="hidden" name="id" value={id} />
      <InsumoFormFields
        idPrefix={`edit-insumo-${id}-`}
        defaultNome={nome}
        defaultCategoria={categoria}
        defaultUnidade={unidade}
        defaultEstoqueAtual={estoqueAtual}
        defaultCustoMedio={custoMedio ?? ""}
        defaultTamanhoEmbalagem={tamanhoEmbalagem ?? ""}
      />
    </FormModal>
  );
}
