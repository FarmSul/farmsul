import "server-only";

export type GeocodeResult = { lat: string; lon: string; display_name: string };

/** Retorna `null` se a consulta falhou (erro de rede/API); `[]` se não achou nada. */
export async function geocodeNominatim(q: string): Promise<GeocodeResult[] | null> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=br&q=${encodeURIComponent(q)}`,
    {
      headers: {
        // Política de uso do Nominatim exige um User-Agent identificando a aplicação.
        "User-Agent": "FarmSul/1.0 (app de gestão de fazendas)",
      },
    },
  );

  if (!res.ok) return null;

  return res.json();
}
