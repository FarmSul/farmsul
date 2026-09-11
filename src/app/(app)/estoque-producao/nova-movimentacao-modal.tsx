"use client";

import { Plus } from "lucide-react";
import { FormModal } from "@/components/ui/form-modal";
import { FieldGroup, Input, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

export function NovaMovimentacaoModal({
  safras,
  action,
}: {
  safras: { id: string; nome: string }[];
  action: (formData: FormData) => void;
}) {
  return (
    <FormModal
      title="Nova movimentação"
      action={action}
      submitLabel="Adicionar"
      trigger={
        <Button type="button">
          <Plus className="h-4 w-4" />
          Nova movimentação
        </Button>
      }
    >
      <div className="grid grid-cols-2 gap-4">
        <FieldGroup label="Produto" htmlFor="produto-est">
          <Input id="produto-est" name="produto" placeholder="Soja, milho..." required />
        </FieldGroup>
        <FieldGroup label="Tipo" htmlFor="tipo-est">
          <Select id="tipo-est" name="tipo" defaultValue="entrada">
            <option value="entrada">Entrada</option>
            <option value="saida">Saída</option>
          </Select>
        </FieldGroup>
      </div>

      <FieldGroup label="Safra (opcional)" htmlFor="safra-est">
        <Select id="safra-est" name="safra_id" defaultValue="">
          <option value="">Sem safra vinculada</option>
          {safras.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nome}
            </option>
          ))}
        </Select>
      </FieldGroup>

      <div className="grid grid-cols-2 gap-4">
        <FieldGroup label="Quantidade" htmlFor="quantidade-est">
          <Input id="quantidade-est" name="quantidade" type="number" step="0.01" min="0.01" placeholder="0" required />
        </FieldGroup>
        <FieldGroup label="Unidade" htmlFor="unidade-est">
          <Select id="unidade-est" name="unidade" defaultValue="saca">
            <option value="saca">saca</option>
            <option value="kg">kg</option>
            <option value="ton">ton</option>
          </Select>
        </FieldGroup>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FieldGroup label="Local (opcional)" htmlFor="local-est">
          <Input id="local-est" name="local" placeholder="Silo 1, armazém..." />
        </FieldGroup>
        <FieldGroup label="Data" htmlFor="data-est">
          <Input id="data-est" name="data" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} />
        </FieldGroup>
      </div>
    </FormModal>
  );
}
