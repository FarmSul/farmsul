import { Beef, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirectIfPlatformAdmin } from "@/lib/supabase/admin";
import { criarLote, excluirLote } from "./actions";
import { NovoLoteModal } from "./novo-lote-modal";
import { PageBanner } from "@/components/ui/page-banner";
import { IconStatCard } from "@/components/ui/icon-stat-card";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmButton } from "@/components/ui/confirm-button";

function formatDataCurta(data: string) {
  return new Date(`${data}T00:00:00`).toLocaleDateString("pt-BR");
}

export default async function PecuariaPage() {
  const supabase = await createClient();
  await redirectIfPlatformAdmin();

  const { data: lotes } = await supabase
    .from("pecuaria_lotes")
    .select("id, identificacao, categoria, quantidade, peso_medio_kg, data_entrada, observacoes")
    .order("data_entrada", { ascending: false });

  const totalCabecas = (lotes ?? []).reduce((s, l) => s + l.quantidade, 0);

  return (
    <div>
      <PageBanner
        icon={Beef}
        title="Pecuária"
        description="Lotes de animais da fazenda."
        tags={["Lotes", "Rebanho"]}
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <IconStatCard icon={Beef} tone="primary" label="Total de cabeças" value={totalCabecas} />
        <IconStatCard icon={Beef} tone="slate" label="Lotes ativos" value={lotes?.length ?? 0} />
      </div>

      <div className="mb-4 flex justify-end">
        <NovoLoteModal action={criarLote} />
      </div>

      <Card>
        {lotes?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Identificação</th>
                  <th className="px-6 py-3 font-medium">Categoria</th>
                  <th className="px-6 py-3 font-medium">Quantidade</th>
                  <th className="px-6 py-3 font-medium">Peso médio</th>
                  <th className="px-6 py-3 font-medium">Entrada</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {lotes.map((l) => (
                  <tr key={l.id} className="border-b border-border last:border-0 hover:bg-surface-hover">
                    <td className="px-6 py-3.5 font-medium text-foreground">
                      {l.identificacao}
                      {l.observacoes && <p className="text-xs font-normal text-muted-foreground">{l.observacoes}</p>}
                    </td>
                    <td className="px-6 py-3.5">
                      <Badge tone="primary">{l.categoria}</Badge>
                    </td>
                    <td className="px-6 py-3.5 text-muted-foreground">{l.quantidade}</td>
                    <td className="px-6 py-3.5 text-muted-foreground">
                      {l.peso_medio_kg ? `${l.peso_medio_kg} kg` : "—"}
                    </td>
                    <td className="px-6 py-3.5 text-muted-foreground">{formatDataCurta(l.data_entrada)}</td>
                    <td className="px-6 py-3.5 text-right">
                      <form action={excluirLote}>
                        <input type="hidden" name="id" value={l.id} />
                        <ConfirmButton
                          confirmText={`Excluir o lote "${l.identificacao}"?`}
                          title="Excluir"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-danger-soft hover:text-danger"
                        >
                          <Trash2 className="h-4 w-4" />
                        </ConfirmButton>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={Beef} title="Nenhum lote cadastrado" />
        )}
      </Card>
    </div>
  );
}
