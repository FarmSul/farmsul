import { redirect } from "next/navigation";
import { getCachedUser, getPerfilAtual, isPlatformAdmin } from "@/lib/supabase/admin";
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

  const [perfil, admin] = await Promise.all([getPerfilAtual(), isPlatformAdmin()]);

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
