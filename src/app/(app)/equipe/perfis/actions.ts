"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getTenantId } from "@/lib/supabase/tenant";
import { permissoesDeFormData } from "./permissoes";

export async function criarPerfil(formData: FormData) {
  const supabase = await createClient();
  const tenant_id = await getTenantId(supabase);

  const nome = formData.get("nome") as string;
  const descricao = (formData.get("descricao") as string) || null;
  const permissoes = permissoesDeFormData(formData);

  const { error } = await supabase.from("perfis").insert({ tenant_id, nome, descricao, permissoes });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/equipe/perfis");
}

export async function atualizarPerfil(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id") as string;
  const nome = formData.get("nome") as string;
  const descricao = (formData.get("descricao") as string) || null;
  const permissoes = permissoesDeFormData(formData);

  const { error } = await supabase.from("perfis").update({ nome, descricao, permissoes }).eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/equipe/perfis");
  revalidatePath("/equipe");
}

export async function excluirPerfil(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;

  const { error } = await supabase.from("perfis").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/equipe/perfis");
  revalidatePath("/equipe");
}
