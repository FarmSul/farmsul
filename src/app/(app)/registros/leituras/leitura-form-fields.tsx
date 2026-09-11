"use client";

import { FieldGroup, Input, Select } from "@/components/ui/field";

export type Estacao = { id: string; nome: string };

export function LeituraFormFields({
  idPrefix = "",
  estacoes,
  defaultEstacaoId = "",
  defaultData = "",
  defaultPrecipitacao = "",
  defaultTemperatura = "",
  defaultUmidade = "",
  defaultPressao = "",
}: {
  idPrefix?: string;
  estacoes: Estacao[];
  defaultEstacaoId?: string;
  defaultData?: string;
  defaultPrecipitacao?: string | number;
  defaultTemperatura?: string | number;
  defaultUmidade?: string | number;
  defaultPressao?: string | number;
}) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <FieldGroup label="Estação" htmlFor={`${idPrefix}estacao-leitura`}>
          <Select id={`${idPrefix}estacao-leitura`} name="estacao_id" required defaultValue={defaultEstacaoId}>
            {estacoes.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nome}
              </option>
            ))}
          </Select>
        </FieldGroup>
        <FieldGroup label="Data" htmlFor={`${idPrefix}data-leitura`}>
          <Input
            id={`${idPrefix}data-leitura`}
            name="data"
            type="date"
            required
            defaultValue={defaultData || new Date().toISOString().slice(0, 10)}
          />
        </FieldGroup>
      </div>

      <FieldGroup label="Precipitação (mm)" htmlFor={`${idPrefix}precipitacao-leitura`}>
        <Input
          id={`${idPrefix}precipitacao-leitura`}
          name="precipitacao_mm"
          type="number"
          step="0.1"
          min="0"
          placeholder="0,0"
          defaultValue={defaultPrecipitacao}
        />
      </FieldGroup>

      <div className="grid grid-cols-3 gap-4">
        <FieldGroup label="Temperatura (°C)" htmlFor={`${idPrefix}temperatura-leitura`}>
          <Input
            id={`${idPrefix}temperatura-leitura`}
            name="temperatura_c"
            type="number"
            step="0.1"
            placeholder="0,0"
            defaultValue={defaultTemperatura}
          />
        </FieldGroup>
        <FieldGroup label="Umidade (%)" htmlFor={`${idPrefix}umidade-leitura`}>
          <Input
            id={`${idPrefix}umidade-leitura`}
            name="umidade_pct"
            type="number"
            step="0.1"
            min="0"
            max="100"
            placeholder="0,0"
            defaultValue={defaultUmidade}
          />
        </FieldGroup>
        <FieldGroup label="Pressão (hPa)" htmlFor={`${idPrefix}pressao-leitura`}>
          <Input
            id={`${idPrefix}pressao-leitura`}
            name="pressao_hpa"
            type="number"
            step="0.1"
            placeholder="0,0"
            defaultValue={defaultPressao}
          />
        </FieldGroup>
      </div>
    </>
  );
}
