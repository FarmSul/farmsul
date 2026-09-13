import { FileSignature, Ban, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirectIfPlatformAdmin } from "@/lib/supabase/admin";
import { criarContrato, encerrarContrato, excluirContrato } from "./actions";
import { NovoContratoModal } from "./novo-contrato-modal";
import { PageBanner } from "@/components/ui/page-banner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmButton } from "@/components/ui/confirm-button";

function formatBRL(valor: number | null) {
  return valor == null ? "—" : valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDataCurta(data: string) {
  return new Date(`${data}T00:00:00`).toLocaleDateString("pt-BR");
}

export default async function ContratosPage() {
  const supabase = await createClient();
  await redirectIfPlatformAdmin();

  const { data: contratos } = await supabase
    .from("contratos")
    .select("id, titulo, tipo, contraparte, valor, data_inicio, data_fim, status")
    .order("data_inicio", { ascending: false });

  return (
    <div>
      <PageBanner
        icon={FileSignature}
        title="Contratos"
        description="Arrendamentos, parcerias, compras e vendas."
        tags={["Contratos"]}
      />

      <div className="mb-4 flex justify-end">
        <NovoContratoModal action={criarContrato} />
      </div>

      <Card>
        {contratos?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Título</th>
                  <th className="px-6 py-3 font-medium">Tipo</th>
                  <th className="px-6 py-3 font-medium">Contraparte</th>
                  <th className="px-6 py-3 font-medium">Valor</th>
                  <th className="px-6 py-3 font-medium">Período</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {contratos.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-surface-hover">
                    <td className="px-6 py-3.5 font-medium text-foreground">{c.titulo}</td>
                    <td className="px-6 py-3.5">
                      <Badge tone="primary">{c.tipo}</Badge>
                    </td>
                    <td className="px-6 py-3.5 text-muted-foreground">{c.contraparte ?? "—"}</td>
                    <td className="px-6 py-3.5 text-muted-foreground">{formatBRL(c.valor)}</td>
                    <td className="px-6 py-3.5 text-muted-foreground">
                      {formatDataCurta(c.data_inicio)} {c.data_fim ? `— ${formatDataCurta(c.data_fim)}` : ""}
                    </td>
                    <td className="px-6 py-3.5">
                      <Badge tone={c.status === "ativo" ? "neutral" : "danger"}>{c.status}</Badge>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <div className="flex justify-end gap-1">
                        {c.status === "ativo" && (
                          <form action={encerrarContrato}>
                            <input type="hidden" name="id" value={c.id} />
                            <ConfirmButton
                              confirmText={`Encerrar o contrato "${c.titulo}"?`}
                              title="Encerrar"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-danger-soft hover:text-danger"
                            >
                              <Ban className="h-4 w-4" />
                            </ConfirmButton>
                          </form>
                        )}
                        <form action={excluirContrato}>
                          <input type="hidden" name="id" value={c.id} />
                          <ConfirmButton
                            confirmText={`Excluir o contrato "${c.titulo}"?`}
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
          <EmptyState icon={FileSignature} title="Nenhum contrato cadastrado" />
        )}
      </Card>
    </div>
  );
}
