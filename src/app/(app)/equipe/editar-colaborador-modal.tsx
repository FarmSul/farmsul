"use client";

import { Trash2 } from "lucide-react";
import { FormModal } from "@/components/ui/form-modal";
import { FieldGroup, Input, Select } from "@/components/ui/field";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ConfirmButton } from "@/components/ui/confirm-button";

type Colaborador = {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  cpf: string | null;
  perfil_id: string | null;
  perfil_nome: string | null;
};

export function EditarColaboradorModal({
  colaborador,
  perfis,
  action,
  deleteAction,
}: {
  colaborador: Colaborador;
  perfis: { id: string; nome: string }[];
  action: (formData: FormData) => void;
  deleteAction: (formData: FormData) => void;
}) {
  return (
    <FormModal
      title="Editar colaborador"
      action={action}
      submitLabel="Salvar"
      trigger={
        <tr className="cursor-pointer border-b border-border last:border-0 hover:bg-surface-hover">
          <td className="px-6 py-3.5">
            <div className="flex items-center gap-3">
              <Avatar name={colaborador.nome} size="sm" />
              <span className="font-medium text-foreground">{colaborador.nome}</span>
            </div>
          </td>
          <td className="px-6 py-3.5 text-muted-foreground">{colaborador.email ?? "—"}</td>
          <td className="px-6 py-3.5 text-muted-foreground">{colaborador.telefone ?? "—"}</td>
          <td className="px-6 py-3.5 text-muted-foreground">{colaborador.cpf ?? "—"}</td>
          <td className="px-6 py-3.5">
            {colaborador.perfil_nome ? (
              <Badge tone="primary">{colaborador.perfil_nome}</Badge>
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </td>
          <td className="px-6 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
            <form action={deleteAction}>
              <input type="hidden" name="id" value={colaborador.id} />
              <ConfirmButton
                confirmText={`Remover o colaborador "${colaborador.nome}"?`}
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
      <input type="hidden" name="id" value={colaborador.id} />
      <FieldGroup label="Nome" htmlFor={`nome-editar-${colaborador.id}`}>
        <Input id={`nome-editar-${colaborador.id}`} name="nome" defaultValue={colaborador.nome} required />
      </FieldGroup>
      <FieldGroup label="E-mail" htmlFor={`email-editar-${colaborador.id}`}>
        <Input
          id={`email-editar-${colaborador.id}`}
          name="email"
          type="email"
          defaultValue={colaborador.email ?? ""}
        />
      </FieldGroup>
      <FieldGroup label="Telefone" htmlFor={`telefone-editar-${colaborador.id}`}>
        <Input
          id={`telefone-editar-${colaborador.id}`}
          name="telefone"
          type="tel"
          defaultValue={colaborador.telefone ?? ""}
        />
      </FieldGroup>
      <FieldGroup label="CPF" htmlFor={`cpf-editar-${colaborador.id}`}>
        <Input id={`cpf-editar-${colaborador.id}`} name="cpf" defaultValue={colaborador.cpf ?? ""} />
      </FieldGroup>
      <FieldGroup label="Perfil (opcional)" htmlFor={`perfil-editar-${colaborador.id}`}>
        <Select
          id={`perfil-editar-${colaborador.id}`}
          name="perfil_id"
          defaultValue={colaborador.perfil_id ?? ""}
        >
          <option value="">Sem perfil</option>
          {perfis.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </Select>
      </FieldGroup>
    </FormModal>
  );
}
