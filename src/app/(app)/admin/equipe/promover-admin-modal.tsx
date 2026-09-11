"use client";

import { UserPlus } from "lucide-react";
import { FormModal } from "@/components/ui/form-modal";
import { FieldGroup, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

export function PromoverAdminModal({
  candidatos,
  action,
}: {
  candidatos: { id: string; nome_completo: string | null }[];
  action: (formData: FormData) => void;
}) {
  if (!candidatos.length) {
    return (
      <Button type="button" variant="secondary" disabled title="Nenhum usuário disponível para promover">
        <UserPlus className="h-4 w-4" />
        Promover admin
      </Button>
    );
  }

  return (
    <FormModal
      title="Promover a admin FarmSul"
      description="A pessoa passa a ter acesso a todos os clientes da plataforma."
      action={action}
      submitLabel="Promover"
      trigger={
        <Button type="button">
          <UserPlus className="h-4 w-4" />
          Promover admin
        </Button>
      }
    >
      <FieldGroup label="Usuário" htmlFor="id-promover">
        <Select id="id-promover" name="id" required>
          {candidatos.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome_completo ?? c.id}
            </option>
          ))}
        </Select>
      </FieldGroup>
    </FormModal>
  );
}
