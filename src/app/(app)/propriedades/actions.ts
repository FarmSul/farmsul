"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getTenantId, requerGestao } from "@/lib/supabase/tenant";

export async function criarPropriedade(formData: FormData) {
  const supabase = await createClient();
  const tenant_id = await getTenantId(supabase);

  const nome = formData.get("nome") as string;
  const areaRaw = formData.get("area_ha") as string;
  const area_ha = areaRaw ? Number(areaRaw) : null;
  const municipio = (formData.get("municipio") as string) || null;
  const estado = (formData.get("estado") as string) || "MS";

  const { error } = await supabase
    .from("propriedades")
    .insert({ tenant_id, nome, area_ha, municipio, estado });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/propriedades");
}

export async function atualizarPropriedade(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id") as string;
  const nome = formData.get("nome") as string;
  const areaRaw = formData.get("area_ha") as string;
  const area_ha = areaRaw ? Number(areaRaw) : null;
  const municipio = (formData.get("municipio") as string) || null;
  const estado = (formData.get("estado") as string) || "MS";

  const { error } = await supabase
    .from("propriedades")
    .update({ nome, area_ha, municipio, estado })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/propriedades");
}

export async function excluirPropriedade(formData: FormData) {
  const supabase = await createClient();
  await requerGestao(supabase);
  const id = formData.get("id") as string;

  const { error } = await supabase.from("propriedades").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/propriedades");
}
