"use client";

import { Plus } from "lucide-react";
import { FormModal } from "@/components/ui/form-modal";
import { FieldGroup, Input, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

export type LancamentoExistente = {
  id: string;
  tipo: string;
  categoria: string;
  descricao: string | null;
  valor: number;
  status: string;
  data: string;
  talhaoId: string | null;
};

export function NovoLancamentoModal({
  action,
  safras,
  safraFixa,
  etapaFixa,
  talhoes,
  defaultTipo = "despesa",
  trigger,
  lancamento,
}: {
  action: (formData: FormData) => void;
  safras?: { id: string; nome: string }[];
  safraFixa?: { id: string; nome: string };
  etapaFixa?: string;
  talhoes?: { id: string; nome: string }[];
  defaultTipo?: string;
  trigger?: React.ReactNode;
  lancamento?: LancamentoExistente;
}) {
  const editando = !!lancamento;

  return (
    <FormModal
      title={editando ? "Editar lançamento" : "Novo lançamento"}
      action={action}
      submitLabel={editando ? "Salvar alterações" : "Adicionar"}
      trigger={
        trigger ?? (
          <Button type="button">
            <Plus className="h-4 w-4" />
            Novo lançamento
          </Button>
        )
      }
    >
      {lancamento && <input type="hidden" name="id" value={lancamento.id} />}
      {etapaFixa && <input type="hidden" name="etapa" value={etapaFixa} />}
      <div className="grid grid-cols-2 gap-4">
        <FieldGroup label="Tipo" htmlFor="tipo-lanc">
          <Select id="tipo-lanc" name="tipo" defaultValue={lancamento?.tipo ?? defaultTipo}>
            <option value="receita">Receita</option>
            <option value="despesa">Despesa</option>
          </Select>
        </FieldGroup>
        <FieldGroup label="Status" htmlFor="status-lanc">
          <Select id="status-lanc" name="status" defaultValue={lancamento?.status ?? "realizado"}>
            <option value="realizado">Realizado</option>
            <option value="planejado">Planejado</option>
          </Select>
        </FieldGroup>
      </div>

      <FieldGroup label="Categoria" htmlFor="categoria-lanc">
        <Input
          id="categoria-lanc"
          name="categoria"
          placeholder="Insumos, venda de safra, folha..."
          required
          defaultValue={lancamento?.categoria ?? ""}
        />
      </FieldGroup>

      <FieldGroup label="Descrição (opcional)" htmlFor="descricao-lanc">
        <Input
          id="descricao-lanc"
          name="descricao"
          placeholder="Detalhes do lançamento"
          defaultValue={lancamento?.descricao ?? ""}
        />
      </FieldGroup>

      <div className="grid grid-cols-2 gap-4">
        <FieldGroup label="Valor (R$)" htmlFor="valor-lanc">
          <Input
            id="valor-lanc"
            name="valor"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0,00"
            required
            defaultValue={lancamento?.valor ?? ""}
          />
        </FieldGroup>
        <FieldGroup label="Data" htmlFor="data-lanc">
          <Input
            id="data-lanc"
            name="data"
            type="date"
            required
            defaultValue={lancamento?.data ?? new Date().toISOString().slice(0, 10)}
          />
        </FieldGroup>
      </div>

      {talhoes && talhoes.length > 0 && (
        <FieldGroup label="Talhão (opcional)" htmlFor="talhao-lanc">
          <Select id="talhao-lanc" name="talhao_id" defaultValue={lancamento?.talhaoId ?? ""}>
            <option value="">Sem talhão específico</option>
            {talhoes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome}
              </option>
            ))}
          </Select>
        </FieldGroup>
      )}

      {safraFixa ? (
        <>
          <input type="hidden" name="safra_id" value={safraFixa.id} />
          <p className="text-sm text-muted-foreground">
            Safra: <span className="font-medium text-foreground">{safraFixa.nome}</span>
          </p>
        </>
      ) : (
        <FieldGroup label="Safra (opcional)" htmlFor="safra-lanc">
          <Select id="safra-lanc" name="safra_id" defaultValue="">
            <option value="">Nenhuma</option>
            {safras?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nome}
              </option>
            ))}
          </Select>
        </FieldGroup>
      )}
    </FormModal>
  );
}
