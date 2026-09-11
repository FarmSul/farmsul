"use client";

import { Trash2 } from "lucide-react";
import { FormModal } from "@/components/ui/form-modal";
import { FieldGroup, Input } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { EnderecoFields } from "@/components/endereco-fields";
import { ConfirmButton } from "@/components/ui/confirm-button";

export function PropriedadeRow({
  id,
  nome,
  areaHa,
  municipio,
  estado,
  atualizarAction,
  excluirAction,
}: {
  id: string;
  nome: string;
  areaHa: number | null;
  municipio: string | null;
  estado: string | null;
  atualizarAction: (formData: FormData) => void;
  excluirAction: (formData: FormData) => void;
}) {
  return (
    <FormModal
      title="Editar propriedade"
      action={atualizarAction}
      submitLabel="Salvar alterações"
      trigger={
        <tr className="cursor-pointer border-b border-border last:border-0 hover:bg-surface-hover">
          <td className="px-6 py-3.5 font-medium text-foreground">{nome}</td>
          <td className="px-6 py-3.5 text-muted-foreground">{areaHa ? `${areaHa} ha` : "—"}</td>
          <td className="px-6 py-3.5 text-muted-foreground">
            {municipio ? `${municipio} / ` : ""}
            {estado && <Badge>{estado}</Badge>}
          </td>
          <td className="px-6 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
            <form action={excluirAction}>
              <input type="hidden" name="id" value={id} />
              <ConfirmButton
                confirmText={`Excluir a propriedade "${nome}"? Isso também apaga os talhões vinculados a ela.`}
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
      <FieldGroup label="Nome" htmlFor={`nome-${id}`}>
        <Input id={`nome-${id}`} name="nome" defaultValue={nome} required />
      </FieldGroup>
      <FieldGroup label="Área (ha) — opcional" htmlFor={`area-${id}`}>
        <Input
          id={`area-${id}`}
          name="area_ha"
          type="number"
          step="0.01"
          min="0.01"
          defaultValue={areaHa ?? ""}
        />
      </FieldGroup>
      <EnderecoFields idPrefix={`edit-prop-${id}`} defaultUf={estado ?? "MS"} defaultMunicipio={municipio ?? ""} />
    </FormModal>
  );
}
