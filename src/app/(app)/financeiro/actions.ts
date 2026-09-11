"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getTenantId } from "@/lib/supabase/tenant";

export async function criarLancamento(formData: FormData) {
  const supabase = await createClient();
  const tenant_id = await getTenantId(supabase);

  const tipo = formData.get("tipo") as string;
  const categoria = formData.get("categoria") as string;
  const descricao = (formData.get("descricao") as string) || null;
  const valor = Number(formData.get("valor"));
  const status = formData.get("status") as string;
  const data = formData.get("data") as string;

  const { error } = await supabase
    .from("lancamentos_financeiros")
    .insert({ tenant_id, tipo, categoria, descricao, valor, status, data });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/financeiro");
}

export async function excluirLancamento(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;

  const { error } = await supabase.from("lancamentos_financeiros").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/financeiro");
}
