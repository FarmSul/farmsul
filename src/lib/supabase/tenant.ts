import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Chama getUser() direto (sem passar pelo cache baseado em header) porque
 * essa função roda dentro de Server Actions de escrita — usar o atalho ali
 * já causou "Usuário não autenticado" espúrio em produção real (o header
 * setado pelo proxy nem sempre chega nesse contexto). Custa uma chamada de
 * rede a mais por ação, mas é o caminho comprovadamente confiável.
 */
export async function getTenantId(supabase: SupabaseClient): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  const { data: perfil, error } = await supabase
    .from("profiles")
    .select("tenant_id")
    .eq("id", user.id)
    .single();

  if (error || !perfil) {
    throw new Error("Perfil do usuário não encontrado");
  }

  return perfil.tenant_id as string;
}

const PAPEIS_GESTAO = ["proprietario", "gerente"] as const;

/**
 * Igual getTenantId (mesmo motivo de usar getUser() direto), mas também
 * garante que quem está chamando é proprietário ou gerente do tenant — usado
 * em ações destrutivas sobre cadastros estruturais (propriedade, talhão,
 * safra, equipamento, insumo, colaborador, perfil, contrato, nota fiscal,
 * estação climática, lote). Registros operacionais do dia a dia (lançamento,
 * aplicação, abastecimento, manutenção, colheita) continuam abertos a
 * qualquer papel do tenant — essa função não deve ser usada neles.
 */
export async function requerGestao(supabase: SupabaseClient): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  const { data: perfil, error } = await supabase
    .from("profiles")
    .select("tenant_id, papel")
    .eq("id", user.id)
    .single();

  if (error || !perfil) {
    throw new Error("Perfil do usuário não encontrado");
  }

  if (!PAPEIS_GESTAO.includes(perfil.papel as (typeof PAPEIS_GESTAO)[number])) {
    throw new Error("Apenas proprietário ou gerente podem fazer essa ação.");
  }

  return perfil.tenant_id as string;
}
