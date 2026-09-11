"use client";

import { Trash2 } from "lucide-react";
import { ConfirmButton } from "@/components/ui/confirm-button";
import {
  AbastecimentoModal,
  type AbastecimentoExistente,
  type Combustivel,
  type EquipamentoAbastecivel,
} from "../abastecimento-modal";

function formatBRL(valor: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);
}

export function AbastecimentoRow({
  abastecimento,
  equipamentoNome,
  combustivelNome,
  safraNome,
  equipamentos,
  combustiveis,
  safras,
  atualizarAction,
  excluirAction,
}: {
  abastecimento: AbastecimentoExistente;
  equipamentoNome: string;
  combustivelNome: string;
  safraNome: string | undefined;
  equipamentos: EquipamentoAbastecivel[];
  combustiveis: Combustivel[];
  safras: { id: string; nome: string }[];
  atualizarAction: (formData: FormData) => void;
  excluirAction: (formData: FormData) => void;
}) {
  return (
    <AbastecimentoModal
      equipamentos={equipamentos}
      combustiveis={combustiveis}
      safras={safras}
      abastecimento={abastecimento}
      action={atualizarAction}
      trigger={
        <tr className="cursor-pointer border-b border-border last:border-0 hover:bg-surface-hover">
          <td className="px-6 py-3.5 font-medium text-foreground">{equipamentoNome}</td>
          <td className="px-6 py-3.5 text-muted-foreground">
            {new Date(`${abastecimento.data}T00:00:00`).toLocaleDateString("pt-BR")}
          </td>
          <td className="px-6 py-3.5 text-muted-foreground">{combustivelNome}</td>
          <td className="px-6 py-3.5 text-muted-foreground">{abastecimento.litros} L</td>
          <td className="px-6 py-3.5 text-muted-foreground">{formatBRL(abastecimento.custoTotal)}</td>
          <td className="px-6 py-3.5 text-muted-foreground">{abastecimento.horimetro ?? "—"}</td>
          <td className="px-6 py-3.5 text-muted-foreground">{safraNome ?? "—"}</td>
          <td className="px-6 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
            <form action={excluirAction}>
              <input type="hidden" name="id" value={abastecimento.id} />
              <ConfirmButton
                confirmText="Excluir esse abastecimento? O litro consumido volta pro estoque do combustível."
                title="Excluir"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-danger-soft hover:text-danger"
              >
                <Trash2 className="h-4 w-4" />
              </ConfirmButton>
            </form>
          </td>
        </tr>
      }
    />
  );
}
