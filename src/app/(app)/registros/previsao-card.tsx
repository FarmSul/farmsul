import { CloudRain, Sun } from "lucide-react";
import type { PrevisaoDia } from "@/lib/forecast";

export function PrevisaoCard({ propriedadeNome, previsao }: { propriedadeNome: string; previsao: PrevisaoDia[] }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <p className="mb-2 text-sm font-medium text-foreground">{propriedadeNome}</p>
      <div className="flex gap-2 overflow-x-auto">
        {previsao.slice(0, 6).map((dia) => (
          <div
            key={dia.data}
            className="flex min-w-[68px] shrink-0 flex-col items-center gap-1 rounded-lg bg-surface-hover px-2 py-2.5"
          >
            <span className="text-[10px] uppercase text-muted-foreground">
              {new Date(`${dia.data}T00:00:00`).toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "")}
            </span>
            {dia.precipitacaoMm > 0 ? (
              <CloudRain className="h-4 w-4 text-blue-500" />
            ) : (
              <Sun className="h-4 w-4 text-amber-500" />
            )}
            <span className="text-xs font-semibold text-foreground">{dia.precipitacaoMm.toFixed(1)}mm</span>
            <span className="text-[10px] text-muted-foreground">
              {Math.round(dia.tempMin)}°–{Math.round(dia.tempMax)}°
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
