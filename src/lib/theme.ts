import { useSyncExternalStore } from "react";

export type Tema = "light" | "dark" | "system";

const THEME_KEY = "farmsul-theme";
const THEME_EVENT = "farmsul-theme-change";

export function getTema(): Tema {
  try {
    const v = localStorage.getItem(THEME_KEY);
    if (v === "light" || v === "dark") return v;
  } catch {
    // localStorage indisponível (modo privado, etc.) — cai no padrão do sistema.
  }
  return "system";
}

export function setTema(tema: Tema) {
  try {
    if (tema === "system") {
      localStorage.removeItem(THEME_KEY);
      document.documentElement.removeAttribute("data-theme");
    } else {
      localStorage.setItem(THEME_KEY, tema);
      document.documentElement.setAttribute("data-theme", tema);
    }
  } catch {
    // Sem localStorage não dá pra persistir, mas ainda aplicamos na sessão atual.
    if (tema === "system") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", tema);
    }
  }
  window.dispatchEvent(new Event(THEME_EVENT));
}

function subscribeTema(callback: () => void) {
  window.addEventListener(THEME_EVENT, callback);
  return () => window.removeEventListener(THEME_EVENT, callback);
}

function getTemaServerSnapshot(): Tema {
  return "system";
}

export function useTema(): Tema {
  return useSyncExternalStore(subscribeTema, getTema, getTemaServerSnapshot);
}

function subscribeSistemaEscuro(callback: () => void) {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getSistemaEscuroSnapshot(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function getSistemaEscuroServerSnapshot(): boolean {
  return false;
}

/** Tema realmente aplicado na tela agora ("system" já resolvido em light/dark). */
export function useTemaEfetivo(): "light" | "dark" {
  const tema = useTema();
  const sistemaEscuro = useSyncExternalStore(subscribeSistemaEscuro, getSistemaEscuroSnapshot, getSistemaEscuroServerSnapshot);
  if (tema === "system") return sistemaEscuro ? "dark" : "light";
  return tema;
}
