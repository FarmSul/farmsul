"use client";

import { useState } from "react";
import { Plus, Paperclip } from "lucide-react";
import { FormModal } from "@/components/ui/form-modal";
import { FieldGroup, Input, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

export function NovaNotaModal({ action }: { action: (formData: FormData) => void }) {
  const [arquivoNome, setArquivoNome] = useState<string | null>(null);

  return (
    <FormModal
      title="Nova nota fiscal"
      action={action}
      submitLabel="Adicionar"
      trigger={
        <Button type="button">
          <Plus className="h-4 w-4" />
          Nova nota
        </Button>
      }
    >
      <div className="grid grid-cols-2 gap-4">
        <FieldGroup label="Número" htmlFor="numero-nf">
          <Input id="numero-nf" name="numero" placeholder="000123" required />
        </FieldGroup>
        <FieldGroup label="Tipo" htmlFor="tipo-nf">
          <Select id="tipo-nf" name="tipo" defaultValue="saida">
            <option value="saida">Saída</option>
            <option value="entrada">Entrada</option>
          </Select>
        </FieldGroup>
      </div>

      <FieldGroup label="Descrição (opcional)" htmlFor="descricao-nf">
        <Input id="descricao-nf" name="descricao" placeholder="Venda de soja, compra de insumo..." />
      </FieldGroup>

      <div className="grid grid-cols-2 gap-4">
        <FieldGroup label="Valor (R$)" htmlFor="valor-nf">
          <Input id="valor-nf" name="valor" type="number" step="0.01" min="0.01" placeholder="0,00" required />
        </FieldGroup>
        <FieldGroup label="Data de emissão" htmlFor="data-nf">
          <Input id="data-nf" name="data_emissao" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} />
        </FieldGroup>
      </div>

      <div className="flex flex-col">
        <span className="mb-1.5 block text-sm font-medium text-foreground">Arquivo da nota (opcional)</span>
        <label
          htmlFor="arquivo-nf"
          className="flex h-[38px] w-fit cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-surface px-3 text-sm text-muted-foreground hover:bg-surface-hover"
        >
          <Paperclip className="h-4 w-4" />
          <span className="max-w-[220px] truncate">{arquivoNome ?? "Anexar PDF ou imagem"}</span>
        </label>
        <input
          id="arquivo-nf"
          name="arquivo"
          type="file"
          accept="image/png,image/jpeg,image/webp,application/pdf"
          className="hidden"
          onChange={(e) => setArquivoNome(e.target.files?.[0]?.name ?? null)}
        />
      </div>
    </FormModal>
  );
}
