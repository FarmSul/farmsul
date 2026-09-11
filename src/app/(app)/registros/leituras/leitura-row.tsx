"use client";

import { Trash2, Droplets } from "lucide-react";
import { FormModal } from "@/components/ui/form-modal";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { LeituraFormFields, type Estacao } from "./leitura-form-fields";

export function LeituraRow({
  id,
  estacaoId,
  estacaoNome,
  data,
  precipitacaoMm,
  temperaturaC,
  umidadePct,
  pressaoHpa,
  estacoes,
  atualizarAction,
  excluirAction,
}: {
  id: string;
  estacaoId: string;
  estacaoNome: string | undefined;
  data: string;
  precipitacaoMm: number | null;
  temperaturaC: number | null;
  umidadePct: number | null;
  pressaoHpa: number | null;
  estacoes: Estacao[];
  atualizarAction: (formData: FormData) => void;
  excluirAction: (formData: FormData) => void;
}) {
  return (
    <FormModal
      title="Editar registro climático"
      action={atualizarAction}
      submitLabel="Salvar alterações"
      trigger={
        <tr className="cursor-pointer border-b border-border last:border-0 hover:bg-surface-hover">
          <td className="px-6 py-3.5 text-muted-foreground">{new Date(`${data}T00:00:00`).toLocaleDateString("pt-BR")}</td>
          <td className="px-6 py-3.5 font-medium text-foreground">{estacaoNome ?? "—"}</td>
          <td className="px-6 py-3.5">
            <span className="flex items-center gap-1.5 text-foreground">
              <Droplets className="h-3.5 w-3.5 text-blue-500" />
              {precipitacaoMm != null ? `${precipitacaoMm} mm` : "—"}
            </span>
          </td>
          <td className="px-6 py-3.5 text-muted-foreground">{temperaturaC != null ? `${temperaturaC} °C` : "—"}</td>
          <td className="px-6 py-3.5 text-muted-foreground">{umidadePct != null ? `${umidadePct}%` : "—"}</td>
          <td className="px-6 py-3.5 text-muted-foreground">{pressaoHpa != null ? `${pressaoHpa} hPa` : "—"}</td>
          <td className="px-6 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
            <form action={excluirAction}>
              <input type="hidden" name="id" value={id} />
              <ConfirmButton
                confirmText="Excluir esse registro climático?"
                title="Excluir"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-danger-soft hover:text-danger"
              >
                <Trash2 className="h-4 w-4" />
              </ConfirmButton>
            </form>
          </td>
        </tr>
      }
    >
      <input type="hidden" name="id" value={id} />
      <LeituraFormFields
        idPrefix={`edit-leitura-${id}-`}
        estacoes={estacoes}
        defaultEstacaoId={estacaoId}
        defaultData={data}
        defaultPrecipitacao={precipitacaoMm ?? ""}
        defaultTemperatura={temperaturaC ?? ""}
        defaultUmidade={umidadePct ?? ""}
        defaultPressao={pressaoHpa ?? ""}
      />
    </FormModal>
  );
}
