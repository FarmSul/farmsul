import { CloudRain, Droplets, CalendarClock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirectIfPlatformAdmin } from "@/lib/supabase/admin";
import { geocodificarPropriedade } from "./actions";
import { buscarPrevisao, type PrevisaoDia } from "@/lib/forecast";
import { IconStatCard } from "@/components/ui/icon-stat-card";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ChuvaBarChart } from "./chuva-bar-chart";
import { PrevisaoCard } from "./previsao-card";

export default async function RegistrosVisaoGeralPage() {
  const supabase = await createClient();
  await redirectIfPlatformAdmin();

  const [{ data: propriedades }, { data: registros }] = await Promise.all([
    supabase.from("propriedades").select("id, nome, municipio, estado, latitude, longitude"),
    supabase.from("registros_climaticos").select("data, precipitacao_mm").order("data", { ascending: false }),
  ]);

  const todasLeituras = registros ?? [];

  const hoje = new Date();
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const totalMes = todasLeituras
    .filter((r) => new Date(`${r.data}T00:00:00`) >= inicioMes)
    .reduce((soma, r) => soma + (r.precipitacao_mm ?? 0), 0);

  const seteDiasAtras = new Date(hoje);
  seteDiasAtras.setDate(hoje.getDate() - 6);
  const total7dias = todasLeituras
    .filter((r) => new Date(`${r.data}T00:00:00`) >= seteDiasAtras)
    .reduce((soma, r) => soma + (r.precipitacao_mm ?? 0), 0);

  const ultimaLeitura = todasLeituras[0]?.data ?? null;

  const mapaPorDia = new Map<string, number>();
  todasLeituras.forEach((r) => {
    mapaPorDia.set(r.data, (mapaPorDia.get(r.data) ?? 0) + (r.precipitacao_mm ?? 0));
  });
  const dadosGrafico: { data: string; mm: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(hoje);
    d.setDate(hoje.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    dadosGrafico.push({ data: iso, mm: mapaPorDia.get(iso) ?? 0 });
  }

  const previsoes: { propriedadeNome: string; dias: PrevisaoDia[] }[] = [];
  for (const p of propriedades ?? []) {
    let lat = p.latitude;
    let lon = p.longitude;

    if (lat == null || lon == null) {
      const coords = await geocodificarPropriedade(p.id, p.municipio, p.estado);
      if (coords) {
        lat = coords.latitude;
        lon = coords.longitude;
      }
    }

    if (lat != null && lon != null) {
      const dias = await buscarPrevisao(lat, lon);
      if (dias) {
        previsoes.push({ propriedadeNome: p.nome, dias });
      }
    }
  }

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <IconStatCard icon={Droplets} tone="blue" label="Chuva no mês" value={`${totalMes.toFixed(1)} mm`} />
        <IconStatCard icon={CloudRain} tone="primary" label="Últimos 7 dias" value={`${total7dias.toFixed(1)} mm`} />
        <IconStatCard
          icon={CalendarClock}
          tone="slate"
          label="Última leitura"
          value={ultimaLeitura ? new Date(`${ultimaLeitura}T00:00:00`).toLocaleDateString("pt-BR") : "—"}
        />
      </div>

      <Card className="mb-6 p-5">
        <h2 className="mb-4 text-sm font-semibold text-foreground">Chuva nos últimos 14 dias</h2>
        {todasLeituras.length ? (
          <ChuvaBarChart dados={dadosGrafico} />
        ) : (
          <EmptyState
            icon={Droplets}
            title="Nenhuma leitura registrada"
            description="Registre a primeira leitura na aba Leituras."
          />
        )}
      </Card>

      <Card className="p-5">
        <h2 className="mb-4 text-sm font-semibold text-foreground">Previsão do tempo</h2>
        {previsoes.length ? (
          <div className="flex flex-col gap-3">
            {previsoes.map((p) => (
              <PrevisaoCard key={p.propriedadeNome} propriedadeNome={p.propriedadeNome} previsao={p.dias} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={CloudRain}
            title="Previsão indisponível"
            description="Cadastre uma propriedade com município/estado pra ver a previsão aqui."
          />
        )}
      </Card>
    </div>
  );
}
