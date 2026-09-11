import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCachedUser, isPlatformAdmin } from "@/lib/supabase/admin";
import { AppShell } from "@/components/app-shell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCachedUser();

  if (!user) {
    redirect("/login");
  }

  const supabase = await createClient();
  const [{ data: perfil }, admin] = await Promise.all([
    supabase.from("profiles").select("nome_completo, papel, avatar_url, telefone").eq("id", user.id).single(),
    isPlatformAdmin(),
  ]);

  return (
    <AppShell
      nome={perfil?.nome_completo ?? user.email ?? ""}
      papel={perfil?.papel ?? ""}
      email={user.email ?? ""}
      telefone={perfil?.telefone ?? null}
      avatarUrl={perfil?.avatar_url ?? null}
      isAdmin={admin}
    >
      {children}
    </AppShell>
  );
}
