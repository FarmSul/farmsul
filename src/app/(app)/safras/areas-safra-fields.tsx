"use client";

import { useState } from "react";

type Talhao = { id: string; nome: string; area_ha: number; propriedade_nome: string | null };

function formatHa(valor: number) {
  return valor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function AreasSafraFields({
  talhoes,
  defaultSelecionados,
}: {
  talhoes: Talhao[];
  defaultSelecionados?: Record<string, number>;
}) {
  const [selecionados, setSelecionados] = useState<Record<string, number>>(defaultSelecionados ?? {});

  function alternar(talhao: Talhao, marcado: boolean) {
    setSelecionados((atual) => {
      const novo = { ...atual };
      if (marcado) {
        novo[talhao.id] = talhao.area_ha;
      } else {
        delete novo[talhao.id];
      }
      return novo;
    });
  }

  function alterarArea(id: string, valor: number) {
    setSelecionados((atual) => ({ ...atual, [id]: valor }));
  }

  const totalHa = Object.values(selecionados).reduce((soma, v) => soma + (Number.isFinite(v) ? v : 0), 0);

  return (
    <div>
      <p className="mb-1.5 block text-sm font-medium text-foreground">Áreas da safra</p>
      <p className="mb-2 text-xs text-muted-foreground">Área total de produção: {formatHa(totalHa)} ha</p>

      {talhoes.length ? (
        <div className="flex max-h-56 flex-col gap-1 overflow-y-auto rounded-lg border border-border p-2">
          {talhoes.map((talhao) => {
            const marcado = talhao.id in selecionados;
            return (
              <div key={talhao.id} className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-surface-hover">
                <input
                  type="checkbox"
                  checked={marcado}
                  onChange={(e) => alternar(talhao, e.target.checked)}
                  className="h-4 w-4 shrink-0 rounded border-border"
                />
                <span className="min-w-0 flex-1 text-sm text-foreground">
                  {talhao.nome}
                  <span className="ml-1 text-xs text-muted-foreground">
                    {talhao.propriedade_nome ? `${talhao.propriedade_nome} · ` : ""}
                    {talhao.area_ha} ha disponíveis
                  </span>
                </span>
                {marcado && (
                  <>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      max={talhao.area_ha}
                      value={selecionados[talhao.id]}
                      onChange={(e) => alterarArea(talhao.id, Number(e.target.value))}
                      className="w-24 shrink-0 rounded-md border border-border bg-surface px-2 py-1 text-right text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
                    />
                    <input type="hidden" name="talhao_ids" value={talhao.id} />
                    <input type="hidden" name={`area_${talhao.id}`} value={selecionados[talhao.id]} />
                  </>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Nenhuma área cadastrada ainda.</p>
      )}
    </div>
  );
}
