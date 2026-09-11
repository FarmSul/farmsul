export function ChuvaBarChart({ dados }: { dados: { data: string; mm: number }[] }) {
  const max = Math.max(...dados.map((d) => d.mm), 1);

  return (
    <div className="flex h-36 items-end gap-1.5">
      {dados.map((d) => {
        const alturaPct = (d.mm / max) * 100;
        return (
          <div key={d.data} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5" title={`${d.mm.toFixed(1)} mm`}>
            <span className="text-[10px] text-muted-foreground">{d.mm > 0 ? d.mm.toFixed(0) : ""}</span>
            <div className="flex w-full flex-1 items-end">
              <div
                className="w-full rounded-t bg-blue-500/80"
                style={{ height: `${d.mm > 0 ? Math.max(alturaPct, 4) : 0}%` }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground">
              {new Date(`${d.data}T00:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
            </span>
          </div>
        );
      })}
    </div>
  );
}
