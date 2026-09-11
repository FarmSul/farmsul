import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "./server";

/**
 * getUser() faz uma chamada de rede pra validar o token. Sem cache, o
 * middleware + layout + cada página acabavam chamando isso várias vezes na
 * mesma navegação. `cache()` do React garante 1 chamada só por request.
 *
 * (Já tentamos repassar isso via header setado no middleware pra economizar
 * até essa 1 chamada — deu problema real: Server Actions ocasionalmente não
 * enxergavam o header e caíam num fallback que também falhava, gerando
 * "Usuário não autenticado" em ações válidas. Voltamos pro jeito simples e
 * comprovadamente confiável.)
 */
export const getCachedUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export const isPlatformAdmin = cache(async (): Promise<boolean> => {
  const user = await getCachedUser();
  if (!user) return false;

  const supabase = await createClient();
  const { data } = await supabase.from("admins").select("id").eq("id", user.id).maybeSingle();

  return !!data;
});

/** Usado nas páginas /admin/*: bloqueia quem não é da equipe FarmSul. */
export async function requirePlatformAdmin() {
  if (!(await isPlatformAdmin())) {
    redirect("/dashboard");
  }
}

/** Usado nas páginas de tenant (dashboard, propriedades...): admin FarmSul não opera fazenda por ali. */
export async function redirectIfPlatformAdmin() {
  if (await isPlatformAdmin()) {
    redirect("/admin");
  }
}
