"use client";

import { UserPlus } from "lucide-react";
import { FormModal } from "@/components/ui/form-modal";
import { FieldGroup, Input, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

const PAPEIS = ["proprietario", "gerente", "operador", "consultor"];

export function NovoUsuarioModal({
  tenants,
  action,
}: {
  tenants: { id: string; nome: string }[];
  action: (formData: FormData) => void;
}) {
  if (!tenants.length) {
    return (
      <Button type="button" variant="secondary" disabled title="Cadastre um cliente antes de criar usuários">
        <UserPlus className="h-4 w-4" />
        Novo usuário
      </Button>
    );
  }

  return (
    <FormModal
      title="Novo usuário"
      description="Cria um login novo já vinculado a um cliente existente."
      action={action}
      submitLabel="Criar usuário"
      trigger={
        <Button type="button">
          <UserPlus className="h-4 w-4" />
          Novo usuário
        </Button>
      }
    >
      <FieldGroup label="Nome" htmlFor="nome-usuario">
        <Input id="nome-usuario" name="nome_completo" required />
      </FieldGroup>
      <FieldGroup label="E-mail" htmlFor="email-usuario">
        <Input id="email-usuario" name="email" type="email" required />
      </FieldGroup>
      <FieldGroup label="Senha inicial" htmlFor="senha-usuario">
        <Input id="senha-usuario" name="password" type="password" minLength={6} required />
      </FieldGroup>
      <FieldGroup label="Cliente" htmlFor="tenant-usuario">
        <Select id="tenant-usuario" name="tenant_id" required>
          {tenants.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nome}
            </option>
          ))}
        </Select>
      </FieldGroup>
      <FieldGroup label="Papel" htmlFor="papel-usuario">
        <Select id="papel-usuario" name="papel" defaultValue="operador" className="capitalize">
          {PAPEIS.map((p) => (
            <option key={p} value={p} className="capitalize">
              {p}
            </option>
          ))}
        </Select>
      </FieldGroup>
    </FormModal>
  );
}
