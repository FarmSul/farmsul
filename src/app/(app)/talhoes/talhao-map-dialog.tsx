"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Layer } from "leaflet";
import "leaflet/dist/leaflet.css";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";

type PmMap = LeafletMap & { pm: { addControls: (options: Record<string, unknown>) => void } };
type PmLayer = Layer & { pm: { enable: () => void }; toGeoJSON: () => GeoJSON.Feature };

// Centro padrão: região de Porto Alegre/RS, ajustável pela busca de local.
const DEFAULT_CENTER: [number, number] = [-30.03, -51.23];

export function TalhaoMapDialog({
  open,
  onOpenChange,
  initialGeom,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialGeom: GeoJSON.Polygon | null;
  onSave: (geom: GeoJSON.Polygon) => void;
}) {
  const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null);
  const mapRef = useRef<PmMap | null>(null);
  const layerRef = useRef<PmLayer | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    // Espera o Dialog montar de verdade o container no DOM (o Portal do Radix
    // não garante que ele já exista no exato momento em que `open` vira true).
    if (!open || !containerEl || mapRef.current) return;

    let cancelled = false;
    setMapError(null);

    (async () => {
      try {
        const leaflet = await import("leaflet");
        await import("@geoman-io/leaflet-geoman-free");
        const L = leaflet.default;

        if (cancelled) return;

        const map = L.map(containerEl).setView(DEFAULT_CENTER, 12) as PmMap;

        L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          { maxZoom: 19, attribution: "Tiles &copy; Esri" },
        ).addTo(map);

        if (!map.pm) {
          throw new Error("Plugin de desenho (geoman) não carregou corretamente.");
        }

        map.pm.addControls({
          position: "topleft",
          drawMarker: false,
          drawCircleMarker: false,
          drawPolyline: false,
          drawRectangle: false,
          drawCircle: false,
          drawText: false,
          drawPolygon: true,
          editMode: true,
          dragMode: true,
          cutPolygon: false,
          removalMode: true,
          rotateMode: false,
        });

        if (initialGeom) {
          const layer = L.geoJSON(initialGeom).getLayers()[0] as PmLayer;
          layer.addTo(map);
          layer.pm.enable();
          layerRef.current = layer;
          const bounds = (layer as unknown as { getBounds: () => L.LatLngBounds }).getBounds();
          map.fitBounds(bounds, { maxZoom: 17 });
        }

        map.on("pm:create", (e) => {
          const newLayer = (e as unknown as { layer: PmLayer }).layer;
          if (layerRef.current && layerRef.current !== newLayer) {
            map.removeLayer(layerRef.current);
          }
          layerRef.current = newLayer;
        });

        mapRef.current = map;

        // O container pode ter sido medido antes da animação do modal terminar;
        // recalcula o tamanho do mapa pra evitar tiles cortados/em branco.
        requestAnimationFrame(() => map.invalidateSize());
      } catch (err) {
        if (!cancelled) {
          setMapError(err instanceof Error ? err.message : "Não foi possível carregar o mapa.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, containerEl]);

  useEffect(() => {
    if (!open && mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
      layerRef.current = null;
      setError(null);
    }
  }, [open]);

  async function handleSearch() {
    if (!searchTerm.trim()) return;
    setSearching(true);
    setError(null);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(searchTerm)}`);
      if (!res.ok) {
        setError("Não foi possível buscar o local agora.");
        return;
      }
      const results = (await res.json()) as { lat: string; lon: string }[];
      if (!results[0]) {
        setError("Local não encontrado.");
      } else if (!mapRef.current) {
        setError("O mapa ainda não carregou — veja o erro acima ou tente reabrir esta janela.");
      } else {
        mapRef.current.setView([Number(results[0].lat), Number(results[0].lon)], 14);
      }
    } catch {
      setError("Não foi possível buscar o local.");
    } finally {
      setSearching(false);
    }
  }

  function handleSave() {
    if (!layerRef.current) {
      setError("Desenhe o contorno da área antes de salvar.");
      return;
    }
    const geojson = layerRef.current.toGeoJSON();
    const geometry = geojson.type === "Feature" ? geojson.geometry : geojson;
    if (geometry.type !== "Polygon") {
      setError("Desenhe um polígono fechado.");
      return;
    }
    onSave(geometry);
    onOpenChange(false);
  }

  function handleRemovePoints() {
    if (layerRef.current && mapRef.current) {
      mapRef.current.removeLayer(layerRef.current);
      layerRef.current = null;
      setError(null);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[60] h-[85vh] w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl border border-border bg-surface shadow-[var(--shadow-4)] focus:outline-none">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <Dialog.Title className="text-sm font-semibold text-foreground">
                Desenhe o contorno da área
              </Dialog.Title>
              <Dialog.Description className="text-xs text-muted-foreground">
                Alterar o desenho não altera automaticamente a área em hectares informada.
              </Dialog.Description>
            </div>
            <Dialog.Close className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-surface-hover hover:text-foreground">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          <div className="relative h-[calc(100%-57px)] w-full">
            <div className="absolute left-3 top-3 z-[1000] flex w-64 gap-1.5">
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
                placeholder="Procure uma localização"
                className="flex-1 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-foreground shadow-[var(--shadow-2)] focus:border-primary focus:outline-none"
              />
              <button
                type="button"
                onClick={handleSearch}
                disabled={searching}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface text-muted-foreground shadow-[var(--shadow-2)] hover:text-foreground disabled:opacity-50"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>

            <div ref={setContainerEl} className="h-full w-full" />

            {mapError && (
              <div className="absolute inset-0 z-[900] flex items-center justify-center bg-surface p-6">
                <p className="max-w-sm rounded-lg bg-danger-soft px-4 py-3 text-center text-sm text-danger">
                  Não foi possível carregar o mapa: {mapError}
                </p>
              </div>
            )}

            <div className="absolute bottom-3 left-1/2 z-[1000] flex -translate-x-1/2 flex-wrap items-center justify-center gap-2 px-2">
              {error && (
                <span className="rounded-lg bg-danger-soft px-2.5 py-1.5 text-xs text-danger">{error}</span>
              )}
              <button
                type="button"
                onClick={handleRemovePoints}
                className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground shadow-[var(--shadow-2)] hover:bg-surface-hover"
              >
                Remover pontos
              </button>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground shadow-[var(--shadow-2)] hover:bg-surface-hover"
              >
                Cancelar edição
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-[var(--shadow-2)] hover:bg-primary-hover"
              >
                Salvar edição
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
