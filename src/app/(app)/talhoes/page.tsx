import { LandPlot } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirectIfPlatformAdmin } from "@/lib/supabase/admin";
import { criarTalhao, atualizarTalhao, excluirTalhao } from "./actions";
import { NovoTalhaoModal } from "./novo-talhao-modal";
import { TalhaoRow } from "./talhao-row";
import { PageBanner } from "@/components/ui/page-banner";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export default async function TalhoesPage() {
  const supabase = await createClient();
  await redirectIfPlatformAdmin();

  const [{ data: talhoes }, { data: propriedades }] = await Promise.all([
    supabase
      .from("talhoes")
      .select("id, nome, area_ha, geom, propriedade_id, propriedades(nome), safra_talhoes(area_ha, safras(nome))")
      .order("criado_em", { ascending: false }),
    supabase.from("propriedades").select("id, nome").order("nome"),
  ]);

  return (
    <div>
      <PageBanner
        icon={LandPlot}
        title="Talhões"
        description="Áreas de cultivo dentro de cada propriedade."
        tags={["Propriedades", "Safras"]}
      />

      <div className="mb-4 flex justify-end">
        <NovoTalhaoModal propriedades={propriedades ?? []} action={criarTalhao} />
      </div>

      <Card>
        {talhoes?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Nome</th>
                  <th className="px-6 py-3 font-medium">Área</th>
                  <th className="px-6 py-3 font-medium">Propriedade</th>
                  <th className="px-6 py-3 font-medium">Safra</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {talhoes.map((t) => {
                  const propriedade = Array.isArray(t.propriedades) ? t.propriedades[0] : t.propriedades;
                  const safraTalhoes = Array.isArray(t.safra_talhoes) ? t.safra_talhoes : [];
                  return (
                    <TalhaoRow
                      key={t.id}
                      id={t.id}
                      nome={t.nome}
                      areaHa={t.area_ha}
                      geom={t.geom as GeoJSON.Polygon | null}
                      propriedadeNome={propriedade?.nome}
                      propriedadeId={t.propriedade_id}
                      propriedades={propriedades ?? []}
                      safraTalhoes={safraTalhoes}
                      atualizarAction={atualizarTalhao}
                      excluirAction={excluirTalhao}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={LandPlot}
            title="Nenhum talhão cadastrado"
            description={
              propriedades?.length
                ? "Adicione o primeiro talhão usando o botão acima."
                : "Cadastre primeiro uma propriedade — o talhão sempre pertence a uma."
            }
          />
        )}
      </Card>
    </div>
  );
}
