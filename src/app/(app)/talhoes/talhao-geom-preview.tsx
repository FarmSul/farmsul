function pontosDoPoligono(geom: GeoJSON.Polygon, size: number, padding: number) {
  const anel = geom.coordinates[0];
  const lons = anel.map((p) => p[0]);
  const lats = anel.map((p) => p[1]);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const largura = maxLon - minLon || 1;
  const altura = maxLat - minLat || 1;
  const escala = Math.min((size - padding * 2) / largura, (size - padding * 2) / altura);
  const offsetX = (size - largura * escala) / 2;
  const offsetY = (size - altura * escala) / 2;

  return anel
    .map(([lon, lat]) => {
      const x = offsetX + (lon - minLon) * escala;
      const y = offsetY + (maxLat - lat) * escala;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export function TalhaoGeomPreview({ geom, size = 72 }: { geom: GeoJSON.Polygon; size?: number }) {
  const pontos = pontosDoPoligono(geom, size, 8);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="shrink-0 rounded-lg border border-border bg-surface-hover"
    >
      <polygon points={pontos} className="fill-primary/20 stroke-primary" strokeWidth={1.5} strokeLinejoin="round" />
    </svg>
  );
}
