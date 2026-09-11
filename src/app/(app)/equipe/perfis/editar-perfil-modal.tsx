"use client";

import { Trash2 } from "lucide-react";
import { FormModal } from "@/components/ui/form-modal";
import { FieldGroup, Input } from "@/components/ui/field";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { PermissoesFields } from "./permissoes-fields";
import type { PermissoesPerfil } from "./permissoes";

type Perfil = { id: string; nome: string; descricao: string | null; permissoes: PermissoesPerfil | null };

export function EditarPerfilModal({
  perfil,
  action,
  deleteAction,
}: {
  perfil: Perfil;
  action: (formData: FormData) => void;
  deleteAction: (formData: FormData) => void;
}) {
  return (
    <FormModal
      title="Editar perfil"
      action={action}
      submitLabel="Salvar"
      trigger={
        <tr className="cursor-pointer border-b border-border last:border-0 hover:bg-surface-hover">
          <td className="px-6 py-3.5 font-medium text-foreground">{perfil.nome}</td>
          <td className="px-6 py-3.5 text-muted-foreground">{perfil.descricao ?? "—"}</td>
          <td className="px-6 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
            <form action={deleteAction}>
              <input type="hidden" name="id" value={perfil.id} />
              <ConfirmButton
                confirmText={`Remover o perfil "${perfil.nome}"?`}
                title="Remover"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-danger-soft hover:text-danger"
              >
                <Trash2 className="h-4 w-4" />
              </ConfirmButton>
            </form>
          </td>
        </tr>
      }
    >
      <input type="hidden" name="id" value={perfil.id} />
      <FieldGroup label="Nome" htmlFor={`nome-editar-perfil-${perfil.id}`}>
        <Input id={`nome-editar-perfil-${perfil.id}`} name="nome" defaultValue={perfil.nome} required />
      </FieldGroup>
      <FieldGroup label="Descrição" htmlFor={`descricao-editar-perfil-${perfil.id}`}>
        <Input
          id={`descricao-editar-perfil-${perfil.id}`}
          name="descricao"
          defaultValue={perfil.descricao ?? ""}
        />
      </FieldGroup>
      <PermissoesFields defaultPermissoes={perfil.permissoes ?? undefined} />
    </FormModal>
  );
}
