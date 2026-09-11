"use client";

import { Trash2 } from "lucide-react";
import { FormModal } from "@/components/ui/form-modal";
import { Badge } from "@/components/ui/badge";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { SafraFormFields, type Talhao } from "./safra-form-fields";

export function SafraRow({
  id,
  nome,
  cultura,
  dataInicio,
  dataFim,
  tipoCusto,
  numeroAreas,
  areaTotal,
  talhoes,
  defaultSelecionados,
  atualizarAction,
  excluirAction,
}: {
  id: string;
  nome: string;
  cultura: string;
  dataInicio: string;
  dataFim: string | null;
  tipoCusto: string;
  numeroAreas: number;
  areaTotal: number;
  talhoes: Talhao[];
  defaultSelecionados: Record<string, number>;
  atualizarAction: (formData: FormData) => void;
  excluirAction: (formData: FormData) => void;
}) {
  return (
    <FormModal
      title="Editar safra"
      action={atualizarAction}
      submitLabel="Salvar alterações"
      maxWidth="max-w-2xl"
      trigger={
        <tr className="cursor-pointer border-b border-border last:border-0 hover:bg-surface-hover">
          <td className="px-6 py-3.5 font-medium text-foreground">{nome}</td>
          <td className="px-6 py-3.5">
            <Badge tone="primary">{cultura}</Badge>
          </td>
          <td className="px-6 py-3.5 text-muted-foreground">
            {dataInicio} {dataFim ? `— ${dataFim}` : ""}
          </td>
          <td className="px-6 py-3.5 text-muted-foreground">
            {numeroAreas
              ? `${numeroAreas} área${numeroAreas > 1 ? "s" : ""} · ${areaTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ha`
              : "—"}
          </td>
          <td className="px-6 py-3.5">
            <Badge tone={tipoCusto === "manual" ? "amber" : "neutral"}>{tipoCusto}</Badge>
          </td>
          <td className="px-6 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
            <form action={excluirAction}>
              <input type="hidden" name="id" value={id} />
              <ConfirmButton
                confirmText={`Excluir a safra "${nome}"?`}
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
      <SafraFormFields
        idPrefix={`edit-safra-${id}-`}
        talhoes={talhoes}
        defaultCultura={cultura}
        defaultDataInicio={dataInicio}
        defaultDataFim={dataFim ?? ""}
        defaultNome={nome}
        defaultTipoCusto={tipoCusto}
        defaultSelecionados={defaultSelecionados}
      />
    </FormModal>
  );
}
