"use client";

import { useState } from "react";
import { FieldGroup, Input, Select } from "@/components/ui/field";
import { AreasSafraFields } from "./areas-safra-fields";
import { CULTURAS } from "./culturas";

export { CULTURAS };

const TIPOS_CUSTO = [
  {
    value: "automatico",
    label: "Automático",
    descricao: "Custos vêm de lançamentos no Financeiro, movimentações de insumos e manutenções de patrimônio.",
  },
  {
    value: "manual",
    label: "Manual",
    descricao: "Os custos são registrados manualmente dentro da safra.",
  },
] as const;

function anoCurto(dataISO: string) {
  return dataISO.slice(2, 4);
}

function nomeSugerido(cultura: string, inicio: string, fim: string) {
  const label = CULTURAS.find((c) => c.value === cultura)?.label ?? "";
  if (!label || !inicio) return "";
  const yy1 = anoCurto(inicio);
  const yy2 = fim ? anoCurto(fim) : null;
  return yy2 && yy2 !== yy1 ? `${label} ${yy1}/${yy2}` : `${label} ${yy1}`;
}

export type Talhao = { id: string; nome: string; area_ha: number; propriedade_nome: string | null };

export function SafraFormFields({
  idPrefix = "",
  talhoes,
  defaultCultura = "soja",
  defaultDataInicio = "",
  defaultDataFim = "",
  defaultNome = "",
  defaultTipoCusto = "automatico",
  defaultSelecionados,
}: {
  idPrefix?: string;
  talhoes: Talhao[];
  defaultCultura?: string;
  defaultDataInicio?: string;
  defaultDataFim?: string;
  defaultNome?: string;
  defaultTipoCusto?: string;
  defaultSelecionados?: Record<string, number>;
}) {
  const [cultura, setCultura] = useState(defaultCultura);
  const [dataInicio, setDataInicio] = useState(defaultDataInicio);
  const [dataFim, setDataFim] = useState(defaultDataFim);
  const [nome, setNome] = useState(defaultNome);
  const [nomeManual, setNomeManual] = useState(!!defaultNome);

  function atualizarSugestao(novaCultura: string, novoInicio: string, novoFim: string) {
    if (nomeManual) return;
    setNome(nomeSugerido(novaCultura, novoInicio, novoFim));
  }

  return (
    <>
      <FieldGroup label="Cultura" htmlFor={`${idPrefix}cultura-safra`}>
        <Select
          id={`${idPrefix}cultura-safra`}
          name="cultura"
          required
          value={cultura}
          onChange={(e) => {
            setCultura(e.target.value);
            atualizarSugestao(e.target.value, dataInicio, dataFim);
          }}
        >
          {CULTURAS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </Select>
      </FieldGroup>
      <FieldGroup label="Início" htmlFor={`${idPrefix}inicio-safra`}>
        <Input
          id={`${idPrefix}inicio-safra`}
          name="data_inicio"
          type="date"
          required
          value={dataInicio}
          onChange={(e) => {
            setDataInicio(e.target.value);
            atualizarSugestao(cultura, e.target.value, dataFim);
          }}
        />
      </FieldGroup>
      <FieldGroup label="Fim (opcional)" htmlFor={`${idPrefix}fim-safra`}>
        <Input
          id={`${idPrefix}fim-safra`}
          name="data_fim"
          type="date"
          value={dataFim}
          onChange={(e) => {
            setDataFim(e.target.value);
            atualizarSugestao(cultura, dataInicio, e.target.value);
          }}
        />
      </FieldGroup>
      <FieldGroup label="Nome" htmlFor={`${idPrefix}nome-safra`}>
        <Input
          id={`${idPrefix}nome-safra`}
          name="nome"
          placeholder="Soja 25/26"
          required
          value={nome}
          onChange={(e) => {
            setNome(e.target.value);
            setNomeManual(true);
          }}
        />
      </FieldGroup>

      <AreasSafraFields talhoes={talhoes} defaultSelecionados={defaultSelecionados} />

      <div>
        <p className="mb-1.5 block text-sm font-medium text-foreground">Tipo de custo</p>
        <div className="flex flex-col gap-2">
          {TIPOS_CUSTO.map((tipo) => (
            <label
              key={tipo.value}
              className="flex cursor-pointer items-start gap-2 rounded-lg border border-border p-3 has-[:checked]:border-primary has-[:checked]:bg-primary-soft"
            >
              <input
                type="radio"
                name="tipo_custo"
                value={tipo.value}
                defaultChecked={tipo.value === defaultTipoCusto}
                className="mt-0.5 h-4 w-4 border-border"
              />
              <span>
                <span className="block text-sm font-medium text-foreground">{tipo.label}</span>
                <span className="block text-xs text-muted-foreground">{tipo.descricao}</span>
              </span>
            </label>
          ))}
        </div>
      </div>
    </>
  );
}
