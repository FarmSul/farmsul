"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getTenantId } from "@/lib/supabase/tenant";

export async function criarMovimentacao(formData: FormData) {
  const supabase = await createClient();
  const tenant_id = await getTenantId(supabase);

  const produto = formData.get("produto") as string;
  const safra_id = (formData.get("safra_id") as string) || null;
  const tipo = formData.get("tipo") as string;
  const quantidade = Number(formData.get("quantidade"));
  const unidade = formData.get("unidade") as string;
  const local = (formData.get("local") as string) || null;
  const data = formData.get("data") as string;

  const { error } = await supabase
    .from("estoque_producao")
    .insert({ tenant_id, produto, safra_id, tipo, quantidade, unidade, local, data });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/estoque-producao");
}

export async function excluirMovimentacao(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;

  const { error } = await supabase.from("estoque_producao").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/estoque-producao");
}
