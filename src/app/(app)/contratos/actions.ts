"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getTenantId } from "@/lib/supabase/tenant";

export async function criarContrato(formData: FormData) {
  const supabase = await createClient();
  const tenant_id = await getTenantId(supabase);

  const titulo = formData.get("titulo") as string;
  const tipo = formData.get("tipo") as string;
  const contraparte = (formData.get("contraparte") as string) || null;
  const valorRaw = formData.get("valor") as string;
  const valor = valorRaw ? Number(valorRaw) : null;
  const data_inicio = formData.get("data_inicio") as string;
  const data_fim = (formData.get("data_fim") as string) || null;

  const { error } = await supabase
    .from("contratos")
    .insert({ tenant_id, titulo, tipo, contraparte, valor, data_inicio, data_fim });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/contratos");
}

export async function encerrarContrato(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;

  const { error } = await supabase.from("contratos").update({ status: "encerrado" }).eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/contratos");
}

export async function excluirContrato(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;

  const { error } = await supabase.from("contratos").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/contratos");
}
