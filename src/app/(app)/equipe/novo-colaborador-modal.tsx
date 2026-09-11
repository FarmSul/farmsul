"use client";

import { Plus } from "lucide-react";
import { FormModal } from "@/components/ui/form-modal";
import { FieldGroup, Input, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

export function NovoColaboradorModal({
  perfis,
  action,
}: {
  perfis: { id: string; nome: string }[];
  action: (formData: FormData) => void;
}) {
  return (
    <FormModal
      title="Novo colaborador"
      action={action}
      submitLabel="Adicionar"
      trigger={
        <Button type="button">
          <Plus className="h-4 w-4" />
          Adicionar colaborador
        </Button>
      }
    >
      <FieldGroup label="Nome" htmlFor="nome-colaborador">
        <Input id="nome-colaborador" name="nome" placeholder="Nome completo" required />
      </FieldGroup>
      <FieldGroup label="E-mail" htmlFor="email-colaborador">
        <Input id="email-colaborador" name="email" type="email" placeholder="nome@exemplo.com" />
      </FieldGroup>
      <FieldGroup label="Telefone" htmlFor="telefone-colaborador">
        <Input id="telefone-colaborador" name="telefone" type="tel" placeholder="(00) 00000-0000" />
      </FieldGroup>
      <FieldGroup label="CPF" htmlFor="cpf-colaborador">
        <Input id="cpf-colaborador" name="cpf" placeholder="000.000.000-00" />
      </FieldGroup>
      <FieldGroup label="Perfil (opcional)" htmlFor="perfil-colaborador">
        <Select id="perfil-colaborador" name="perfil_id" defaultValue="">
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
