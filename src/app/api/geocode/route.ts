import { NextRequest, NextResponse } from "next/server";
import { geocodeNominatim } from "@/lib/geocode";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");

  if (!q) {
    return NextResponse.json({ error: "Parâmetro q é obrigatório" }, { status: 400 });
  }

  const data = await geocodeNominatim(q);

  if (data === null) {
    return NextResponse.json({ error: "Falha ao consultar geocodificação" }, { status: 502 });
  }

  return NextResponse.json(data);
}
