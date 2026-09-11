import { type ReactNode } from "react";

const TONES = {
  neutral: "bg-surface-hover text-muted-foreground",
  primary: "bg-primary-soft text-primary",
  blue: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  amber: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  danger: "bg-danger-soft text-danger",
} as const;

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: keyof typeof TONES }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${TONES[tone]}`}
    >
      {children}
    </span>
  );
}
