"use client";

import Image from "next/image";
import { useState } from "react";
import { Camera, Tractor } from "lucide-react";
import { FieldGroup, Input, Select, Textarea } from "@/components/ui/field";

export function EquipamentoFormFields({
  idPrefix = "",
  defaultNome = "",
  defaultTipo = "maquina",
  defaultTipoMaquina = "trator",
  defaultImplemento = false,
  defaultModelo = "",
  defaultFabricante = "",
  defaultAnoFabricacao = "",
  defaultVidaUtilHoras = "",
  defaultHorimetroAtual = "",
  defaultObservacoes = "",
  defaultDataAquisicao = "",
  defaultValorAquisicao = "",
  defaultStatus = "ativo",
  defaultFotoUrl = null,
}: {
  idPrefix?: string;
  defaultNome?: string;
  defaultTipo?: string;
  defaultTipoMaquina?: string;
  defaultImplemento?: boolean;
  defaultModelo?: string;
  defaultFabricante?: string;
  defaultAnoFabricacao?: string | number;
  defaultVidaUtilHoras?: string | number;
  defaultHorimetroAtual?: string | number;
  defaultObservacoes?: string;
  defaultDataAquisicao?: string;
  defaultValorAquisicao?: string | number;
  defaultStatus?: string;
  defaultFotoUrl?: string | null;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [tipo, setTipo] = useState(defaultTipo);
  const ehMaquina = tipo === "maquina";

  return (
    <>
      <div className="flex flex-col items-center gap-2 py-2">
        <div className="relative aspect-video w-[90%]">
          <span className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-surface-hover">
            {preview ?? defaultFotoUrl ? (
              <Image
                src={preview ?? (defaultFotoUrl as string)}
                alt={defaultNome || "Equipamento"}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <Tractor className="h-8 w-8 text-muted-foreground" />
            )}
          </span>
          <label
            htmlFor={`${idPrefix}foto-equipamento`}
            className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-border bg-primary text-primary-foreground hover:bg-primary-hover"
            title="Adicionar foto"
          >
            <Camera className="h-4 w-4" />
          </label>
          <input
            id={`${idPrefix}foto-equipamento`}
            name="foto"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setPreview(URL.createObjectURL(file));
            }}
          />
        </div>
        <label htmlFor={`${idPrefix}foto-equipamento`} className="cursor-pointer text-sm font-medium text-primary hover:underline">
          {defaultFotoUrl ? "Trocar foto" : "Adicionar foto"}
        </label>
        <p className="text-xs text-muted-foreground">PNG, JPG ou WebP · até 5MB</p>
      </div>

      <FieldGroup label="Nome" htmlFor={`${idPrefix}nome-equipamento`}>
        <Input
          id={`${idPrefix}nome-equipamento`}
          name="nome"
          placeholder="Trator John Deere 6110J"
          defaultValue={defaultNome}
          required
        />
      </FieldGroup>

      <div className="grid grid-cols-2 gap-4">
        <FieldGroup label="Tipo" htmlFor={`${idPrefix}tipo-equipamento`}>
          <Select
            id={`${idPrefix}tipo-equipamento`}
            name="tipo"
            required
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
          >
            <option value="maquina">Máquina</option>
            <option value="veiculo">Veículo</option>
            <option value="silo">Silo</option>
            <option value="pivo">Pivô</option>
            <option value="benfeitoria">Benfeitoria</option>
          </Select>
        </FieldGroup>
        <FieldGroup label="Status" htmlFor={`${idPrefix}status-equipamento`}>
          <Select id={`${idPrefix}status-equipamento`} name="status" required defaultValue={defaultStatus}>
            <option value="ativo">Ativo</option>
            <option value="manutencao">Manutenção</option>
            <option value="inativo">Inativo</option>
          </Select>
        </FieldGroup>
      </div>

      {ehMaquina && (
        <>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              name="implemento"
              value="true"
              defaultChecked={defaultImplemento}
              className="h-4 w-4 rounded border-border"
            />
            Implemento — não motorizado
          </label>

          <FieldGroup label="Tipo de máquina" htmlFor={`${idPrefix}tipo-maquina-equipamento`}>
            <Select id={`${idPrefix}tipo-maquina-equipamento`} name="tipo_maquina" required defaultValue={defaultTipoMaquina}>
              <option value="trator">Trator</option>
              <option value="colheitadeira">Colheitadeira</option>
              <option value="pulverizador">Pulverizador</option>
              <option value="semeadeira">Semeadeira</option>
              <option value="adubador">Adubador</option>
              <option value="outro">Outro</option>
            </Select>
          </FieldGroup>
        </>
      )}

      <FieldGroup label="Modelo (opcional)" htmlFor={`${idPrefix}modelo-equipamento`}>
        <Input id={`${idPrefix}modelo-equipamento`} name="modelo" placeholder="6110J" defaultValue={defaultModelo} />
      </FieldGroup>

      <div className="grid grid-cols-2 gap-4">
        <FieldGroup label="Fabricante (opcional)" htmlFor={`${idPrefix}fabricante-equipamento`}>
          <Input
            id={`${idPrefix}fabricante-equipamento`}
            name="fabricante"
            placeholder="John Deere"
            defaultValue={defaultFabricante}
          />
        </FieldGroup>
        <FieldGroup label="Ano de fabricação (opcional)" htmlFor={`${idPrefix}ano-fabricacao-equipamento`}>
          <Input
            id={`${idPrefix}ano-fabricacao-equipamento`}
            name="ano_fabricacao"
            type="number"
            step="1"
            min="1900"
            max="2100"
            placeholder="2020"
            defaultValue={defaultAnoFabricacao}
          />
        </FieldGroup>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FieldGroup label="Vida útil, h (opcional)" htmlFor={`${idPrefix}vida-util-equipamento`}>
          <Input
            id={`${idPrefix}vida-util-equipamento`}
            name="vida_util_horas"
            type="number"
            step="0.1"
            min="0"
            placeholder="0,0"
            defaultValue={defaultVidaUtilHoras}
          />
        </FieldGroup>
        <FieldGroup label="Horímetro atual, h (opcional)" htmlFor={`${idPrefix}horimetro-equipamento`}>
          <Input
            id={`${idPrefix}horimetro-equipamento`}
            name="horimetro_atual"
            type="number"
            step="0.1"
            min="0"
            placeholder="0,0"
            defaultValue={defaultHorimetroAtual}
          />
        </FieldGroup>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FieldGroup label="Data de aquisição (opcional)" htmlFor={`${idPrefix}data-aquisicao-equipamento`}>
          <Input id={`${idPrefix}data-aquisicao-equipamento`} name="data_aquisicao" type="date" defaultValue={defaultDataAquisicao} />
        </FieldGroup>
        <FieldGroup label="Valor de aquisição (opcional)" htmlFor={`${idPrefix}valor-aquisicao-equipamento`}>
          <Input
            id={`${idPrefix}valor-aquisicao-equipamento`}
            name="valor_aquisicao"
            type="number"
            step="0.01"
            min="0"
            placeholder="0,00"
            defaultValue={defaultValorAquisicao}
          />
        </FieldGroup>
      </div>

      <FieldGroup label="Observações (opcional)" htmlFor={`${idPrefix}observacoes-equipamento`}>
        <Textarea
          id={`${idPrefix}observacoes-equipamento`}
          name="observacoes"
          rows={3}
          maxLength={2000}
          placeholder="Detalhes adicionais sobre o equipamento..."
          defaultValue={defaultObservacoes}
        />
      </FieldGroup>
    </>
  );
}
