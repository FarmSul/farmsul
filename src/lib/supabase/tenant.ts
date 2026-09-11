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
