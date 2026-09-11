"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCachedUser } from "@/lib/supabase/admin";

export async function atualizarPerfil(formData: FormData) {
  const user = await getCachedUser();
  if (!user) throw new Error("Não autenticado");

  const supabase = await createClient();
  const nome_completo = formData.get("nome_completo") as string;
  const telefone = (formData.get("telefone") as string) || null;
  const foto = formData.get("foto") as File | null;

  let avatar_url: string | undefined;

  if (foto && foto.size > 0) {
    const extensao = foto.name.split(".").pop() ?? "png";
    const caminho = `${user.id}/avatar-${Date.now()}.${extensao}`;

    const { error: erroUpload } = await supabase.storage.from("avatars").upload(caminho, foto, {
      upsert: true,
      contentType: foto.type,
    });

    if (erroUpload) {
      throw new Error(erroUpload.message);
    }

    avatar_url = supabase.storage.from("avatars").getPublicUrl(caminho).data.publicUrl;
  }

  const { error } = await supabase
    .from("profiles")
    .update({ nome_completo, telefone, ...(avatar_url ? { avatar_url } : {}) })
    .eq("id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/", "layout");
}

export async function trocarSenha(formData: FormData) {
  const user = await getCachedUser();
  if (!user) throw new Error("Não autenticado");

  const novaSenha = formData.get("nova_senha") as string;
  const confirmacao = formData.get("confirmar_senha") as string;

  if (novaSenha.length < 8) {
    throw new Error("A senha precisa ter pelo menos 8 caracteres");
  }

  if (novaSenha !== confirmacao) {
    throw new Error("As senhas não coincidem");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: novaSenha });

  if (error) {
    throw new Error(error.message);
  }

  await supabase.auth.signOut();
}

export async function atualizarEmail(formData: FormData) {
  const user = await getCachedUser();
  if (!user) throw new Error("Não autenticado");

  const novoEmail = formData.get("novo_email") as string;

  if (novoEmail === user.email) {
    throw new Error("Esse já é o seu e-mail atual");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ email: novoEmail });

  if (error) {
    throw new Error(error.message);
  }
}
