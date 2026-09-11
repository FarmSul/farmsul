"use server";

import { revalidatePath } from "next/cache";
import { requirePlatformAdmin } from "@/lib/supabase/admin";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export async function criarUsuarioCliente(formData: FormData) {
  await requirePlatformAdmin();

  const nome_completo = formData.get("nome_completo") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const tenant_id = formData.get("tenant_id") as string;
  const papel = formData.get("papel") as string;

  const admin = createServiceRoleClient();

  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nome_completo, tenant_id, papel },
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/usuarios");
  revalidatePath("/admin");
}

export async function excluirUsuarioCliente(formData: FormData) {
  await requirePlatformAdmin();

  const id = formData.get("id") as string;
  const admin = createServiceRoleClient();

  const { error } = await admin.auth.admin.deleteUser(id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/usuarios");
  revalidatePath("/admin");
}
