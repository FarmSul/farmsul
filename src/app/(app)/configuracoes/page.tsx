import { redirect } from "next/navigation";
import { Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCachedUser, getPerfilAtual, redirectIfPlatformAdmin } from "@/lib/supabase/admin";
import { PLANOS, type PlanoId } from "@/lib/planos";
import { atualizarEmpresa } from "./actions";
import { PageBanner } from "@/components/ui/page-banner";
import { ConfiguracoesDetail } from "./configuracoes-detail";

export default async function ConfiguracoesPage() {
  const user = await getCachedUser();
  if (!user) {
    redirect("/login");
  }

  await redirectIfPlatformAdmin();

  const supabase = await createClient();
  const perfil = await getPerfilAtual();

  const tenant = Array.isArray(perfil?.tenants) ? perfil.tenants[0] : perfil?.tenants;
  const podeEditar = perfil?.papel === "proprietario" || perfil?.papel === "gerente";
  const info = tenant?.plano ? PLANOS[tenant.plano as PlanoId] : undefined;

  const [{ data: propriedades }, { data: talhoes }, { data: usuarios }] = tenant
    ? await Promise.all([
        supabase.from("propriedades").select("id"),
        supabase.from("talhoes").select("id"),
        supabase.from("profiles").select("id").eq("tenant_id", tenant.id),
      ])
    : [{ data: null }, { data: null }, { data: null }];

  return (
    <div>
      <PageBanner
        icon={Settings}
        title="Configurações"
        description="Dados cadastrais, plano e uso da sua empresa."
        tags={["Empresa", "Plano"]}
      />

      <ConfiguracoesDetail
        tenant={tenant ?? null}
        podeEditar={podeEditar}
        planoInfo={info}
        uso={{
          propriedades: (propriedades ?? []).length,
          talhoes: (talhoes ?? []).length,
          usuarios: (usuarios ?? []).length,
        }}
        atualizarEmpresaAction={atualizarEmpresa}
      />
    </div>
  );
}
