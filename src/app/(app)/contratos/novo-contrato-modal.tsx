"use client";

import { Plus } from "lucide-react";
import { FormModal } from "@/components/ui/form-modal";
import { FieldGroup, Input, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

export function NovoContratoModal({ action }: { action: (formData: FormData) => void }) {
  return (
    <FormModal
      title="Novo contrato"
      action={action}
      submitLabel="Adicionar"
      trigger={
        <Button type="button">
          <Plus className="h-4 w-4" />
          Novo contrato
        </Button>
      }
    >
      <FieldGroup label="Título" htmlFor="titulo-contrato">
        <Input id="titulo-contrato" name="titulo" placeholder="Arrendamento Talhão 3" required />
      </FieldGroup>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FieldGroup label="Tipo" htmlFor="tipo-contrato">
          <Select id="tipo-contrato" name="tipo" defaultValue="arrendamento">
            <option value="arrendamento">Arrendamento</option>
            <option value="parceria">Parceria</option>
            <option value="compra">Compra</option>
            <option value="venda">Venda</option>
            <option value="outro">Outro</option>
          </Select>
        </FieldGroup>
        <FieldGroup label="Contraparte" htmlFor="contraparte-contrato">
          <Input id="contraparte-contrato" name="contraparte" placeholder="Nome ou empresa" />
        </FieldGroup>
      </div>

      <FieldGroup label="Valor (R$, opcional)" htmlFor="valor-contrato">
        <Input id="valor-contrato" name="valor" type="number" step="0.01" min="0.01" placeholder="0,00" />
      </FieldGroup>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FieldGroup label="Início" htmlFor="inicio-contrato">
          <Input id="inicio-contrato" name="data_inicio" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} />
        </FieldGroup>
        <FieldGroup label="Fim (opcional)" htmlFor="fim-contrato">
          <Input id="fim-contrato" name="data_fim" type="date" />
        </FieldGroup>
      </div>
    </FormModal>
  );
}
