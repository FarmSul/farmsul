import { Warehouse, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirectIfPlatformAdmin } from "@/lib/supabase/admin";
import { criarMovimentacao, excluirMovimentacao } from "./actions";
import { NovaMovimentacaoModal } from "./nova-movimentacao-modal";
import { PageBanner } from "@/components/ui/page-banner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmButton } from "@/components/ui/confirm-button";

export default async function EstoqueProducaoPage() {
  const supabase = await createClient();
  await redirectIfPlatformAdmin();

  const [{ data: movimentacoes }, { data: safras }] = await Promise.all([
    supabase
      .from("estoque_producao")
      .select("id, produto, tipo, quantidade, unidade, local, data, safras(nome)")
      .order("data", { ascending: false }),
    supabase.from("safras").select("id, nome").order("nome"),
  ]);

  return (
    <div>
      <PageBanner
        icon={Warehouse}
        title="Estoque de Produção"
        description="Entradas e saídas do que foi colhido/produzido."
        tags={["Produção", "Estoque"]}
      />

      <div className="mb-4 flex justify-end">
        <NovaMovimentacaoModal safras={safras ?? []} action={criarMovimentacao} />
      </div>

      <Card>
        {movimentacoes?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Produto</th>
                  <th className="px-6 py-3 font-medium">Tipo</th>
                  <th className="px-6 py-3 font-medium">Quantidade</th>
                  <th className="px-6 py-3 font-medium">Safra</th>
                  <th className="px-6 py-3 font-medium">Local</th>
                  <th className="px-6 py-3 font-medium">Data</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {movimentacoes.map((m) => {
                  const safra = Array.isArray(m.safras) ? m.safras[0] : m.safras;
                  return (
                    <tr key={m.id} className="border-b border-border last:border-0 hover:bg-surface-hover">
                      <td className="px-6 py-3.5 font-medium text-foreground">{m.produto}</td>
                      <td className="px-6 py-3.5">
                        <Badge tone={m.tipo === "entrada" ? "primary" : "amber"}>{m.tipo}</Badge>
                      </td>
                      <td className="px-6 py-3.5 text-muted-foreground">
                        {m.quantidade} {m.unidade}
                      </td>
                      <td className="px-6 py-3.5 text-muted-foreground">{safra?.nome ?? "—"}</td>
                      <td className="px-6 py-3.5 text-muted-foreground">{m.local ?? "—"}</td>
                      <td className="px-6 py-3.5 text-muted-foreground">{m.data}</td>
                      <td className="px-6 py-3.5 text-right">
                        <form action={excluirMovimentacao}>
                          <input type="hidden" name="id" value={m.id} />
                          <ConfirmButton
                            confirmText={`Excluir essa movimentação de "${m.produto}"?`}
                            title="Excluir"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-danger-soft hover:text-danger"
                          >
                            <Trash2 className="h-4 w-4" />
                          </ConfirmButton>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={Warehouse} title="Nenhuma movimentação cadastrada" />
        )}
      </Card>
    </div>
  );
}
