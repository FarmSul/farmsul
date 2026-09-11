"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { FormModal } from "@/components/ui/form-modal";
import { Button } from "@/components/ui/button";
import { LeituraFormFields, type Estacao } from "./leitura-form-fields";

export function NovaLeituraModal({
  estacoes,
  action,
}: {
  estacoes: Estacao[];
  action: (formData: FormData) => void;
}) {
  if (!estacoes.length) {
    return (
      <Link
        href="/registros/estacoes"
        className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover"
        title="Cadastre uma estação antes de registrar uma leitura"
      >
        <Plus className="h-4 w-4" />
        Cadastrar estação primeiro
      </Link>
    );
  }

  return (
    <FormModal
      title="Novo registro climático"
      action={action}
      submitLabel="Adicionar"
      trigger={
        <Button type="button">
          <Plus className="h-4 w-4" />
          Novo registro
        </Button>
      }
    >
      <LeituraFormFields estacoes={estacoes} />
    </FormModal>
  );
}
