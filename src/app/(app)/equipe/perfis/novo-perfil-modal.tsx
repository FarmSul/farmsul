"use client";

import { Plus } from "lucide-react";
import { FormModal } from "@/components/ui/form-modal";
import { FieldGroup, Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { PermissoesFields } from "./permissoes-fields";

export function NovoPerfilModal({ action }: { action: (formData: FormData) => void }) {
  return (
    <FormModal
      title="Novo perfil"
      action={action}
      submitLabel="Adicionar"
      trigger={
        <Button type="button">
          <Plus className="h-4 w-4" />
          Adicionar perfil
        </Button>
      }
    >
      <FieldGroup label="Nome" htmlFor="nome-perfil">
        <Input id="nome-perfil" name="nome" placeholder="Ex.: Agrônomo" required />
      </FieldGroup>
      <FieldGroup label="Descrição" htmlFor="descricao-perfil">
        <Input id="descricao-perfil" name="descricao" placeholder="O que esse perfil pode acessar" />
      </FieldGroup>
      <PermissoesFields />
    </FormModal>
  );
}
