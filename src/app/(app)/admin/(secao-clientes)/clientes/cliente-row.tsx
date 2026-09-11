"use client";

import { Pencil, Trash2 } from "lucide-react";
import { FormModal } from "@/components/ui/form-modal";
import { FieldGroup, Input, Select } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { PLANOS, type PlanoId } from "@/lib/planos";
import { UFS } from "@/lib/ufs";

function formatBRL(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function ClienteRow({
  id,
  nome,
  plano,
  cnpjCpf,
  responsavel,
  uf,
  cidade,
  cep,
  usuarios,
  criadoEm,
  atualizarAction,
  excluirAction,
}: {
  id: string;
  nome: string;
  plano: string;
  cnpjCpf: string | null;
  responsavel: string | null;
  uf: string | null;
  cidade: string | null;
  cep: string | null;
  usuarios: number;
  criadoEm: string;
  atualizarAction: (formData: FormData) => void;
  excluirAction: (formData: FormData) => void;
}) {
  const info = PLANOS[plano as PlanoId];

  return (
    <tr className="border-b border-border last:border-0 hover:bg-surface-hover">
      <td className="px-6 py-3.5">
        <div className="flex items-center gap-3">
          <Avatar name={nome} />
          <span className="font-medium text-foreground">{nome}</span>
        </div>
      </td>
      <td className="px-6 py-3.5">
        <Badge tone={info?.tone ?? "neutral"}>{info?.label ?? plano}</Badge>
      </td>
      <td className="px-6 py-3.5 text-muted-foreground">{formatBRL(info?.preco ?? 0)}</td>
      <td className="px-6 py-3.5 text-muted-foreground">{usuarios}</td>
      <td className="px-6 py-3.5 text-muted-foreground">{criadoEm}</td>
      <td className="px-6 py-3.5">
        <div className="flex justify-end gap-1">
          <FormModal
            title="Editar cliente"
            action={atualizarAction}
            submitLabel="Salvar alterações"
            trigger={
              <button
                title="Editar"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
              >
                <Pencil className="h-4 w-4" />
              </button>
            }
          >
            <input type="hidden" name="id" value={id} />

            <FieldGroup label="Nome da propriedade" htmlFor={`nome-${id}`}>
              <Input id={`nome-${id}`} name="nome" defaultValue={nome} required />
            </FieldGroup>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FieldGroup label="Plano" htmlFor={`plano-${id}`}>
                <Select id={`plano-${id}`} name="plano" defaultValue={plano}>
                  <option value="essencial">Essencial</option>
                  <option value="avancado">Avançado</option>
                  <option value="consultoria">Consultoria</option>
                </Select>
              </FieldGroup>
              <FieldGroup label="CNPJ ou CPF" htmlFor={`cnpj-${id}`}>
                <Input id={`cnpj-${id}`} name="cnpj_cpf" defaultValue={cnpjCpf ?? ""} placeholder="00.000.000/0000-00" />
              </FieldGroup>
            </div>

            <FieldGroup label="Responsável" htmlFor={`responsavel-${id}`}>
              <Input id={`responsavel-${id}`} name="responsavel" defaultValue={responsavel ?? ""} placeholder="Nome do responsável" />
            </FieldGroup>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FieldGroup label="UF" htmlFor={`uf-${id}`}>
                <Select id={`uf-${id}`} name="uf" defaultValue={uf ?? ""}>
                  <option value="">—</option>
                  {UFS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </Select>
              </FieldGroup>
              <FieldGroup label="Cidade" htmlFor={`cidade-${id}`}>
                <Input id={`cidade-${id}`} name="cidade" defaultValue={cidade ?? ""} placeholder="Dourados" />
              </FieldGroup>
              <FieldGroup label="CEP" htmlFor={`cep-${id}`}>
                <Input id={`cep-${id}`} name="cep" defaultValue={cep ?? ""} placeholder="79800-000" />
              </FieldGroup>
            </div>
          </FormModal>

          <form action={excluirAction}>
            <input type="hidden" name="id" value={id} />
            <ConfirmButton
              confirmText={`Excluir o cliente "${nome}"? Isso apaga todos os dados dele (propriedades, safras, talhões, usuários...).`}
              title="Excluir"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-danger-soft hover:text-danger"
            >
              <Trash2 className="h-4 w-4" />
            </ConfirmButton>
          </form>
        </div>
      </td>
    </tr>
  );
}
