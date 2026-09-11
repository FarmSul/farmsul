"use client";

import { Plus } from "lucide-react";
import { FormModal } from "@/components/ui/form-modal";
import { FieldGroup, Input, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

export function NovoLancamentoModal({ action }: { action: (formData: FormData) => void }) {
  return (
    <FormModal
      title="Novo lançamento"
      action={action}
      submitLabel="Adicionar"
      trigger={
        <Button type="button">
          <Plus className="h-4 w-4" />
          Novo lançamento
        </Button>
      }
    >
      <div className="grid grid-cols-2 gap-4">
        <FieldGroup label="Tipo" htmlFor="tipo-lanc">
          <Select id="tipo-lanc" name="tipo" defaultValue="despesa">
            <option value="receita">Receita</option>
            <option value="despesa">Despesa</option>
          </Select>
        </FieldGroup>
        <FieldGroup label="Status" htmlFor="status-lanc">
          <Select id="status-lanc" name="status" defaultValue="realizado">
            <option value="realizado">Realizado</option>
            <option value="planejado">Planejado</option>
          </Select>
        </FieldGroup>
      </div>

      <FieldGroup label="Categoria" htmlFor="categoria-lanc">
        <Input id="categoria-lanc" name="categoria" placeholder="Insumos, venda de safra, folha..." required />
      </FieldGroup>

      <FieldGroup label="Descrição (opcional)" htmlFor="descricao-lanc">
        <Input id="descricao-lanc" name="descricao" placeholder="Detalhes do lançamento" />
      </FieldGroup>

      <div className="grid grid-cols-2 gap-4">
        <FieldGroup label="Valor (R$)" htmlFor="valor-lanc">
          <Input id="valor-lanc" name="valor" type="number" step="0.01" min="0.01" placeholder="0,00" required />
        </FieldGroup>
        <FieldGroup label="Data" htmlFor="data-lanc">
          <Input id="data-lanc" name="data" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} />
        </FieldGroup>
      </div>
    </FormModal>
  );
}
