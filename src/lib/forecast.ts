import "server-only";

export type PrevisaoDia = {
  data: string;
  precipitacaoMm: number;
  tempMax: number;
  tempMin: number;
};

/** Previsão de 7 dias via Open-Meteo — API pública, gratuita, sem necessidade de chave. */
export async function buscarPrevisao(latitude: number, longitude: number): Promise<PrevisaoDia[] | null> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=precipitation_sum,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=7`;

  const res = await fetch(url, { next: { revalidate: 1800 } });
  if (!res.ok) return null;

  const json = await res.json();
  const dias: string[] = json.daily?.time ?? [];

  return dias.map((data, i) => ({
    data,
    precipitacaoMm: json.daily.precipitation_sum[i],
    tempMax: json.daily.temperature_2m_max[i],
    tempMin: json.daily.temperature_2m_min[i],
  }));
}
