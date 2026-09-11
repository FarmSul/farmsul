import { Sprout } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirectIfPlatformAdmin } from "@/lib/supabase/admin";
import { criarSafra, atualizarSafra, excluirSafra } from "./actions";
import { NovaSafraModal } from "./nova-safra-modal";
import { SafraRow } from "./safra-row";
import { PageBanner } from "@/components/ui/page-banner";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export default async function SafrasPage() {
  const supabase = await createClient();
  await redirectIfPlatformAdmin();

  const [{ data: safras }, { data: talhoesData }] = await Promise.all([
    supabase
      .from("safras")
      .select("id, nome, cultura, data_inicio, data_fim, tipo_custo, safra_talhoes(talhao_id, area_ha)")
      .order("data_inicio", { ascending: false }),
    supabase.from("talhoes").select("id, nome, area_ha, propriedades(nome)").order("nome"),
  ]);

  const talhoes = (talhoesData ?? []).map((t) => ({
    id: t.id,
    nome: t.nome,
    area_ha: t.area_ha,
    propriedade_nome: (Array.isArray(t.propriedades) ? t.propriedades[0] : t.propriedades)?.nome ?? null,
  }));

  const listaSafras = (safras ?? []).map((s) => {
    const areas = Array.isArray(s.safra_talhoes) ? s.safra_talhoes : [];
    return {
      ...s,
      numeroAreas: areas.length,
      areaTotal: areas.reduce((soma, a) => soma + Number(a.area_ha), 0),
    };
  });

  return (
    <div>
      <PageBanner
        icon={Sprout}
        title="Safras"
        description="Ciclos de cultivo do seu tenant."
        tags={["Culturas", "Período"]}
      />

      <div className="mb-4 flex justify-end">
        <NovaSafraModal talhoes={talhoes} action={criarSafra} />
      </div>

      <Card>
        {listaSafras.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Nome</th>
                  <th className="px-6 py-3 font-medium">Cultura</th>
                  <th className="px-6 py-3 font-medium">Período</th>
                  <th className="px-6 py-3 font-medium">Áreas</th>
                  <th className="px-6 py-3 font-medium">Custo</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {listaSafras.map((s) => {
                  const areas = Array.isArray(s.safra_talhoes) ? s.safra_talhoes : [];
                  const defaultSelecionados = Object.fromEntries(
                    areas.map((a) => [a.talhao_id, Number(a.area_ha)]),
                  );
                  return (
                    <SafraRow
                      key={s.id}
                      id={s.id}
                      nome={s.nome}
                      cultura={s.cultura}
                      dataInicio={s.data_inicio}
                      dataFim={s.data_fim}
                      tipoCusto={s.tipo_custo}
                      numeroAreas={s.numeroAreas}
                      areaTotal={s.areaTotal}
                      talhoes={talhoes}
                      defaultSelecionados={defaultSelecionados}
                      atualizarAction={atualizarSafra}
                      excluirAction={excluirSafra}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Sprout}
            title="Nenhuma safra cadastrada"
            description="Adicione a primeira safra usando o botão acima."
          />
        )}
      </Card>
    </div>
  );
}
