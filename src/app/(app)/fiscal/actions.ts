"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getTenantId } from "@/lib/supabase/tenant";

export async function criarNotaFiscal(formData: FormData) {
  const supabase = await createClient();
  const tenant_id = await getTenantId(supabase);

  const numero = formData.get("numero") as string;
  const tipo = formData.get("tipo") as string;
  const valor = Number(formData.get("valor"));
  const data_emissao = formData.get("data_emissao") as string;
  const descricao = (formData.get("descricao") as string) || null;

  const { error } = await supabase
    .from("notas_fiscais")
    .insert({ tenant_id, numero, tipo, valor, data_emissao, descricao });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/fiscal");
}

export async function cancelarNotaFiscal(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;

  const { error } = await supabase.from("notas_fiscais").update({ status: "cancelada" }).eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/fiscal");
}

export async function excluirNotaFiscal(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;

  const { error } = await supabase.from("notas_fiscais").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/fiscal");
}
