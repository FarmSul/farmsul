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
  const etapa = (formData.get("etapa") as string) || null;

  const { error } = await supabase
    .from("estoque_producao")
    .insert({ tenant_id, produto, safra_id, tipo, quantidade, unidade, local, data, etapa });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/estoque-producao");
  if (safra_id) revalidatePath(`/safras/${safra_id}`);
}

export async function atualizarMovimentacao(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id") as string;
  const produto = formData.get("produto") as string;
  const quantidade = Number(formData.get("quantidade"));
  const unidade = formData.get("unidade") as string;
  const local = (formData.get("local") as string) || null;
  const data = formData.get("data") as string;

  const { data: atual } = await supabase.from("estoque_producao").select("safra_id").eq("id", id).single();

  const { error } = await supabase
    .from("estoque_producao")
    .update({ produto, quantidade, unidade, local, data })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/estoque-producao");
  if (atual?.safra_id) revalidatePath(`/safras/${atual.safra_id}`);
}

export async function excluirMovimentacao(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;

  const { data: atual } = await supabase.from("estoque_producao").select("safra_id").eq("id", id).single();

  const { error } = await supabase.from("estoque_producao").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/estoque-producao");
  if (atual?.safra_id) revalidatePath(`/safras/${atual.safra_id}`);
}
