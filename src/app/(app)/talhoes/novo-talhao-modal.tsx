"use client";

import Link from "next/link";
import { Plus, MapPin } from "lucide-react";
import { useState } from "react";
import { FormModal } from "@/components/ui/form-modal";
import { FieldGroup, Input, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { TalhaoMapDialog } from "./talhao-map-dialog";
import { TalhaoGeomPreview } from "./talhao-geom-preview";

export function NovoTalhaoModal({
  propriedades,
  action,
}: {
  propriedades: { id: string; nome: string }[];
  action: (formData: FormData) => void;
}) {
  const [geom, setGeom] = useState<GeoJSON.Polygon | null>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const pontos = geom ? geom.coordinates[0].length - 1 : 0;

  if (!propriedades.length) {
    return (
      <Link
        href="/propriedades"
        className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover"
        title="Cadastre uma propriedade antes de criar talhões"
      >
        <Plus className="h-4 w-4" />
        Cadastrar propriedade primeiro
      </Link>
    );
  }

  return (
    <FormModal
      title="Novo talhão"
      action={action}
      submitLabel="Adicionar"
      trigger={
        <Button type="button">
          <Plus className="h-4 w-4" />
          Novo talhão
        </Button>
      }
    >
      <FieldGroup label="Nome" htmlFor="nome-talhao">
        <Input id="nome-talhao" name="nome" placeholder="Talhão 01" required />
      </FieldGroup>
      <FieldGroup label="Área (ha)" htmlFor="area-talhao">
        <Input id="area-talhao" name="area_ha" type="number" step="0.01" min="0.01" placeholder="0,00" required />
      </FieldGroup>
      <FieldGroup label="Propriedade" htmlFor="propriedade-talhao">
        <Select id="propriedade-talhao" name="propriedade_id" required>
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
            {geom ? <TalhaoGeomPreview geom={geom} /> : <MapPin className="h-4 w-4" />}
            {geom ? `Contorno com ${pontos} pontos` : "Nenhum desenho ainda"}
          </span>
          <Button type="button" variant="secondary" onClick={() => setMapOpen(true)}>
            {geom ? "Editar" : "Criar"}
          </Button>
        </div>
        {geom && <input type="hidden" name="geom" value={JSON.stringify(geom)} />}
      </div>

      <TalhaoMapDialog open={mapOpen} onOpenChange={setMapOpen} initialGeom={geom} onSave={setGeom} />
    </FormModal>
  );
}
