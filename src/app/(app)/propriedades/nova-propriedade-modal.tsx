"use client";

import { Plus } from "lucide-react";
import { FormModal } from "@/components/ui/form-modal";
import { FieldGroup, Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { EnderecoFields } from "@/components/endereco-fields";

export function NovaPropriedadeModal({ action }: { action: (formData: FormData) => void }) {
  return (
    <FormModal
      title="Nova propriedade"
      action={action}
      submitLabel="Adicionar"
      trigger={
        <Button type="button">
          <Plus className="h-4 w-4" />
          Nova propriedade
        </Button>
      }
    >
      <FieldGroup label="Nome" htmlFor="nome-prop">
        <Input id="nome-prop" name="nome" placeholder="Fazenda Boa Vista" required />
      </FieldGroup>
      <FieldGroup label="Área (ha) — opcional" htmlFor="area-prop">
        <Input id="area-prop" name="area_ha" type="number" step="0.01" min="0.01" placeholder="Deixe em branco se não fizer sentido pra sua sede" />
      </FieldGroup>
      <EnderecoFields idPrefix="nova-prop" />
    </FormModal>
  );
}
