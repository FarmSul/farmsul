import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ProfileModal } from "@/components/profile-modal";

const PAPEL_LABELS: Record<string, string> = {
  proprietario: "Proprietário",
  gerente: "Gerente",
  operador: "Operador",
  consultor: "Consultor",
};

type Usuario = {
  id: string;
  nome_completo: string | null;
  papel: string;
  telefone: string | null;
  avatar_url: string | null;
};

function LinhaUsuario({ usuario, email, clicavel }: { usuario: Usuario; email: string | null; clicavel: boolean }) {
  return (
    <tr
      className={`border-b border-border last:border-0 hover:bg-surface-hover ${clicavel ? "cursor-pointer" : ""}`}
    >
      <td className="px-6 py-3.5">
        <div className="flex items-center gap-3">
          <Avatar name={usuario.nome_completo ?? "?"} src={usuario.avatar_url} size="sm" />
          <span className="font-medium text-foreground">{usuario.nome_completo ?? "—"}</span>
        </div>
      </td>
      <td className="px-6 py-3.5 text-muted-foreground">{email ?? "—"}</td>
      <td className="px-6 py-3.5 text-muted-foreground">{usuario.telefone ?? "—"}</td>
      <td className="px-6 py-3.5 text-muted-foreground">—</td>
      <td className="px-6 py-3.5">
        <Badge tone="neutral">{PAPEL_LABELS[usuario.papel] ?? usuario.papel}</Badge>
      </td>
      <td className="px-6 py-3.5"></td>
    </tr>
  );
}

export function UsuarioSistemaRow({
  usuario,
  isSelf,
  email,
}: {
  usuario: Usuario;
  isSelf: boolean;
  email: string | null;
}) {
  if (!isSelf) {
    return <LinhaUsuario usuario={usuario} email={email} clicavel={false} />;
  }

  return (
    <ProfileModal
      nome={usuario.nome_completo ?? ""}
      email={email ?? ""}
      telefone={usuario.telefone}
      avatarUrl={usuario.avatar_url}
      trigger={<LinhaUsuario usuario={usuario} email={email} clicavel />}
    />
  );
}
