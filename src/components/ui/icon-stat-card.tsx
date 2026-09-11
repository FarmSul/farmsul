import { type LucideIcon } from "lucide-react";
import { Card } from "./card";

const TONES = {
  slate: "bg-zinc-600",
  blue: "bg-blue-600",
  primary: "bg-primary",
  amber: "bg-amber-600",
  rose: "bg-rose-600",
} as const;

export function IconStatCard({
  icon: Icon,
  tone = "primary",
  label,
  value,
  hint,
}: {
  icon: LucideIcon;
  tone?: keyof typeof TONES;
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <Card className="flex items-start gap-4 p-5">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white ${TONES[tone]}`}
      >
        <Icon className="h-5 w-5" strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-1 text-xl font-semibold text-foreground">{value}</p>
        {hint && <p className="mt-0.5 truncate text-xs text-muted-foreground">{hint}</p>}
      </div>
    </Card>
  );
}
