"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { useEffect, useRef, useState } from "react";
import { Building2, CreditCard, MapPin, LandPlot, Users } from "lucide-react";
import { UFS } from "@/lib/ufs";
import type { PLANOS } from "@/lib/planos";
import { Card, CardHeader } from "@/components/ui/card";
import { IconStatCard } from "@/components/ui/icon-stat-card";
import { FieldGroup, Input, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Tenant = {
  id: string;
  nome: string;
  plano: string | null;
  cnpj_cpf: string | null;
  responsavel: string | null;
  uf: string | null;
  cidade: string | null;
  cep: string | null;
  criado_em: string;
};

function formatDataLonga(data: string) {
  return new Date(data).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

const TABS = [
  { value: "empresa", label: "Empresa", icon: Building2 },
  { value: "plano", label: "Plano", icon: CreditCard },
];

function AnimatedTabsList({ value }: { value: string }) {
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicator, setIndicator] = useState<{ left: number; width: number }>({ left: 0, width: 0 });

  useEffect(() => {
    const el = triggerRefs.current[value];
    if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
  }, [value]);

  return (
    <Tabs.List className="relative mb-6 flex gap-6 border-b border-border/50">
      {TABS.map(({ value: tabValue, label, icon: Icon }) => (
        <Tabs.Trigger
          key={tabValue}
          ref={(el) => {
            triggerRefs.current[tabValue] = el;
          }}
          value={tabValue}
          className="flex items-center gap-1.5 px-0.5 pb-3 text-sm font-medium text-muted-foreground transition-colors data-[state=active]:text-primary"
        >
          <Icon className="h-4 w-4" />
          {label}
        </Tabs.Trigger>
      ))}
      <span
        className="absolute bottom-0 h-px bg-primary transition-[left,width] duration-[220ms]"
        style={{ left: indicator.left, width: indicator.width, transitionTimingFunction: "var(--ease-out-3)" }}
      />
    </Tabs.List>
  );
}

export function ConfiguracoesDetail({
  tenant,
  podeEditar,
  planoInfo,
  uso,
  atualizarEmpresaAction,
}: {
  tenant: Tenant | null;
  podeEditar: boolean;
  planoInfo?: (typeof PLANOS)[keyof typeof PLANOS];
  uso: { propriedades: number; talhoes: number; usuarios: number };
  atualizarEmpresaAction: (formData: FormData) => void;
}) {
  const [tabValue, setTabValue] = useState("empresa");

  return (
    <Tabs.Root value={tabValue} onValueChange={setTabValue}>
      <AnimatedTabsList value={tabValue} />

      <Tabs.Content value="empresa">
        <Card>
          <CardHeader
            title="Dados da empresa"
            description={
              podeEditar
                ? "Só proprietário ou gerente podem editar."
                : "Apenas visualização — só proprietário ou gerente podem editar esses dados."
            }
          />

          <form action={atualizarEmpresaAction} className="flex flex-col gap-4 p-6">
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
      </Tabs.Content>

      <Tabs.Content value="plano">
        <div className="flex flex-col gap-6">
          <Card className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Plano atual</p>
                <p className="mt-1 text-lg font-semibold text-foreground">{planoInfo?.label ?? "—"}</p>
                {planoInfo && (
                  <p className="text-sm text-muted-foreground">
                    {planoInfo.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}/mês
                  </p>
                )}
              </div>
              {planoInfo && <Badge tone={planoInfo.tone}>{planoInfo.label}</Badge>}
            </div>

            {planoInfo && <p className="mt-4 text-sm text-muted-foreground">{planoInfo.descricao}</p>}

            {tenant && (
              <p className="mt-4 border-t border-border pt-4 text-xs text-muted-foreground">
                Cliente desde {formatDataLonga(tenant.criado_em)}
              </p>
            )}
          </Card>

          <Card className="p-5">
            <h3 className="mb-4 text-sm font-semibold text-foreground">Uso atual</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <IconStatCard icon={MapPin} tone="slate" label="Propriedades" value={String(uso.propriedades)} />
              <IconStatCard icon={LandPlot} tone="primary" label="Talhões" value={String(uso.talhoes)} />
              <IconStatCard icon={Users} tone="amber" label="Usuários" value={String(uso.usuarios)} />
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Limites por plano ainda não se aplicam à sua conta — esses números são só um retrato do que você já
              tem cadastrado.
            </p>
          </Card>
        </div>
      </Tabs.Content>
    </Tabs.Root>
  );
}
