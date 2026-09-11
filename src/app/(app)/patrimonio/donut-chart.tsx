type Segmento = { label: string; value: number; color: string };

export function DonutChart({
  segments,
  centerValue,
  centerLabel,
}: {
  segments: Segmento[];
  centerValue: string | number;
  centerLabel: string;
}) {
  const total = segments.reduce((soma, seg) => soma + seg.value, 0);
  const r = 15.9155;
  const circumference = 2 * Math.PI * r;

  let acumulado = 0;

  return (
    <div className="flex flex-wrap items-center gap-6">
      <div className="relative h-36 w-36 shrink-0">
        <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
          <circle cx="18" cy="18" r={r} fill="none" stroke="var(--border)" strokeWidth="4" />
          {total > 0 &&
            segments.map((seg, i) => {
              if (seg.value <= 0) return null;
              const pct = (seg.value / total) * 100;
              const offset = acumulado;
              acumulado += pct;
              return (
                <circle
                  key={i}
                  cx="18"
                  cy="18"
                  r={r}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth="4"
                  strokeDasharray={`${(pct / 100) * circumference} ${circumference}`}
                  strokeDashoffset={-((offset / 100) * circumference)}
                />
              );
            })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-foreground">{centerValue}</span>
          <span className="text-xs text-muted-foreground">{centerLabel}</span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2.5">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-foreground">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: seg.color }} />
              {seg.label}
            </span>
            <span className="font-semibold text-foreground">{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
