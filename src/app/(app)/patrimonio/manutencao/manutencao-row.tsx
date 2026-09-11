"use client";

import { Trash2, FileText } from "lucide-react";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { AbrirManutencaoModal, type ManutencaoExistente } from "../abrir-manutencao-modal";

function formatBRL(valor: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);
}

export function ManutencaoRow({
  manutencao,
  equipamentoNome,
  responsavelNome,
  equipamentos,
  colaboradores,
  atualizarAction,
  excluirAction,
}: {
  manutencao: ManutencaoExistente & { custo: number };
  equipamentoNome: string;
  responsavelNome: string | undefined;
  equipamentos: { id: string; nome: string }[];
  colaboradores: { id: string; nome: string }[];
  atualizarAction: (formData: FormData) => void;
  excluirAction: (formData: FormData) => void;
}) {
  const pecas = manutencao.pecas ?? [];

  return (
    <AbrirManutencaoModal
      equipamentos={equipamentos}
      colaboradores={colaboradores}
      manutencao={manutencao}
      action={atualizarAction}
      trigger={
        <tr className="cursor-pointer border-b border-border last:border-0 hover:bg-surface-hover">
          <td className="px-6 py-3.5 font-medium text-foreground">{equipamentoNome}</td>
          <td className="px-6 py-3.5 text-muted-foreground">
            {new Date(`${manutencao.data}T00:00:00`).toLocaleDateString("pt-BR")}
          </td>
          <td className="px-6 py-3.5 text-muted-foreground">{manutencao.descricao}</td>
          <td className="px-6 py-3.5 text-muted-foreground">{responsavelNome ?? "—"}</td>
          <td className="px-6 py-3.5 text-muted-foreground">
            {pecas.length ? `${pecas.length} peça${pecas.length > 1 ? "s" : ""}` : "—"}
          </td>
          <td className="px-6 py-3.5 text-muted-foreground">{formatBRL(manutencao.custo)}</td>
          <td className="px-6 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-end gap-1">
              {manutencao.notaFiscalUrl && (
                <a
                  href={manutencao.notaFiscalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Ver nota fiscal"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-hover hover:text-primary"
                >
                  <FileText className="h-4 w-4" />
                </a>
              )}
              <form action={excluirAction}>
                <input type="hidden" name="id" value={manutencao.id} />
                <ConfirmButton
                  confirmText="Excluir esse registro de manutenção?"
                  title="Excluir"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-danger-soft hover:text-danger"
                >
                  <Trash2 className="h-4 w-4" />
                </ConfirmButton>
              </form>
            </div>
          </td>
        </tr>
      }
    />
  );
}
