import type { createClient } from "./server";

export async function uploadArquivo(
  supabase: Awaited<ReturnType<typeof createClient>>,
  bucket: string,
  tenant_id: string,
  prefixo: string,
  arquivo: File,
) {
  const extensao = arquivo.name.split(".").pop() ?? "bin";
  const caminho = `${tenant_id}/${prefixo}-${Date.now()}.${extensao}`;

  const { error } = await supabase.storage.from(bucket).upload(caminho, arquivo, {
    upsert: true,
    contentType: arquivo.type,
  });

  if (error) {
    throw new Error(error.message);
  }

  return supabase.storage.from(bucket).getPublicUrl(caminho).data.publicUrl;
}
