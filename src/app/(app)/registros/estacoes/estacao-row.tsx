"use client";

import { Trash2 } from "lucide-react";
import { FormModal } from "@/components/ui/form-modal";
import { FieldGroup, Input, Select } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { TIPO_ESTACAO_LABELS } from "../labels";

export function EstacaoRow({
  id,
  nome,
  tipo,
  propriedadeId,
  propriedadeNome,
  propriedades,
  atualizarAction,
  excluirAction,
}: {
  id: string;
  nome: string;
  tipo: string;
  propriedadeId: string;
  propriedadeNome: string | undefined;
  propriedades: { id: string; nome: string }[];
  atualizarAction: (formData: FormData) => void;
  excluirAction: (formData: FormData) => void;
}) {
  return (
    <FormModal
      title="Editar estação"
      action={atualizarAction}
      submitLabel="Salvar alterações"
      trigger={
        <tr className="cursor-pointer border-b border-border last:border-0 hover:bg-surface-hover">
          <td className="px-6 py-3.5 font-medium text-foreground">{nome}</td>
          <td className="px-6 py-3.5">
            <Badge tone="primary">{TIPO_ESTACAO_LABELS[tipo] ?? tipo}</Badge>
          </td>
          <td className="px-6 py-3.5 text-muted-foreground">{propriedadeNome ?? "—"}</td>
          <td className="px-6 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
            <form action={excluirAction}>
              <input type="hidden" name="id" value={id} />
              <ConfirmButton
                confirmText={`Excluir a estação "${nome}"? Isso também apaga as leituras registradas nela.`}
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
      <FieldGroup label="Nome" htmlFor={`nome-estacao-${id}`}>
        <Input id={`nome-estacao-${id}`} name="nome" defaultValue={nome} required />
      </FieldGroup>
      <FieldGroup label="Tipo" htmlFor={`tipo-estacao-${id}`}>
        <Select id={`tipo-estacao-${id}`} name="tipo" required defaultValue={tipo}>
          <option value="pluviometro">Pluviômetro</option>
          <option value="estacao_meteorologica">Estação meteorológica</option>
        </Select>
      </FieldGroup>
      <FieldGroup label="Propriedade" htmlFor={`propriedade-estacao-${id}`}>
        <Select id={`propriedade-estacao-${id}`} name="propriedade_id" required defaultValue={propriedadeId}>
          {propriedades.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </Select>
      </FieldGroup>
    </FormModal>
  );
}
