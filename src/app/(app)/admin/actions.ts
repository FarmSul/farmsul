"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requirePlatformAdmin, getCachedUser } from "@/lib/supabase/admin";

function dadosClienteDoFormulario(formData: FormData) {
  return {
    nome: formData.get("nome") as string,
    plano: formData.get("plano") as string,
    cnpj_cpf: (formData.get("cnpj_cpf") as string) || null,
    responsavel: (formData.get("responsavel") as string) || null,
    uf: (formData.get("uf") as string) || null,
    cidade: (formData.get("cidade") as string) || null,
    cep: (formData.get("cep") as string) || null,
  };
}

export async function criarCliente(formData: FormData) {
  await requirePlatformAdmin();
  const supabase = await createClient();

  const { error } = await supabase.from("tenants").insert(dadosClienteDoFormulario(formData));

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/clientes");
}

export async function atualizarCliente(formData: FormData) {
  await requirePlatformAdmin();
  const supabase = await createClient();

  const id = formData.get("id") as string;

  const { error } = await supabase
    .from("tenants")
    .update(dadosClienteDoFormulario(formData))
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/clientes");
}

export async function excluirCliente(formData: FormData) {
  await requirePlatformAdmin();
  const supabase = await createClient();

  const id = formData.get("id") as string;

  const { error } = await supabase.from("tenants").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/clientes");
}

export async function promoverAdmin(formData: FormData) {
  await requirePlatformAdmin();
  const supabase = await createClient();

  const id = formData.get("id") as string;

  const { error } = await supabase.from("admins").insert({ id });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/equipe");
  revalidatePath("/admin");
}

export async function revogarAdmin(formData: FormData) {
  await requirePlatformAdmin();

  const id = formData.get("id") as string;
  const user = await getCachedUser();

  if (user?.id === id) {
    throw new Error("Você não pode remover seu próprio acesso de admin por aqui.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("admins").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/equipe");
  revalidatePath("/admin");
}

export async function atualizarPapelUsuario(formData: FormData) {
  await requirePlatformAdmin();
  const supabase = await createClient();

  const id = formData.get("id") as string;
  const papel = formData.get("papel") as string;

  const { error } = await supabase.from("profiles").update({ papel }).eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/usuarios");
}
