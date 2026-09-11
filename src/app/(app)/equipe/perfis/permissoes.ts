export const GRUPOS_PERMISSAO = [
  { key: "equipe", label: "Equipe" },
  { key: "agronomico", label: "Agronômico (Safras e Registros)" },
  { key: "patrimonio", label: "Patrimônio" },
  { key: "financeiro", label: "Financeiro" },
  { key: "fiscal", label: "Fiscal" },
  { key: "contratos", label: "Contratos" },
  { key: "pecuaria", label: "Pecuária" },
  { key: "estoque", label: "Estoque (Insumos e Produção)" },
] as const;

export type GrupoPermissaoKey = (typeof GRUPOS_PERMISSAO)[number]["key"];

export type PermissoesPerfil = Record<string, { ver: boolean; editar: boolean }>;

export function permissoesDeFormData(formData: FormData): PermissoesPerfil {
  const permissoes: PermissoesPerfil = {};
  for (const grupo of GRUPOS_PERMISSAO) {
    const editar = formData.get(`perm_${grupo.key}_editar`) === "on";
    const ver = editar || formData.get(`perm_${grupo.key}_ver`) === "on";
    permissoes[grupo.key] = { ver, editar };
  }
  return permissoes;
}
