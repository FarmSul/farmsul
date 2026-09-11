"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getTenantId } from "@/lib/supabase/tenant";

export async function atualizarEmpresa(formData: FormData) {
  const supabase = await createClient();
  const tenant_id = await getTenantId(supabase);

  const nome = formData.get("nome") as string;
  const cnpj_cpf = (formData.get("cnpj_cpf") as string) || null;
  const responsavel = (formData.get("responsavel") as string) || null;
  const uf = (formData.get("uf") as string) || null;
  const cidade = (formData.get("cidade") as string) || null;
  const cep = (formData.get("cep") as string) || null;

  const { error } = await supabase
    .from("tenants")
    .update({ nome, cnpj_cpf, responsavel, uf, cidade, cep })
    .eq("id", tenant_id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/", "layout");
  revalidatePath("/configuracoes");
}
