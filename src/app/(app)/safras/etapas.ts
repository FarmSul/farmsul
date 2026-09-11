export const ETAPAS = [
  { value: "preparo_correcao", label: "Preparação e Correção" },
  { value: "plantio", label: "Plantio" },
  { value: "controle_manejo", label: "Controle e Manejo" },
  { value: "colheita", label: "Colheita" },
  { value: "venda", label: "Venda" },
] as const;

export const ETAPA_LABELS: Record<string, string> = Object.fromEntries(ETAPAS.map((e) => [e.value, e.label]));

export type EtapaValue = (typeof ETAPAS)[number]["value"];
