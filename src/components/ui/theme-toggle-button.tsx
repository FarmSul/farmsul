"use client";

import { Sun, Moon } from "lucide-react";
import { useTemaEfetivo, setTema } from "@/lib/theme";

export function ThemeToggleButton({ className = "" }: { className?: string }) {
  const temaEfetivo = useTemaEfetivo();
  const escuro = temaEfetivo === "dark";

  return (
    <button
      type="button"
      onClick={() => setTema(escuro ? "light" : "dark")}
      title={escuro ? "Mudar para tema claro" : "Mudar para tema escuro"}
      className={`z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25 ${className}`}
    >
      {escuro ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
