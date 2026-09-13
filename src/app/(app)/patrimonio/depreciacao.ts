// Depreciação linear por horas de uso: o valor de aquisição se distribui
// igualmente ao longo da vida útil em horas, e o horímetro atual diz quanto
// dessa vida já foi consumido. Não considera valor residual (deprecia até
// zero ao fim da vida útil) — ajustar aqui se a política contábil mudar.
export type DepreciacaoResultado = {
  valorAtual: number;
  depreciacaoAcumulada: number;
  percentualDepreciado: number;
};

export function calcularDepreciacao(
  valorAquisicao: number | null,
  vidaUtilHoras: number | null,
  horimetroAtual: number | null,
): DepreciacaoResultado | null {
  if (valorAquisicao == null || vidaUtilHoras == null || vidaUtilHoras <= 0) {
    return null;
  }

  const horasUsadas = Math.min(Math.max(horimetroAtual ?? 0, 0), vidaUtilHoras);
  const percentualDepreciado = (horasUsadas / vidaUtilHoras) * 100;
  const depreciacaoAcumulada = (valorAquisicao * horasUsadas) / vidaUtilHoras;

  return {
    valorAtual: valorAquisicao - depreciacaoAcumulada,
    depreciacaoAcumulada,
    percentualDepreciado,
  };
}
