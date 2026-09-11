import { ClipboardList } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirectIfPlatformAdmin } from "@/lib/supabase/admin";
import { criarRegistroClimatico, atualizarRegistroClimatico, excluirRegistroClimatico } from "../actions";
import { NovaLeituraModal } from "./nova-leitura-modal";
import { LeituraRow } from "./leitura-row";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export default async function LeiturasPage() {
  const supabase = await createClient();
  await redirectIfPlatformAdmin();

  const [{ data: registros }, { data: estacoes }] = await Promise.all([
    supabase
      .from("registros_climaticos")
      .select("id, estacao_id, data, precipitacao_mm, temperatura_c, umidade_pct, pressao_hpa, estacoes_climaticas(nome)")
      .order("data", { ascending: false }),
    supabase.from("estacoes_climaticas").select("id, nome").order("nome"),
  ]);

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <NovaLeituraModal estacoes={estacoes ?? []} action={criarRegistroClimatico} />
      </div>

      <Card>
        {registros?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Data</th>
                  <th className="px-6 py-3 font-medium">Estação</th>
                  <th className="px-6 py-3 font-medium">Precipitação</th>
                  <th className="px-6 py-3 font-medium">Temperatura</th>
                  <th className="px-6 py-3 font-medium">Umidade</th>
                  <th className="px-6 py-3 font-medium">Pressão</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {registros.map((r) => {
                  const estacao = Array.isArray(r.estacoes_climaticas) ? r.estacoes_climaticas[0] : r.estacoes_climaticas;
                  return (
                    <LeituraRow
                      key={r.id}
                      id={r.id}
                      estacaoId={r.estacao_id}
                      estacaoNome={estacao?.nome}
                      data={r.data}
                      precipitacaoMm={r.precipitacao_mm}
                      temperaturaC={r.temperatura_c}
                      umidadePct={r.umidade_pct}
                      pressaoHpa={r.pressao_hpa}
                      estacoes={estacoes ?? []}
                      atualizarAction={atualizarRegistroClimatico}
                      excluirAction={excluirRegistroClimatico}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={ClipboardList}
            title="Nenhum registro climático"
            description={
              estacoes?.length
                ? "Adicione o primeiro registro usando o botão acima."
                : "Cadastre primeiro uma estação em Estações."
            }
          />
        )}
      </Card>
    </div>
  );
}
