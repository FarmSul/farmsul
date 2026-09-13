"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ConfirmButton } from "@/components/ui/confirm-button";

function formatDataCurta(data: string) {
  return new Date(`${data}T00:00:00`).toLocaleDateString("pt-BR");
}

export function SafraRow({
  id,
  nome,
  cultura,
  dataInicio,
  dataFim,
  tipoCusto,
  numeroAreas,
  areaTotal,
  excluirAction,
}: {
  id: string;
  nome: string;
  cultura: string;
  dataInicio: string;
  dataFim: string | null;
  tipoCusto: string;
  numeroAreas: number;
  areaTotal: number;
  excluirAction: (formData: FormData) => void;
}) {
  return (
    <tr className="border-b border-border last:border-0 hover:bg-surface-hover">
      <td className="p-0">
        <Link href={`/safras/${id}`} className="block px-6 py-3.5 font-medium text-foreground">
          {nome}
        </Link>
      </td>
      <td className="p-0">
        <Link href={`/safras/${id}`} className="block px-6 py-3.5">
          <Badge tone="primary">{cultura}</Badge>
        </Link>
      </td>
      <td className="p-0">
        <Link href={`/safras/${id}`} className="block px-6 py-3.5 text-muted-foreground">
          {formatDataCurta(dataInicio)} {dataFim ? `— ${formatDataCurta(dataFim)}` : ""}
        </Link>
      </td>
      <td className="p-0">
        <Link href={`/safras/${id}`} className="block px-6 py-3.5 text-muted-foreground">
          {numeroAreas
            ? `${numeroAreas} área${numeroAreas > 1 ? "s" : ""} · ${areaTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ha`
            : "—"}
        </Link>
      </td>
      <td className="p-0">
        <Link href={`/safras/${id}`} className="block px-6 py-3.5">
          <Badge tone={tipoCusto === "manual" ? "amber" : "neutral"}>{tipoCusto}</Badge>
        </Link>
      </td>
      <td className="px-6 py-3.5 text-right">
        <form action={excluirAction}>
          <input type="hidden" name="id" value={id} />
          <ConfirmButton
            confirmText={`Excluir a safra "${nome}"?`}
            title="Excluir"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-danger-soft hover:text-danger"
          >
            <Trash2 className="h-4 w-4" />
          </ConfirmButton>
        </form>
      </td>
    </tr>
  );
}
