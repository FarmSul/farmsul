"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { GRUPOS_PERMISSAO, type PermissoesPerfil } from "./permissoes";

export function PermissoesFields({ defaultPermissoes }: { defaultPermissoes?: PermissoesPerfil }) {
  const [estado, setEstado] = useState<PermissoesPerfil>(() => {
    const inicial: PermissoesPerfil = {};
    for (const grupo of GRUPOS_PERMISSAO) {
      inicial[grupo.key] = defaultPermissoes?.[grupo.key] ?? { ver: false, editar: false };
    }
    return inicial;
  });

  function setGrupo(key: string, campo: "ver" | "editar", valor: boolean) {
    setEstado((atual) => {
      const grupo = { ...atual[key] };
      if (campo === "editar") {
        grupo.editar = valor;
        if (valor) grupo.ver = true;
      } else {
        grupo.ver = valor;
        if (!valor) grupo.editar = false;
      }
      return { ...atual, [key]: grupo };
    });
  }

  return (
    <div>
      <p className="mb-1.5 block text-sm font-medium text-foreground">Acessos do perfil</p>
      <div className="flex flex-col divide-y divide-border rounded-lg border border-border">
        {GRUPOS_PERMISSAO.map((grupo) => (
          <details key={grupo.key} className="group px-3 py-2">
            <summary className="flex cursor-pointer list-none items-center justify-between text-sm text-foreground">
              {grupo.label}
              <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
            </summary>
            <div className="mt-2 flex gap-4 pl-1">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  name={`perm_${grupo.key}_ver`}
                  checked={estado[grupo.key].ver}
                  onChange={(e) => setGrupo(grupo.key, "ver", e.target.checked)}
                  className="h-4 w-4 rounded border-border"
                />
                Visualizar
              </label>
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  name={`perm_${grupo.key}_editar`}
                  checked={estado[grupo.key].editar}
                  onChange={(e) => setGrupo(grupo.key, "editar", e.target.checked)}
                  className="h-4 w-4 rounded border-border"
                />
                Editar
              </label>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
