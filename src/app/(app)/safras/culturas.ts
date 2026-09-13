// Módulo sem "use client" de propósito: CULTURAS precisa ser importável tanto
// por Server Components (ex: dashboard) quanto por Client Components (ex:
// formulário de safra). Se ficasse dentro de um arquivo "use client", a
// importação a partir de um Server Component quebra em runtime — o export
// vira uma referência de cliente, não o array em si.
export const CULTURAS = [
  { value: "soja", label: "Soja" },
  { value: "milho", label: "Milho" },
  { value: "sorgo", label: "Sorgo" },
  { value: "milheto", label: "Milheto" },
  { value: "trigo", label: "Trigo" },
  { value: "feijao", label: "Feijão" },
  { value: "arroz", label: "Arroz" },
  { value: "algodao", label: "Algodão" },
  { value: "outra", label: "Outra" },
] as const;
