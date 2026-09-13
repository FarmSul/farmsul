"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getTenantId, requerGestao } from "@/lib/supabase/tenant";

export async function criarColaborador(formData: FormData) {
  const supabase = await createClient();
  const tenant_id = await getTenantId(supabase);

  const nome = formData.get("nome") as string;
  const email = (formData.get("email") as string) || null;
  const telefone = (formData.get("telefone") as string) || null;
  const cpf = (formData.get("cpf") as string) || null;
  const perfil_id = (formData.get("perfil_id") as string) || null;

  const { error } = await supabase
    .from("colaboradores")
    .insert({ tenant_id, nome, email, telefone, cpf, perfil_id });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/equipe");
}

export async function atualizarColaborador(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id") as string;
  const nome = formData.get("nome") as string;
  const email = (formData.get("email") as string) || null;
  const telefone = (formData.get("telefone") as string) || null;
  const cpf = (formData.get("cpf") as string) || null;
  const perfil_id = (formData.get("perfil_id") as string) || null;

  const { error } = await supabase
    .from("colaboradores")
    .update({ nome, email, telefone, cpf, perfil_id })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/equipe");
}

export async function excluirColaborador(formData: FormData) {
  const supabase = await createClient();
  await requerGestao(supabase);
  const id = formData.get("id") as string;

  const { error } = await supabase.from("colaboradores").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/equipe");
}
