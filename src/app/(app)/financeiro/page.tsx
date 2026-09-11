import { Banknote, TrendingUp, TrendingDown, Scale, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirectIfPlatformAdmin } from "@/lib/supabase/admin";
import { criarLancamento, excluirLancamento } from "./actions";
import { NovoLancamentoModal } from "./novo-lancamento-modal";
import { PageBanner } from "@/components/ui/page-banner";
import { IconStatCard } from "@/components/ui/icon-stat-card";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmButton } from "@/components/ui/confirm-button";

function formatBRL(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function FinanceiroPage() {
  const supabase = await createClient();
  await redirectIfPlatformAdmin();

  const [{ data: lancamentos }, { data: safras }] = await Promise.all([
    supabase
      .from("lancamentos_financeiros")
      .select("id, tipo, categoria, descricao, valor, status, data, safras(nome)")
      .order("data", { ascending: false }),
    supabase.from("safras").select("id, nome").order("nome"),
  ]);

  const realizados = (lancamentos ?? []).filter((l) => l.status === "realizado");
  const receitas = realizados.filter((l) => l.tipo === "receita").reduce((s, l) => s + l.valor, 0);
  const despesas = realizados.filter((l) => l.tipo === "despesa").reduce((s, l) => s + l.valor, 0);

  return (
    <div>
      <PageBanner
        icon={Banknote}
        title="Financeiro"
        description="Receitas e despesas da sua fazenda."
        tags={["Receitas", "Despesas", "Saldo"]}
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <IconStatCard icon={TrendingUp} tone="primary" label="Receitas (realizadas)" value={formatBRL(receitas)} />
        <IconStatCard icon={TrendingDown} tone="amber" label="Despesas (realizadas)" value={formatBRL(despesas)} />
        <IconStatCard icon={Scale} tone="slate" label="Saldo" value={formatBRL(receitas - despesas)} />
      </div>

      <div className="mb-4 flex justify-end">
        <NovoLancamentoModal action={criarLancamento} safras={safras ?? []} />
      </div>

      <Card>
        {lancamentos?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Categoria</th>
                  <th className="px-6 py-3 font-medium">Tipo</th>
                  <th className="px-6 py-3 font-medium">Valor</th>
                  <th className="px-6 py-3 font-medium">Safra</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Data</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {lancamentos.map((l) => {
                  const safra = Array.isArray(l.safras) ? l.safras[0] : l.safras;
                  return (
                  <tr key={l.id} className="border-b border-border last:border-0 hover:bg-surface-hover">
                    <td className="px-6 py-3.5 font-medium text-foreground">
                      {l.categoria}
                      {l.descricao && <p className="text-xs font-normal text-muted-foreground">{l.descricao}</p>}
                    </td>
                    <td className="px-6 py-3.5">
                      <Badge tone={l.tipo === "receita" ? "primary" : "danger"}>{l.tipo}</Badge>
                    </td>
                    <td className="px-6 py-3.5 text-muted-foreground">{formatBRL(l.valor)}</td>
                    <td className="px-6 py-3.5 text-muted-foreground">{safra?.nome ?? "—"}</td>
                    <td className="px-6 py-3.5">
                      <Badge tone={l.status === "realizado" ? "neutral" : "amber"}>{l.status}</Badge>
                    </td>
                    <td className="px-6 py-3.5 text-muted-foreground">{l.data}</td>
                    <td className="px-6 py-3.5 text-right">
                      <form action={excluirLancamento}>
                        <input type="hidden" name="id" value={l.id} />
                        <ConfirmButton
                          confirmText="Excluir esse lançamento?"
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
          <EmptyState
            icon={Banknote}
            title="Nenhum lançamento cadastrado"
            description="Adicione o primeiro lançamento usando o botão acima."
          />
        )}
      </Card>
    </div>
  );
}
