"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getTenantId } from "@/lib/supabase/tenant";
import { geocodeNominatim } from "@/lib/geocode";

export async function criarEstacao(formData: FormData) {
  const supabase = await createClient();
  const tenant_id = await getTenantId(supabase);

  const nome = formData.get("nome") as string;
  const tipo = (formData.get("tipo") as string) || "pluviometro";
  const propriedade_id = formData.get("propriedade_id") as string;

  const { error } = await supabase.from("estacoes_climaticas").insert({ tenant_id, nome, tipo, propriedade_id });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/registros");
  revalidatePath("/registros/estacoes");
}

export async function atualizarEstacao(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id") as string;
  const nome = formData.get("nome") as string;
  const tipo = (formData.get("tipo") as string) || "pluviometro";
  const propriedade_id = formData.get("propriedade_id") as string;

  const { error } = await supabase
    .from("estacoes_climaticas")
    .update({ nome, tipo, propriedade_id })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/registros");
  revalidatePath("/registros/estacoes");
}

export async function excluirEstacao(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;

  const { error } = await supabase.from("estacoes_climaticas").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/registros");
  revalidatePath("/registros/estacoes");
}

export async function criarRegistroClimatico(formData: FormData) {
  const supabase = await createClient();
  const tenant_id = await getTenantId(supabase);

  const estacao_id = formData.get("estacao_id") as string;
  const data = formData.get("data") as string;
  const precipitacaoRaw = formData.get("precipitacao_mm") as string;
  const temperaturaRaw = formData.get("temperatura_c") as string;
  const umidadeRaw = formData.get("umidade_pct") as string;
  const pressaoRaw = formData.get("pressao_hpa") as string;

  const { error } = await supabase.from("registros_climaticos").insert({
    tenant_id,
    estacao_id,
    data,
    precipitacao_mm: precipitacaoRaw ? Number(precipitacaoRaw) : null,
    temperatura_c: temperaturaRaw ? Number(temperaturaRaw) : null,
    umidade_pct: umidadeRaw ? Number(umidadeRaw) : null,
    pressao_hpa: pressaoRaw ? Number(pressaoRaw) : null,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/registros");
  revalidatePath("/registros/leituras");
}

export async function atualizarRegistroClimatico(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id") as string;
  const estacao_id = formData.get("estacao_id") as string;
  const data = formData.get("data") as string;
  const precipitacaoRaw = formData.get("precipitacao_mm") as string;
  const temperaturaRaw = formData.get("temperatura_c") as string;
  const umidadeRaw = formData.get("umidade_pct") as string;
  const pressaoRaw = formData.get("pressao_hpa") as string;

  const { error } = await supabase
    .from("registros_climaticos")
    .update({
      estacao_id,
      data,
      precipitacao_mm: precipitacaoRaw ? Number(precipitacaoRaw) : null,
      temperatura_c: temperaturaRaw ? Number(temperaturaRaw) : null,
      umidade_pct: umidadeRaw ? Number(umidadeRaw) : null,
      pressao_hpa: pressaoRaw ? Number(pressaoRaw) : null,
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/registros");
  revalidatePath("/registros/leituras");
}

export async function excluirRegistroClimatico(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;

  const { error } = await supabase.from("registros_climaticos").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/registros");
  revalidatePath("/registros/leituras");
}

/**
 * Garante lat/lon da propriedade pra previsão do tempo — geocodifica por
 * município/estado (Nominatim) e guarda no cadastro, pra não repetir a
 * consulta a cada carregamento da tela.
 */
export async function geocodificarPropriedade(
  id: string,
  municipio: string | null,
  estado: string | null,
): Promise<{ latitude: number; longitude: number } | null> {
  if (!municipio) return null;

  const resultados = await geocodeNominatim(`${municipio}, ${estado ?? ""}, Brasil`);
  const primeiro = resultados?.[0];
  if (!primeiro) return null;

  const latitude = Number(primeiro.lat);
  const longitude = Number(primeiro.lon);

  const supabase = await createClient();
  await supabase.from("propriedades").update({ latitude, longitude }).eq("id", id);

  return { latitude, longitude };
}
