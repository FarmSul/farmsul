import { redirect } from "next/navigation";
import { User, Shield, Sprout, Home } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCachedUser, redirectIfPlatformAdmin } from "@/lib/supabase/admin";
import { PageBanner } from "@/components/ui/page-banner";
import { IconStatCard } from "@/components/ui/icon-stat-card";

export default async function DashboardPage() {
  const user = await getCachedUser();

  if (!user) {
    redirect("/login");
  }

  await redirectIfPlatformAdmin();

  const supabase = await createClient();

  const { data: perfil } = await supabase
    .from("profiles")
    .select("nome_completo, papel, tenants(nome, plano)")
    .eq("id", user.id)
    .single();

  const tenant = Array.isArray(perfil?.tenants) ? perfil.tenants[0] : perfil?.tenants;
  const primeiroNome = (perfil?.nome_completo ?? user.email ?? "").split(" ")[0];

  const stats = [
    { icon: User, tone: "slate" as const, label: "Logado como", value: perfil?.nome_completo ?? user.email ?? "—" },
    { icon: Shield, tone: "primary" as const, label: "Papel", value: perfil?.papel ?? "—" },
    {
      icon: Sprout,
      tone: "blue" as const,
      label: "Fazenda",
      value: tenant?.nome ?? "—",
      hint: tenant?.plano ? `plano ${tenant.plano}` : undefined,
    },
  ];

  return (
    <div>
      <PageBanner
        icon={Home}
        title={`Olá, ${primeiroNome}`}
        description="Aqui está um resumo da sua conta no FarmSul."
        tags={["Fazenda", "Equipe"]}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map(({ icon, tone, label, value, hint }) => (
          <IconStatCard key={label} icon={icon} tone={tone} label={label} value={value} hint={hint} />
        ))}
      </div>
    </div>
  );
}
