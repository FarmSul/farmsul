"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getTenantId, requerGestao } from "@/lib/supabase/tenant";

export async function criarLote(formData: FormData) {
  const supabase = await createClient();
  const tenant_id = await getTenantId(supabase);

  const identificacao = formData.get("identificacao") as string;
  const categoria = formData.get("categoria") as string;
  const quantidade = Number(formData.get("quantidade"));
  const pesoRaw = formData.get("peso_medio_kg") as string;
  const peso_medio_kg = pesoRaw ? Number(pesoRaw) : null;
  const data_entrada = formData.get("data_entrada") as string;
  const observacoes = (formData.get("observacoes") as string) || null;

  const { error } = await supabase
    .from("pecuaria_lotes")
    .insert({ tenant_id, identificacao, categoria, quantidade, peso_medio_kg, data_entrada, observacoes });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/pecuaria");
}

export async function excluirLote(formData: FormData) {
  const supabase = await createClient();
  await requerGestao(supabase);
  const id = formData.get("id") as string;

  const { error } = await supabase.from("pecuaria_lotes").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/pecuaria");
}
