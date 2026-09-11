"use client";

import { useEffect, useState } from "react";
import { FieldGroup, Select } from "@/components/ui/field";
import { UFS } from "@/lib/ufs";

export function EnderecoFields({
  idPrefix,
  defaultUf = "MS",
  defaultMunicipio = "",
}: {
  idPrefix: string;
  defaultUf?: string;
  defaultMunicipio?: string;
}) {
  const [estado, setEstado] = useState(defaultUf);
  const [municipio, setMunicipio] = useState(defaultMunicipio);
  const [municipios, setMunicipios] = useState<string[]>([]);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (!estado) {
      setMunicipios([]);
      return;
    }

    let cancelado = false;
    setCarregando(true);

    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estado}/municipios`)
      .then((r) => r.json())
      .then((dados: { nome: string }[]) => {
        if (!cancelado) setMunicipios(dados.map((d) => d.nome));
      })
      .catch(() => {
        if (!cancelado) setMunicipios([]);
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [estado]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <FieldGroup label="UF" htmlFor={`${idPrefix}-estado`}>
        <Select
          id={`${idPrefix}-estado`}
          name="estado"
          value={estado}
          onChange={(e) => {
            setEstado(e.target.value);
            setMunicipio("");
          }}
        >
          <option value="">Selecione o estado</option>
          {UFS.map((uf) => (
            <option key={uf} value={uf}>
              {uf}
            </option>
          ))}
        </Select>
      </FieldGroup>

      <FieldGroup label="Município" htmlFor={`${idPrefix}-municipio`}>
        <Select
          id={`${idPrefix}-municipio`}
          name="municipio"
          value={municipio}
          onChange={(e) => setMunicipio(e.target.value)}
          disabled={!estado || carregando}
        >
          <option value="">
            {carregando ? "Carregando..." : estado ? "Selecione o município" : "Selecione o estado primeiro"}
          </option>
          {municipios.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </Select>
      </FieldGroup>
    </div>
  );
}
