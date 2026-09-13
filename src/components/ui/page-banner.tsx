import { type LucideIcon } from "lucide-react";
import { ThemeToggleButton } from "./theme-toggle-button";

export function PageBanner({
  icon: Icon,
  title,
  description,
  tags,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  tags?: string[];
}) {
  return (
    <div className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-banner-from to-banner-to p-6 shadow-[var(--shadow-3)] sm:p-8">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 25%, white 1px, transparent 1px), radial-gradient(circle at 70% 75%, white 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <ThemeToggleButton className="absolute right-5 top-5 sm:right-7 sm:top-7" />
      <div className="relative flex items-start gap-4 pr-10">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15">
          <Icon className="h-5 w-5 text-white" strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">{title}</h1>
          <p className="mt-1 max-w-2xl text-sm text-white/80">{description}</p>
          {tags && tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
