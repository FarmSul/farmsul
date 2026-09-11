import { Layers } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requirePlatformAdmin } from "@/lib/supabase/admin";
import { PLANOS, PLANO_IDS } from "@/lib/planos";
import { PageBanner } from "@/components/ui/page-banner";
import { IconStatCard } from "@/components/ui/icon-stat-card";

export default async function PlanosPage() {
  const supabase = await createClient();
  await requirePlatformAdmin();

  const { data: tenants } = await supabase.from("tenants").select("plano");

  const contagem = new Map<string, number>();
  tenants?.forEach((t) => {
    contagem.set(t.plano, (contagem.get(t.plano) ?? 0) + 1);
  });

  return (
    <div>
      <PageBanner
        icon={Layers}
        title="Planos"
        description="Quantos clientes estão em cada plano hoje."
        tags={["Essencial", "Avançado", "Consultoria"]}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {PLANO_IDS.map((id) => (
          <IconStatCard
            key={id}
            icon={Layers}
            tone={PLANOS[id].tone}
            label={PLANOS[id].label}
            value={contagem.get(id) ?? 0}
            hint={`clientes · R$ ${PLANOS[id].preco}/mês cada`}
          />
        ))}
      </div>
    </div>
  );
}
