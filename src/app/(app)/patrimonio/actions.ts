"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getTenantId } from "@/lib/supabase/tenant";
import { uploadArquivo } from "@/lib/supabase/storage";

async function uploadFoto(supabase: Awaited<ReturnType<typeof createClient>>, tenant_id: string, foto: File) {
  return uploadArquivo(supabase, "equipamentos", tenant_id, "equipamento", foto);
}

function dadosEquipamentoDoFormulario(formData: FormData) {
  const tipo = formData.get("tipo") as string;
  const ehMaquina = tipo === "maquina";

  const anoRaw = formData.get("ano_fabricacao") as string;
  const vidaUtilRaw = formData.get("vida_util_horas") as string;
  const horimetroRaw = formData.get("horimetro_atual") as string;
  const valorRaw = formData.get("valor_aquisicao") as string;

  return {
    nome: formData.get("nome") as string,
    tipo,
    tipo_maquina: ehMaquina ? (formData.get("tipo_maquina") as string) : null,
    implemento: ehMaquina && formData.get("implemento") === "true",
    modelo: (formData.get("modelo") as string) || null,
    fabricante: (formData.get("fabricante") as string) || null,
    ano_fabricacao: anoRaw ? Number(anoRaw) : null,
    vida_util_horas: vidaUtilRaw ? Number(vidaUtilRaw) : null,
    horimetro_atual: horimetroRaw ? Number(horimetroRaw) : null,
    observacoes: (formData.get("observacoes") as string) || null,
    status: (formData.get("status") as string) || "ativo",
    data_aquisicao: (formData.get("data_aquisicao") as string) || null,
    valor_aquisicao: valorRaw ? Number(valorRaw) : null,
  };
}

export async function criarEquipamento(formData: FormData) {
  const supabase = await createClient();
  const tenant_id = await getTenantId(supabase);

  const dados = dadosEquipamentoDoFormulario(formData);
  const foto = formData.get("foto") as File | null;
  const foto_url = foto && foto.size > 0 ? await uploadFoto(supabase, tenant_id, foto) : null;

  const { error } = await supabase.from("equipamentos").insert({ tenant_id, ...dados, foto_url });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/patrimonio");
  revalidatePath("/patrimonio/ativos");
}

export async function atualizarEquipamento(formData: FormData) {
  const supabase = await createClient();
  const tenant_id = await getTenantId(supabase);

  const id = formData.get("id") as string;
  const dados: Record<string, unknown> = dadosEquipamentoDoFormulario(formData);

  const foto = formData.get("foto") as File | null;
  if (foto && foto.size > 0) {
    dados.foto_url = await uploadFoto(supabase, tenant_id, foto);
  }

  const { error } = await supabase.from("equipamentos").update(dados).eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/patrimonio");
  revalidatePath("/patrimonio/ativos");
}

export async function excluirEquipamento(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;

  const { error } = await supabase.from("equipamentos").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/patrimonio");
  revalidatePath("/patrimonio/ativos");
}

type PecaManutencao = { nome: string; quantidade: number; valor_unitario: number };

export async function criarManutencao(formData: FormData) {
  const supabase = await createClient();
  const tenant_id = await getTenantId(supabase);

  const equipamento_id = formData.get("equipamento_id") as string;
  const data = formData.get("data") as string;
  const descricao = formData.get("descricao") as string;
  const maoDeObraRaw = formData.get("mao_de_obra") as string;
  const mao_de_obra = maoDeObraRaw ? Number(maoDeObraRaw) : 0;
  const pecasRaw = formData.get("pecas") as string | null;
  const pecas: PecaManutencao[] = pecasRaw ? JSON.parse(pecasRaw) : [];
  const notaFiscal = formData.get("nota_fiscal") as File | null;
  const responsavel_id = (formData.get("responsavel_id") as string) || null;
  const safra_id = (formData.get("safra_id") as string) || null;
  const etapa = (formData.get("etapa") as string) || null;

  const totalPecas = pecas.reduce((soma, p) => soma + p.quantidade * p.valor_unitario, 0);
  const custo = mao_de_obra + totalPecas;

  const nota_fiscal_url =
    notaFiscal && notaFiscal.size > 0
      ? await uploadArquivo(supabase, "notas-fiscais", tenant_id, "nota-fiscal", notaFiscal)
      : null;

  const { error } = await supabase.from("manutencoes").insert({
    tenant_id,
    equipamento_id,
    data,
    descricao,
    custo,
    mao_de_obra,
    pecas,
    responsavel_id,
    safra_id,
    etapa,
    nota_fiscal_url,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/patrimonio/ativos");
  revalidatePath("/patrimonio/manutencao");
  if (safra_id) revalidatePath(`/safras/${safra_id}`);
}

export async function atualizarManutencao(formData: FormData) {
  const supabase = await createClient();
  const tenant_id = await getTenantId(supabase);

  const id = formData.get("id") as string;
  const equipamento_id = formData.get("equipamento_id") as string;
  const data = formData.get("data") as string;
  const descricao = formData.get("descricao") as string;
  const maoDeObraRaw = formData.get("mao_de_obra") as string;
  const mao_de_obra = maoDeObraRaw ? Number(maoDeObraRaw) : 0;
  const pecasRaw = formData.get("pecas") as string | null;
  const pecas: PecaManutencao[] = pecasRaw ? JSON.parse(pecasRaw) : [];
  const notaFiscal = formData.get("nota_fiscal") as File | null;
  const responsavel_id = (formData.get("responsavel_id") as string) || null;
  const safra_id = (formData.get("safra_id") as string) || null;

  const totalPecas = pecas.reduce((soma, p) => soma + p.quantidade * p.valor_unitario, 0);
  const custo = mao_de_obra + totalPecas;

  const dados: Record<string, unknown> = {
    equipamento_id,
    data,
    descricao,
    custo,
    mao_de_obra,
    pecas,
    responsavel_id,
    safra_id,
  };

  if (formData.has("etapa")) {
    dados.etapa = (formData.get("etapa") as string) || null;
  }

  if (notaFiscal && notaFiscal.size > 0) {
    dados.nota_fiscal_url = await uploadArquivo(supabase, "notas-fiscais", tenant_id, "nota-fiscal", notaFiscal);
  }

  const { data: anterior } = await supabase.from("manutencoes").select("safra_id").eq("id", id).single();

  const { error } = await supabase.from("manutencoes").update(dados).eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/patrimonio/ativos");
  revalidatePath("/patrimonio/manutencao");
  if (safra_id) revalidatePath(`/safras/${safra_id}`);
  if (anterior?.safra_id && anterior.safra_id !== safra_id) revalidatePath(`/safras/${anterior.safra_id}`);
}

export async function excluirManutencao(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;

  const { data: atual } = await supabase.from("manutencoes").select("safra_id").eq("id", id).single();

  const { error } = await supabase.from("manutencoes").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/patrimonio/ativos");
  revalidatePath("/patrimonio/manutencao");
  if (atual?.safra_id) revalidatePath(`/safras/${atual.safra_id}`);
}

async function ajustarEstoqueInsumo(
  supabase: Awaited<ReturnType<typeof createClient>>,
  insumo_id: string,
  delta: number,
) {
  const { data: insumo, error } = await supabase
    .from("insumos")
    .select("estoque_atual")
    .eq("id", insumo_id)
    .single();

  if (error || !insumo) {
    throw new Error("Combustível não encontrado no estoque de insumos.");
  }

  const { error: updateError } = await supabase
    .from("insumos")
    .update({ estoque_atual: Number(insumo.estoque_atual) + delta })
    .eq("id", insumo_id);

  if (updateError) {
    throw new Error(updateError.message);
  }
}

export async function criarAbastecimento(formData: FormData) {
  const supabase = await createClient();
  const tenant_id = await getTenantId(supabase);

  const equipamento_id = formData.get("equipamento_id") as string;
  const insumo_id = formData.get("insumo_id") as string;
  const litros = Number(formData.get("litros"));
  const custoRaw = formData.get("custo_total") as string;
  const custo_total = custoRaw ? Number(custoRaw) : 0;
  const horimetroRaw = formData.get("horimetro") as string;
  const horimetro = horimetroRaw ? Number(horimetroRaw) : null;
  const data = formData.get("data") as string;
  const safra_id = (formData.get("safra_id") as string) || null;
  const etapa = (formData.get("etapa") as string) || null;

  const { error } = await supabase
    .from("abastecimentos")
    .insert({ tenant_id, equipamento_id, insumo_id, litros, custo_total, horimetro, data, safra_id, etapa });

  if (error) {
    throw new Error(error.message);
  }

  await ajustarEstoqueInsumo(supabase, insumo_id, -litros);

  if (horimetro != null) {
    await supabase.from("equipamentos").update({ horimetro_atual: horimetro }).eq("id", equipamento_id);
  }

  revalidatePath("/patrimonio");
  revalidatePath("/patrimonio/ativos");
  revalidatePath("/patrimonio/abastecimento");
  revalidatePath("/estoque-insumos");
  if (safra_id) revalidatePath(`/safras/${safra_id}`);
}

export async function atualizarAbastecimento(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id") as string;
  const equipamento_id = formData.get("equipamento_id") as string;
  const insumo_id = formData.get("insumo_id") as string;
  const litros = Number(formData.get("litros"));
  const custoRaw = formData.get("custo_total") as string;
  const custo_total = custoRaw ? Number(custoRaw) : 0;
  const horimetroRaw = formData.get("horimetro") as string;
  const horimetro = horimetroRaw ? Number(horimetroRaw) : null;
  const data = formData.get("data") as string;
  const safra_id = (formData.get("safra_id") as string) || null;

  const { data: atual, error: buscaError } = await supabase
    .from("abastecimentos")
    .select("insumo_id, litros, safra_id")
    .eq("id", id)
    .single();

  if (buscaError || !atual) {
    throw new Error("Abastecimento não encontrado.");
  }

  // Devolve o estoque antigo antes de aplicar a nova saída (cobre inclusive
  // troca de combustível entre um insumo e outro).
  await ajustarEstoqueInsumo(supabase, atual.insumo_id, atual.litros);
  await ajustarEstoqueInsumo(supabase, insumo_id, -litros);

  const dadosAtualizados: Record<string, unknown> = { equipamento_id, insumo_id, litros, custo_total, horimetro, data, safra_id };
  if (formData.has("etapa")) {
    dadosAtualizados.etapa = (formData.get("etapa") as string) || null;
  }

  const { error } = await supabase
    .from("abastecimentos")
    .update(dadosAtualizados)
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/patrimonio");
  revalidatePath("/patrimonio/ativos");
  revalidatePath("/patrimonio/abastecimento");
  revalidatePath("/estoque-insumos");
  if (safra_id) revalidatePath(`/safras/${safra_id}`);
  if (atual.safra_id && atual.safra_id !== safra_id) revalidatePath(`/safras/${atual.safra_id}`);
}

export async function excluirAbastecimento(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;

  const { data: atual, error: buscaError } = await supabase
    .from("abastecimentos")
    .select("insumo_id, litros, safra_id")
    .eq("id", id)
    .single();

  if (buscaError || !atual) {
    throw new Error("Abastecimento não encontrado.");
  }

  const { error } = await supabase.from("abastecimentos").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  await ajustarEstoqueInsumo(supabase, atual.insumo_id, atual.litros);

  revalidatePath("/patrimonio");
  revalidatePath("/patrimonio/ativos");
  revalidatePath("/patrimonio/abastecimento");
  revalidatePath("/estoque-insumos");
  if (atual.safra_id) revalidatePath(`/safras/${atual.safra_id}`);
}
