import { MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirectIfPlatformAdmin } from "@/lib/supabase/admin";
import { criarPropriedade, atualizarPropriedade, excluirPropriedade } from "./actions";
import { NovaPropriedadeModal } from "./nova-propriedade-modal";
import { PropriedadeRow } from "./propriedade-row";
import { PageBanner } from "@/components/ui/page-banner";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export default async function PropriedadesPage() {
  const supabase = await createClient();
  await redirectIfPlatformAdmin();

  const { data: propriedades } = await supabase
    .from("propriedades")
    .select("id, nome, area_ha, municipio, estado")
    .order("criado_em", { ascending: false });

  return (
    <div>
      <PageBanner
        icon={MapPin}
        title="Propriedades"
        description="As fazendas cadastradas no seu tenant."
        tags={["Área", "Localização"]}
      />

      <div className="mb-4 flex justify-end">
        <NovaPropriedadeModal action={criarPropriedade} />
      </div>

      <Card>
        {propriedades?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Nome</th>
                  <th className="px-6 py-3 font-medium">Área</th>
                  <th className="px-6 py-3 font-medium">Localização</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {propriedades.map((p) => (
                  <PropriedadeRow
                    key={p.id}
                    id={p.id}
                    nome={p.nome}
                    areaHa={p.area_ha}
                    municipio={p.municipio}
                    estado={p.estado}
                    atualizarAction={atualizarPropriedade}
                    excluirAction={excluirPropriedade}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={MapPin}
            title="Nenhuma propriedade cadastrada"
            description="Adicione a primeira fazenda usando o botão acima."
          />
        )}
      </Card>
    </div>
  );
}
