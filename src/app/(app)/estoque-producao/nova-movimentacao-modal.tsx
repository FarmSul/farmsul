"use client";

import { Plus } from "lucide-react";
import type { ReactNode } from "react";
import { FormModal } from "@/components/ui/form-modal";
import { FieldGroup, Input, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

export type MovimentacaoExistente = {
  id: string;
  produto: string;
  tipo: string;
  quantidade: number;
  unidade: string;
  local: string | null;
  data: string;
};

export function NovaMovimentacaoModal({
  safras,
  safraFixa,
  etapaFixa,
  title = "Nova movimentação",
  defaultTipo = "entrada",
  trigger,
  action,
  movimentacao,
}: {
  safras: { id: string; nome: string }[];
  safraFixa?: { id: string; nome: string };
  etapaFixa?: string;
  title?: string;
  defaultTipo?: string;
  trigger?: ReactNode;
  action: (formData: FormData) => void;
  movimentacao?: MovimentacaoExistente;
}) {
  const editando = !!movimentacao;

  return (
    <FormModal
      title={title}
      action={action}
      submitLabel={editando ? "Salvar alterações" : "Adicionar"}
      trigger={
        trigger ?? (
          <Button type="button">
            <Plus className="h-4 w-4" />
            Nova movimentação
          </Button>
        )
      }
    >
      {movimentacao && <input type="hidden" name="id" value={movimentacao.id} />}
      {etapaFixa && <input type="hidden" name="etapa" value={etapaFixa} />}

      <div className="grid grid-cols-2 gap-4">
        <FieldGroup label="Produto" htmlFor="produto-est">
          <Input id="produto-est" name="produto" placeholder="Soja, milho..." required defaultValue={movimentacao?.produto ?? ""} />
        </FieldGroup>
        {editando ? (
          <div>
            <span className="mb-1.5 block text-sm font-medium text-foreground">Tipo</span>
            <input type="hidden" name="tipo" value={movimentacao.tipo} />
            <p className="flex h-[38px] items-center text-sm text-muted-foreground">
              {movimentacao.tipo === "entrada" ? "Entrada" : "Saída"}
            </p>
          </div>
        ) : (
          <FieldGroup label="Tipo" htmlFor="tipo-est">
            <Select id="tipo-est" name="tipo" defaultValue={defaultTipo}>
              <option value="entrada">Entrada</option>
              <option value="saida">Saída</option>
            </Select>
          </FieldGroup>
        )}
      </div>

      {safraFixa ? (
        <>
          <input type="hidden" name="safra_id" value={safraFixa.id} />
          <p className="text-sm text-muted-foreground">
            Safra: <span className="font-medium text-foreground">{safraFixa.nome}</span>
          </p>
        </>
      ) : (
        !editando && (
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
        )
      )}

      <div className="grid grid-cols-2 gap-4">
        <FieldGroup label="Quantidade" htmlFor="quantidade-est">
          <Input
            id="quantidade-est"
            name="quantidade"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0"
            required
            defaultValue={movimentacao?.quantidade ?? ""}
          />
        </FieldGroup>
        <FieldGroup label="Unidade" htmlFor="unidade-est">
          <Select id="unidade-est" name="unidade" defaultValue={movimentacao?.unidade ?? "saca"}>
            <option value="saca">saca</option>
            <option value="kg">kg</option>
            <option value="ton">ton</option>
          </Select>
        </FieldGroup>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FieldGroup label="Local (opcional)" htmlFor="local-est">
          <Input id="local-est" name="local" placeholder="Silo 1, armazém..." defaultValue={movimentacao?.local ?? ""} />
        </FieldGroup>
        <FieldGroup label="Data" htmlFor="data-est">
          <Input
            id="data-est"
            name="data"
            type="date"
            required
            defaultValue={movimentacao?.data ?? new Date().toISOString().slice(0, 10)}
          />
        </FieldGroup>
      </div>
    </FormModal>
  );
}
