"use client";

import { Plus } from "lucide-react";
import { FormModal } from "@/components/ui/form-modal";
import { Button } from "@/components/ui/button";
import { InsumoFormFields } from "./insumo-form-fields";

export function NovoInsumoModal({ action }: { action: (formData: FormData) => void }) {
  return (
    <FormModal
      title="Novo insumo"
      action={action}
      submitLabel="Adicionar"
      maxWidth="max-w-xl"
      trigger={
        <Button type="button">
          <Plus className="h-4 w-4" />
          Novo insumo
        </Button>
      }
    >
      <InsumoFormFields />
    </FormModal>
  );
}
