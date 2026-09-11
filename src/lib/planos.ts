export const PLANOS = {
  essencial: { label: "Essencial", preco: 149, tone: "blue" },
  avancado: { label: "Avançado", preco: 349, tone: "primary" },
  consultoria: { label: "Consultoria", preco: 799, tone: "amber" },
} as const;

export type PlanoId = keyof typeof PLANOS;

export const PLANO_IDS = Object.keys(PLANOS) as PlanoId[];
