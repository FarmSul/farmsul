"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getTenantId, requerGestao } from "@/lib/supabase/tenant";

export async function criarTalhao(formData: FormData) {
  const supabase = await createClient();
  const tenant_id = await getTenantId(supabase);

  const nome = formData.get("nome") as string;
  const area_ha = Number(formData.get("area_ha"));
  const propriedade_id = formData.get("propriedade_id") as string;
  const geomRaw = formData.get("geom") as string | null;
  const geom = geomRaw ? JSON.parse(geomRaw) : null;

  const { error } = await supabase
    .from("talhoes")
    .insert({ tenant_id, nome, area_ha, propriedade_id, geom });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/talhoes");
}

export async function atualizarTalhao(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id") as string;
  const nome = formData.get("nome") as string;
  const area_ha = Number(formData.get("area_ha"));
  const propriedade_id = formData.get("propriedade_id") as string;
  const geomRaw = formData.get("geom") as string | null;
  const geom = geomRaw ? JSON.parse(geomRaw) : null;

  const { error } = await supabase
    .from("talhoes")
    .update({ nome, area_ha, propriedade_id, geom })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/talhoes");
}

export async function excluirTalhao(formData: FormData) {
  const supabase = await createClient();
  await requerGestao(supabase);
  const id = formData.get("id") as string;

  const { error } = await supabase.from("talhoes").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/talhoes");
}
