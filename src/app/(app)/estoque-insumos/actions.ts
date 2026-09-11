"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getTenantId } from "@/lib/supabase/tenant";

export async function criarInsumo(formData: FormData) {
  const supabase = await createClient();
  const tenant_id = await getTenantId(supabase);

  const nome = formData.get("nome") as string;
  const categoria = formData.get("categoria") as string;
  const unidade = formData.get("unidade") as string;
  const estoque_atual = Number(formData.get("estoque_atual") || 0);
  const custoRaw = formData.get("custo_medio") as string;
  const custo_medio = custoRaw ? Number(custoRaw) : null;

  const { error } = await supabase
    .from("insumos")
    .insert({ tenant_id, nome, categoria, unidade, estoque_atual, custo_medio });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/estoque-insumos");
}

export async function atualizarInsumo(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id") as string;
  const nome = formData.get("nome") as string;
  const categoria = formData.get("categoria") as string;
  const unidade = formData.get("unidade") as string;
  const estoque_atual = Number(formData.get("estoque_atual") || 0);
  const custoRaw = formData.get("custo_medio") as string;
  const custo_medio = custoRaw ? Number(custoRaw) : null;

  const { error } = await supabase
    .from("insumos")
    .update({ nome, categoria, unidade, estoque_atual, custo_medio })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/estoque-insumos");
}

export async function excluirInsumo(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;

  const { error } = await supabase.from("insumos").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/estoque-insumos");
}
