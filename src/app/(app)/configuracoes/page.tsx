import { redirect } from "next/navigation";
import { Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCachedUser, redirectIfPlatformAdmin } from "@/lib/supabase/admin";
import { PLANOS, type PlanoId } from "@/lib/planos";
import { UFS } from "@/lib/ufs";
import { atualizarEmpresa } from "./actions";
import { PageBanner } from "@/components/ui/page-banner";
import { Card, CardHeader } from "@/components/ui/card";
import { FieldGroup, Input, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function ConfiguracoesPage() {
  const user = await getCachedUser();
  if (!user) {
    redirect("/login");
  }

  await redirectIfPlatformAdmin();

  const supabase = await createClient();
  const { data: perfil } = await supabase
    .from("profiles")
    .select("papel, tenants(id, nome, plano, cnpj_cpf, responsavel, uf, cidade, cep)")
    .eq("id", user.id)
    .single();

  const tenant = Array.isArray(perfil?.tenants) ? perfil.tenants[0] : perfil?.tenants;
  const podeEditar = perfil?.papel === "proprietario" || perfil?.papel === "gerente";
  const info = tenant?.plano ? PLANOS[tenant.plano as PlanoId] : undefined;

  return (
    <div>
      <PageBanner
        icon={Settings}
        title="Configurações"
        description="Dados cadastrais da sua empresa."
        tags={["Empresa", "Endereço"]}
      />

      <Card className="mb-6 flex items-center justify-between px-6 py-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Plano atual</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{info?.label ?? "—"}</p>
        </div>
        {info && <Badge tone={info.tone}>{info.label}</Badge>}
      </Card>

      <Card>
        <CardHeader
          title="Dados da empresa"
          description={
            podeEditar
              ? "Só proprietário ou gerente podem editar."
              : "Apenas visualização — só proprietário ou gerente podem editar esses dados."
          }
        />

        <form action={atualizarEmpresa} className="flex flex-col gap-4 p-6">
          <FieldGroup label="Nome da propriedade" htmlFor="nome">
            <Input id="nome" name="nome" defaultValue={tenant?.nome ?? ""} disabled={!podeEditar} required />
          </FieldGroup>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FieldGroup label="CNPJ ou CPF" htmlFor="cnpj_cpf">
              <Input
                id="cnpj_cpf"
                name="cnpj_cpf"
                defaultValue={tenant?.cnpj_cpf ?? ""}
                placeholder="00.000.000/0000-00"
                disabled={!podeEditar}
              />
            </FieldGroup>
            <FieldGroup label="Responsável" htmlFor="responsavel">
              <Input
                id="responsavel"
                name="responsavel"
                defaultValue={tenant?.responsavel ?? ""}
                placeholder="Nome do responsável"
                disabled={!podeEditar}
              />
            </FieldGroup>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FieldGroup label="UF" htmlFor="uf">
              <Select id="uf" name="uf" defaultValue={tenant?.uf ?? ""} disabled={!podeEditar}>
                <option value="">—</option>
                {UFS.map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </Select>
            </FieldGroup>
            <FieldGroup label="Cidade" htmlFor="cidade">
              <Input
                id="cidade"
                name="cidade"
                defaultValue={tenant?.cidade ?? ""}
                placeholder="Dourados"
                disabled={!podeEditar}
              />
            </FieldGroup>
            <FieldGroup label="CEP" htmlFor="cep">
              <Input
                id="cep"
                name="cep"
                defaultValue={tenant?.cep ?? ""}
                placeholder="79800-000"
                disabled={!podeEditar}
              />
            </FieldGroup>
          </div>

          {podeEditar && (
            <div className="flex justify-end">
              <Button type="submit">Salvar alterações</Button>
            </div>
          )}
        </form>
      </Card>
    </div>
  );
}
