import { FileCheck2, Ban, Trash2, Paperclip } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirectIfPlatformAdmin } from "@/lib/supabase/admin";
import { criarNotaFiscal, cancelarNotaFiscal, excluirNotaFiscal } from "./actions";
import { NovaNotaModal } from "./nova-nota-modal";
import { PageBanner } from "@/components/ui/page-banner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmButton } from "@/components/ui/confirm-button";

function formatBRL(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDataCurta(data: string) {
  return new Date(`${data}T00:00:00`).toLocaleDateString("pt-BR");
}

export default async function FiscalPage() {
  const supabase = await createClient();
  await redirectIfPlatformAdmin();

  const { data: notas } = await supabase
    .from("notas_fiscais")
    .select("id, numero, tipo, valor, data_emissao, descricao, status, arquivo_url")
    .order("data_emissao", { ascending: false });

  return (
    <div>
      <PageBanner
        icon={FileCheck2}
        title="Fiscal"
        description="Notas fiscais de entrada e saída."
        tags={["Notas fiscais"]}
      />

      <div className="mb-4 flex justify-end">
        <NovaNotaModal action={criarNotaFiscal} />
      </div>

      <Card>
        {notas?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Número</th>
                  <th className="px-6 py-3 font-medium">Tipo</th>
                  <th className="px-6 py-3 font-medium">Valor</th>
                  <th className="px-6 py-3 font-medium">Emissão</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {notas.map((n) => (
                  <tr key={n.id} className="border-b border-border last:border-0 hover:bg-surface-hover">
                    <td className="px-6 py-3.5 font-medium text-foreground">
                      {n.numero}
                      {n.descricao && <p className="text-xs font-normal text-muted-foreground">{n.descricao}</p>}
                    </td>
                    <td className="px-6 py-3.5">
                      <Badge tone={n.tipo === "saida" ? "primary" : "blue"}>{n.tipo}</Badge>
                    </td>
                    <td className="px-6 py-3.5 text-muted-foreground">{formatBRL(n.valor)}</td>
                    <td className="px-6 py-3.5 text-muted-foreground">{formatDataCurta(n.data_emissao)}</td>
                    <td className="px-6 py-3.5">
                      <Badge tone={n.status === "emitida" ? "neutral" : "danger"}>{n.status}</Badge>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <div className="flex justify-end gap-1">
                        {n.arquivo_url && (
                          <a
                            href={n.arquivo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Ver arquivo da nota"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-hover hover:text-primary"
                          >
                            <Paperclip className="h-4 w-4" />
                          </a>
                        )}
                        {n.status === "emitida" && (
                          <form action={cancelarNotaFiscal}>
                            <input type="hidden" name="id" value={n.id} />
                            <ConfirmButton
                              confirmText={`Cancelar a nota "${n.numero}"?`}
                              title="Cancelar"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-danger-soft hover:text-danger"
                            >
                              <Ban className="h-4 w-4" />
                            </ConfirmButton>
                          </form>
                        )}
                        <form action={excluirNotaFiscal}>
                          <input type="hidden" name="id" value={n.id} />
                          <ConfirmButton
                            confirmText={`Excluir a nota "${n.numero}"?`}
                            title="Excluir"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-danger-soft hover:text-danger"
                          >
                            <Trash2 className="h-4 w-4" />
                          </ConfirmButton>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={FileCheck2} title="Nenhuma nota fiscal cadastrada" />
        )}
      </Card>
    </div>
  );
}
