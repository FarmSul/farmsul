export const PLANOS = {
  essencial: {
    label: "Essencial",
    preco: 149,
    tone: "blue",
    descricao: "Ideal pra quem está começando a organizar a fazenda em um só lugar.",
  },
  avancado: {
    label: "Avançado",
    preco: 349,
    tone: "primary",
    descricao: "Pra quem já opera com várias safras e talhões e quer uma visão de custo mais fina.",
  },
  consultoria: {
    label: "Consultoria",
    preco: 799,
    tone: "amber",
    descricao: "Pra operações maiores que querem acompanhamento e suporte mais próximos.",
  },
} as const;

export type PlanoId = keyof typeof PLANOS;

export const PLANO_IDS = Object.keys(PLANOS) as PlanoId[];
