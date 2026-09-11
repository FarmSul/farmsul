"use client";

import { Plus } from "lucide-react";
import { FormModal } from "@/components/ui/form-modal";
import { FieldGroup, Input, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

export function NovoLoteModal({ action }: { action: (formData: FormData) => void }) {
  return (
    <FormModal
      title="Novo lote"
      action={action}
      submitLabel="Adicionar"
      trigger={
        <Button type="button">
          <Plus className="h-4 w-4" />
          Novo lote
        </Button>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FieldGroup label="Identificação" htmlFor="identificacao-lote">
          <Input id="identificacao-lote" name="identificacao" placeholder="Lote 01 - Pasto Norte" required />
        </FieldGroup>
        <FieldGroup label="Categoria" htmlFor="categoria-lote">
          <Select id="categoria-lote" name="categoria" defaultValue="boi">
            <option value="bezerro">Bezerro</option>
            <option value="novilho">Novilho</option>
            <option value="boi">Boi</option>
            <option value="vaca">Vaca</option>
            <option value="touro">Touro</option>
            <option value="outro">Outro</option>
          </Select>
        </FieldGroup>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FieldGroup label="Quantidade" htmlFor="quantidade-lote">
          <Input id="quantidade-lote" name="quantidade" type="number" min="1" placeholder="0" required />
        </FieldGroup>
        <FieldGroup label="Peso médio (kg, opcional)" htmlFor="peso-lote">
          <Input id="peso-lote" name="peso_medio_kg" type="number" step="0.1" min="0.1" placeholder="0,0" />
        </FieldGroup>
      </div>

      <FieldGroup label="Data de entrada" htmlFor="data-lote">
        <Input id="data-lote" name="data_entrada" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} />
      </FieldGroup>

      <FieldGroup label="Observações (opcional)" htmlFor="obs-lote">
        <Input id="obs-lote" name="observacoes" placeholder="Anotações sobre o lote" />
      </FieldGroup>
    </FormModal>
  );
}
