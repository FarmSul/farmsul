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
  const safra_id = (formData.get("safra_id") as string) || null;
  const etapa = (formData.get("etapa") as string) || null;
  const talhao_id = (formData.get("talhao_id") as string) || null;

  const { error } = await supabase
    .from("lancamentos_financeiros")
    .insert({ tenant_id, tipo, categoria, descricao, valor, status, data, safra_id, etapa, talhao_id });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/financeiro");
  if (safra_id) revalidatePath(`/safras/${safra_id}`);
}

export async function atualizarLancamento(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id") as string;
  const tipo = formData.get("tipo") as string;
  const categoria = formData.get("categoria") as string;
  const descricao = (formData.get("descricao") as string) || null;
  const valor = Number(formData.get("valor"));
  const status = formData.get("status") as string;
  const data = formData.get("data") as string;
  const talhao_id = (formData.get("talhao_id") as string) || null;

  const dados: Record<string, unknown> = { tipo, categoria, descricao, valor, status, data, talhao_id };
  if (formData.has("etapa")) {
    dados.etapa = (formData.get("etapa") as string) || null;
  }

  const { data: atual } = await supabase.from("lancamentos_financeiros").select("safra_id").eq("id", id).single();

  const { error } = await supabase.from("lancamentos_financeiros").update(dados).eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/financeiro");
  if (atual?.safra_id) revalidatePath(`/safras/${atual.safra_id}`);
}

export async function excluirLancamento(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;

  const { data: atual } = await supabase.from("lancamentos_financeiros").select("safra_id").eq("id", id).single();

  const { error } = await supabase.from("lancamentos_financeiros").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/financeiro");
  if (atual?.safra_id) revalidatePath(`/safras/${atual.safra_id}`);
}
