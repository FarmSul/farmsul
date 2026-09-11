"use client";

import { Plus } from "lucide-react";
import { FormModal } from "@/components/ui/form-modal";
import { FieldGroup, Input, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { UFS } from "@/lib/ufs";

export function NovoClienteModal({ action }: { action: (formData: FormData) => void }) {
  return (
    <FormModal
      title="Novo cliente"
      description="Cria só o registro do cliente. Pra dar acesso a alguém, use “Usuários das Empresas” depois."
      action={action}
      submitLabel="Adicionar"
      trigger={
        <Button type="button">
          <Plus className="h-4 w-4" />
          Novo cliente
        </Button>
      }
    >
      <FieldGroup label="Nome da propriedade" htmlFor="nome-novo">
        <Input id="nome-novo" name="nome" placeholder="Fazenda Nova" required />
      </FieldGroup>

      <div className="grid grid-cols-2 gap-4">
        <FieldGroup label="Plano" htmlFor="plano-novo">
          <Select id="plano-novo" name="plano" defaultValue="essencial">
            <option value="essencial">Essencial</option>
            <option value="avancado">Avançado</option>
            <option value="consultoria">Consultoria</option>
          </Select>
        </FieldGroup>
        <FieldGroup label="CNPJ ou CPF" htmlFor="cnpj-novo">
          <Input id="cnpj-novo" name="cnpj_cpf" placeholder="00.000.000/0000-00" />
        </FieldGroup>
      </div>

      <FieldGroup label="Responsável" htmlFor="responsavel-novo">
        <Input id="responsavel-novo" name="responsavel" placeholder="Nome do responsável" />
      </FieldGroup>

      <div className="grid grid-cols-3 gap-4">
        <FieldGroup label="UF" htmlFor="uf-novo">
          <Select id="uf-novo" name="uf" defaultValue="">
            <option value="">—</option>
            {UFS.map((uf) => (
              <option key={uf} value={uf}>
                {uf}
              </option>
            ))}
          </Select>
        </FieldGroup>
        <FieldGroup label="Cidade" htmlFor="cidade-novo">
          <Input id="cidade-novo" name="cidade" placeholder="Dourados" />
        </FieldGroup>
        <FieldGroup label="CEP" htmlFor="cep-novo">
          <Input id="cep-novo" name="cep" placeholder="79800-000" />
        </FieldGroup>
      </div>
    </FormModal>
  );
}
