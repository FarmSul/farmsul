"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getTenantId, requerGestao } from "@/lib/supabase/tenant";

export async function criarSafra(formData: FormData) {
  const supabase = await createClient();
  const tenant_id = await getTenantId(supabase);

  const nome = formData.get("nome") as string;
  const cultura = formData.get("cultura") as string;
  const data_inicio = formData.get("data_inicio") as string;
  const data_fim = (formData.get("data_fim") as string) || null;
  const tipo_custo = (formData.get("tipo_custo") as string) || "automatico";
  const talhao_ids = formData.getAll("talhao_ids") as string[];

  const { data: safra, error } = await supabase
    .from("safras")
    .insert({ tenant_id, nome, cultura, data_inicio, data_fim, tipo_custo })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (talhao_ids.length) {
    const areas = talhao_ids.map((talhao_id) => ({
      tenant_id,
      safra_id: safra.id,
      talhao_id,
      area_ha: Number(formData.get(`area_${talhao_id}`)),
    }));

    const { error: areasError } = await supabase.from("safra_talhoes").insert(areas);

    if (areasError) {
      throw new Error(areasError.message);
    }
  }

  revalidatePath("/safras");
  revalidatePath("/talhoes");
}

export async function atualizarSafra(formData: FormData) {
  const supabase = await createClient();
  const tenant_id = await getTenantId(supabase);

  const id = formData.get("id") as string;
  const nome = formData.get("nome") as string;
  const cultura = formData.get("cultura") as string;
  const data_inicio = formData.get("data_inicio") as string;
  const data_fim = (formData.get("data_fim") as string) || null;
  const tipo_custo = (formData.get("tipo_custo") as string) || "automatico";
  const talhao_ids = formData.getAll("talhao_ids") as string[];

  const { error } = await supabase
    .from("safras")
    .update({ nome, cultura, data_inicio, data_fim, tipo_custo })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  const { error: deleteError } = await supabase.from("safra_talhoes").delete().eq("safra_id", id);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  if (talhao_ids.length) {
    const areas = talhao_ids.map((talhao_id) => ({
      tenant_id,
      safra_id: id,
      talhao_id,
      area_ha: Number(formData.get(`area_${talhao_id}`)),
    }));

    const { error: areasError } = await supabase.from("safra_talhoes").insert(areas);

    if (areasError) {
      throw new Error(areasError.message);
    }
  }

  revalidatePath("/safras");
  revalidatePath("/talhoes");
  revalidatePath(`/safras/${id}`);
}

export async function atualizarSimulacaoSafra(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id") as string;
  const sacasRaw = formData.get("sacas_previstas") as string;
  const precoRaw = formData.get("preco_saca_previsto") as string;

  const { error } = await supabase
    .from("safras")
    .update({
      sacas_previstas: sacasRaw ? Number(sacasRaw) : null,
      preco_saca_previsto: precoRaw ? Number(precoRaw) : null,
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/safras/${id}`);
}

export async function excluirSafra(formData: FormData) {
  const supabase = await createClient();
  await requerGestao(supabase);
  const id = formData.get("id") as string;

  const { error } = await supabase.from("safras").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/safras");
}
