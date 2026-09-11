"use client";

import { Plus } from "lucide-react";
import { FormModal } from "@/components/ui/form-modal";
import { Button } from "@/components/ui/button";
import { EquipamentoFormFields } from "./equipamento-form-fields";

export function NovoEquipamentoModal({ action }: { action: (formData: FormData) => void }) {
  return (
    <FormModal
      title="Novo equipamento"
      action={action}
      submitLabel="Adicionar"
      maxWidth="max-w-2xl"
      trigger={
        <Button type="button">
          <Plus className="h-4 w-4" />
          Novo equipamento
        </Button>
      }
    >
      <EquipamentoFormFields />
    </FormModal>
  );
}
