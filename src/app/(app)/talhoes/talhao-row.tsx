"use client";

import { useState } from "react";
import { Trash2, MapPin } from "lucide-react";
import { FormModal } from "@/components/ui/form-modal";
import { FieldGroup, Input, Select } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { TalhaoMapDialog } from "./talhao-map-dialog";
import { TalhaoGeomPreview } from "./talhao-geom-preview";

type SafraTalhao = { area_ha: number; safras: { nome: string } | { nome: string }[] | null };

export function TalhaoRow({
  id,
  nome,
  areaHa,
  geom,
  propriedadeNome,
  propriedadeId,
  propriedades,
  safraTalhoes,
  atualizarAction,
  excluirAction,
}: {
  id: string;
  nome: string;
  areaHa: number;
  geom: GeoJSON.Polygon | null;
  propriedadeNome: string | undefined;
  propriedadeId: string | null;
  propriedades: { id: string; nome: string }[];
  safraTalhoes: SafraTalhao[];
  atualizarAction: (formData: FormData) => void;
  excluirAction: (formData: FormData) => void;
}) {
  const [currentGeom, setCurrentGeom] = useState<GeoJSON.Polygon | null>(geom);
  const [mapOpen, setMapOpen] = useState(false);
  const pontos = currentGeom ? currentGeom.coordinates[0].length - 1 : 0;

  return (
    <FormModal
      title="Editar talhão"
      action={atualizarAction}
      submitLabel="Salvar alterações"
      trigger={
        <tr className="cursor-pointer border-b border-border last:border-0 hover:bg-surface-hover">
          <td className="px-6 py-3.5 font-medium text-foreground">
            <span className="flex items-center gap-1.5">
              {nome}
              {geom && (
                <span title="Área desenhada no mapa">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                </span>
              )}
            </span>
          </td>
          <td className="px-6 py-3.5 text-muted-foreground">{areaHa} ha</td>
          <td className="px-6 py-3.5 text-muted-foreground">{propriedadeNome ?? "—"}</td>
          <td className="px-6 py-3.5">
            {safraTalhoes.length ? (
              <div className="flex flex-wrap gap-1">
                {safraTalhoes.map((st, i) => {
                  const safra = Array.isArray(st.safras) ? st.safras[0] : st.safras;
                  return safra?.nome ? (
                    <Badge key={i} tone="primary">
                      {safra.nome} · {st.area_ha} ha
                    </Badge>
                  ) : null;
                })}
              </div>
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </td>
          <td className="px-6 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
            <form action={excluirAction}>
              <input type="hidden" name="id" value={id} />
              <ConfirmButton
                confirmText={`Excluir o talhão "${nome}"?`}
                title="Excluir"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-danger-soft hover:text-danger"
              >
                <Trash2 className="h-4 w-4" />
              </ConfirmButton>
            </form>
          </td>
        </tr>
      }
    >
      <input type="hidden" name="id" value={id} />
      <FieldGroup label="Nome" htmlFor={`nome-talhao-${id}`}>
        <Input id={`nome-talhao-${id}`} name="nome" defaultValue={nome} required />
      </FieldGroup>
      <FieldGroup label="Área (ha)" htmlFor={`area-talhao-${id}`}>
        <Input
          id={`area-talhao-${id}`}
          name="area_ha"
          type="number"
          step="0.01"
          min="0.01"
          defaultValue={areaHa}
          required
        />
      </FieldGroup>
      <FieldGroup label="Propriedade" htmlFor={`propriedade-talhao-${id}`}>
        <Select id={`propriedade-talhao-${id}`} name="propriedade_id" defaultValue={propriedadeId ?? ""} required>
          {propriedades.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </Select>
      </FieldGroup>
      <div>
        <p className="mb-1.5 text-sm font-medium text-foreground">Desenho da área (opcional)</p>
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2">
          <span className="flex items-center gap-3 text-sm text-muted-foreground">
            {currentGeom ? (
              <TalhaoGeomPreview geom={currentGeom} />
            ) : (
              <MapPin className="h-4 w-4" />
            )}
            {currentGeom ? `Contorno com ${pontos} pontos` : "Nenhum desenho ainda"}
          </span>
          <Button type="button" variant="secondary" onClick={() => setMapOpen(true)}>
            {currentGeom ? "Editar" : "Criar"}
          </Button>
        </div>
        <input type="hidden" name="geom" value={currentGeom ? JSON.stringify(currentGeom) : ""} />
      </div>

      <TalhaoMapDialog
        open={mapOpen}
        onOpenChange={setMapOpen}
        initialGeom={currentGeom}
        onSave={setCurrentGeom}
      />
    </FormModal>
  );
}
