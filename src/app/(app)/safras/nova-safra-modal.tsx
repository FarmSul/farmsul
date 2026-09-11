"use client";

import { Plus } from "lucide-react";
import { FormModal } from "@/components/ui/form-modal";
import { Button } from "@/components/ui/button";
import { SafraFormFields, type Talhao } from "./safra-form-fields";

export function NovaSafraModal({
  talhoes,
  action,
}: {
  talhoes: Talhao[];
  action: (formData: FormData) => void;
}) {
  return (
    <FormModal
      title="Nova safra"
      action={action}
      submitLabel="Adicionar"
      maxWidth="max-w-2xl"
      trigger={
        <Button type="button">
          <Plus className="h-4 w-4" />
          Nova safra
        </Button>
      }
    >
      <SafraFormFields talhoes={talhoes} />
    </FormModal>
  );
}
