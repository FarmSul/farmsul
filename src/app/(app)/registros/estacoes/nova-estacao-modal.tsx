"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { FormModal } from "@/components/ui/form-modal";
import { FieldGroup, Input, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

export function NovaEstacaoModal({
  propriedades,
  action,
}: {
  propriedades: { id: string; nome: string }[];
  action: (formData: FormData) => void;
}) {
  if (!propriedades.length) {
    return (
      <Link
        href="/propriedades"
        className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover"
        title="Cadastre uma propriedade antes de criar uma estação"
      >
        <Plus className="h-4 w-4" />
        Cadastrar propriedade primeiro
      </Link>
    );
  }

  return (
    <FormModal
      title="Nova estação"
      action={action}
      submitLabel="Adicionar"
      trigger={
        <Button type="button">
          <Plus className="h-4 w-4" />
          Nova estação
        </Button>
      }
    >
      <FieldGroup label="Nome" htmlFor="nome-estacao">
        <Input id="nome-estacao" name="nome" placeholder="Pluviômetro 01" required />
      </FieldGroup>
      <FieldGroup label="Tipo" htmlFor="tipo-estacao">
        <Select id="tipo-estacao" name="tipo" required defaultValue="pluviometro">
          <option value="pluviometro">Pluviômetro</option>
          <option value="estacao_meteorologica">Estação meteorológica</option>
        </Select>
      </FieldGroup>
      <FieldGroup label="Propriedade" htmlFor="propriedade-estacao">
        <Select id="propriedade-estacao" name="propriedade_id" required>
          {propriedades.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </Select>
      </FieldGroup>
    </FormModal>
  );
}
