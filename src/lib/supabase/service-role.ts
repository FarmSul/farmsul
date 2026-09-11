import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente com a service_role key — ignora RLS por completo.
 * NUNCA importar isso em um Client Component. Uso exclusivo em Server
 * Actions/rotas, sempre atrás de requirePlatformAdmin().
 */
export function createServiceRoleClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY não configurada em .env.local — necessária para criar/excluir usuários.",
    );
  }

  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
