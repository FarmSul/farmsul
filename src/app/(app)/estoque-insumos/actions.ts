"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getTenantId } from "@/lib/supabase/tenant";

export async function criarInsumo(formData: FormData) {
  const supabase = await createClient();
  const tenant_id = await getTenantId(supabase);

  const nome = formData.get("nome") as string;
  const categoria = formData.get("categoria") as string;
  const unidade = formData.get("unidade") as string;
  const estoque_atual = Number(formData.get("estoque_atual") || 0);
  const custoRaw = formData.get("custo_medio") as string;
  const custo_medio = custoRaw ? Number(custoRaw) : null;
  const tamanhoRaw = formData.get("tamanho_embalagem") as string;
  const tamanho_embalagem = tamanhoRaw ? Number(tamanhoRaw) : null;

  const { error } = await supabase
    .from("insumos")
    .insert({ tenant_id, nome, categoria, unidade, estoque_atual, custo_medio, tamanho_embalagem });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/estoque-insumos");
}

export async function atualizarInsumo(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id") as string;
  const nome = formData.get("nome") as string;
  const categoria = formData.get("categoria") as string;
  const unidade = formData.get("unidade") as string;
  const estoque_atual = Number(formData.get("estoque_atual") || 0);
  const custoRaw = formData.get("custo_medio") as string;
  const custo_medio = custoRaw ? Number(custoRaw) : null;
  const tamanhoRaw = formData.get("tamanho_embalagem") as string;
  const tamanho_embalagem = tamanhoRaw ? Number(tamanhoRaw) : null;

  const { error } = await supabase
    .from("insumos")
    .update({ nome, categoria, unidade, estoque_atual, custo_medio, tamanho_embalagem })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/estoque-insumos");
}

export async function excluirInsumo(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;

  const { error } = await supabase.from("insumos").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/estoque-insumos");
}

export async function criarEntradaInsumo(formData: FormData) {
  const supabase = await createClient();
  const tenant_id = await getTenantId(supabase);

  const insumo_id = formData.get("insumo_id") as string;
  const quantidade = Number(formData.get("quantidade"));
  const custoRaw = formData.get("custo_total") as string;
  const custo_total = custoRaw ? Number(custoRaw) : null;
  const data = formData.get("data") as string;

  const { data: insumo, error: buscaError } = await supabase
    .from("insumos")
    .select("estoque_atual, custo_medio")
    .eq("id", insumo_id)
    .single();

  if (buscaError || !insumo) {
    throw new Error("Insumo não encontrado.");
  }

  const { error } = await supabase
    .from("movimentacoes_insumo")
    .insert({ tenant_id, insumo_id, tipo: "entrada", quantidade, custo_total, data });

  if (error) {
    throw new Error(error.message);
  }

  const estoqueAtual = Number(insumo.estoque_atual);
  const custoMedioAtual = Number(insumo.custo_medio ?? 0);
  const novoEstoque = estoqueAtual + quantidade;

  // Média ponderada: só recalcula se essa entrada informou um preço.
  const precoUnitarioNovo = custo_total != null ? custo_total / quantidade : null;
  const novoCustoMedio =
    precoUnitarioNovo != null
      ? (estoqueAtual * custoMedioAtual + quantidade * precoUnitarioNovo) / novoEstoque
      : custoMedioAtual;

  const { error: updateError } = await supabase
    .from("insumos")
    .update({ estoque_atual: novoEstoque, custo_medio: novoCustoMedio })
    .eq("id", insumo_id);

  if (updateError) {
    throw new Error(updateError.message);
  }

  revalidatePath("/estoque-insumos");
  revalidatePath("/estoque-insumos/movimentacoes");
}

export async function criarAplicacaoInsumo(formData: FormData) {
  const supabase = await createClient();
  const tenant_id = await getTenantId(supabase);

  const insumo_id = formData.get("insumo_id") as string;
  const talhao_id = formData.get("talhao_id") as string;
  const safra_id = (formData.get("safra_id") as string) || null;
  const quantidade = Number(formData.get("quantidade"));
  const custoRaw = formData.get("custo_total") as string;
  const custo_total = custoRaw ? Number(custoRaw) : null;
  const data = formData.get("data") as string;
  const etapa = (formData.get("etapa") as string) || null;

  const { data: insumo, error: buscaError } = await supabase
    .from("insumos")
    .select("estoque_atual")
    .eq("id", insumo_id)
    .single();

  if (buscaError || !insumo) {
    throw new Error("Insumo não encontrado.");
  }

  const { error } = await supabase.from("movimentacoes_insumo").insert({
    tenant_id,
    insumo_id,
    talhao_id,
    safra_id,
    tipo: "aplicacao",
    quantidade,
    custo_total,
    data,
    etapa,
  });

  if (error) {
    throw new Error(error.message);
  }

  const { error: updateError } = await supabase
    .from("insumos")
    .update({ estoque_atual: Number(insumo.estoque_atual) - quantidade })
    .eq("id", insumo_id);

  if (updateError) {
    throw new Error(updateError.message);
  }

  revalidatePath("/estoque-insumos");
  revalidatePath("/estoque-insumos/movimentacoes");
  if (safra_id) revalidatePath(`/safras/${safra_id}`);
}

type ItemAplicacao = { insumo_id: string; quantidade: number; quantidade_ha: number | null; custo_total: number | null };

export async function criarAplicacao(formData: FormData) {
  const supabase = await createClient();
  const tenant_id = await getTenantId(supabase);

  const talhao_id = formData.get("talhao_id") as string;
  const safra_id = (formData.get("safra_id") as string) || null;
  const etapa = (formData.get("etapa") as string) || null;
  const numero = Number(formData.get("numero") || 1);
  const data = formData.get("data") as string;
  const itensRaw = formData.get("itens") as string | null;
  const itens: ItemAplicacao[] = itensRaw ? JSON.parse(itensRaw) : [];

  if (!itens.length) {
    throw new Error("Adicione ao menos um insumo à aplicação.");
  }

  const { data: aplicacao, error: aplicacaoError } = await supabase
    .from("aplicacoes")
    .insert({ tenant_id, talhao_id, safra_id, etapa, numero, data })
    .select("id")
    .single();

  if (aplicacaoError || !aplicacao) {
    throw new Error(aplicacaoError?.message ?? "Não foi possível criar a aplicação.");
  }

  for (const item of itens) {
    const { data: insumo, error: buscaError } = await supabase
      .from("insumos")
      .select("estoque_atual")
      .eq("id", item.insumo_id)
      .single();

    if (buscaError || !insumo) {
      throw new Error("Insumo não encontrado.");
    }

    const { error } = await supabase.from("movimentacoes_insumo").insert({
      tenant_id,
      insumo_id: item.insumo_id,
      talhao_id,
      safra_id,
      etapa,
      aplicacao_id: aplicacao.id,
      tipo: "aplicacao",
      quantidade: item.quantidade,
      quantidade_ha: item.quantidade_ha,
      custo_total: item.custo_total,
      data,
    });

    if (error) {
      throw new Error(error.message);
    }

    const { error: updateError } = await supabase
      .from("insumos")
      .update({ estoque_atual: Number(insumo.estoque_atual) - item.quantidade })
      .eq("id", item.insumo_id);

    if (updateError) {
      throw new Error(updateError.message);
    }
  }

  revalidatePath("/estoque-insumos");
  revalidatePath("/estoque-insumos/movimentacoes");
  if (safra_id) revalidatePath(`/safras/${safra_id}`);
}

export async function excluirAplicacao(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;

  const { data: itens, error: itensError } = await supabase
    .from("movimentacoes_insumo")
    .select("insumo_id, quantidade")
    .eq("aplicacao_id", id);

  if (itensError) {
    throw new Error(itensError.message);
  }

  const { data: aplicacao } = await supabase.from("aplicacoes").select("safra_id").eq("id", id).single();

  const { error } = await supabase.from("aplicacoes").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  for (const item of itens ?? []) {
    const { data: insumo } = await supabase
      .from("insumos")
      .select("estoque_atual")
      .eq("id", item.insumo_id)
      .single();

    if (insumo) {
      await supabase
        .from("insumos")
        .update({ estoque_atual: Number(insumo.estoque_atual) + Number(item.quantidade) })
        .eq("id", item.insumo_id);
    }
  }

  revalidatePath("/estoque-insumos");
  revalidatePath("/estoque-insumos/movimentacoes");
  if (aplicacao?.safra_id) revalidatePath(`/safras/${aplicacao.safra_id}`);
}

export async function atualizarAplicacao(formData: FormData) {
  const supabase = await createClient();
  const tenant_id = await getTenantId(supabase);

  const id = formData.get("id") as string;
  const talhao_id = formData.get("talhao_id") as string;
  const safra_id = (formData.get("safra_id") as string) || null;
  const numero = Number(formData.get("numero") || 1);
  const data = formData.get("data") as string;
  const itensRaw = formData.get("itens") as string | null;
  const itens: ItemAplicacao[] = itensRaw ? JSON.parse(itensRaw) : [];

  if (!itens.length) {
    throw new Error("Adicione ao menos um insumo à aplicação.");
  }

  const { data: anterior } = await supabase.from("aplicacoes").select("safra_id").eq("id", id).single();

  const { data: itensAntigos, error: itensError } = await supabase
    .from("movimentacoes_insumo")
    .select("insumo_id, quantidade")
    .eq("aplicacao_id", id);

  if (itensError) {
    throw new Error(itensError.message);
  }

  // Devolve o estoque de todos os insumos da versão antiga antes de refazer.
  for (const item of itensAntigos ?? []) {
    const { data: insumo } = await supabase.from("insumos").select("estoque_atual").eq("id", item.insumo_id).single();
    if (insumo) {
      await supabase
        .from("insumos")
        .update({ estoque_atual: Number(insumo.estoque_atual) + Number(item.quantidade) })
        .eq("id", item.insumo_id);
    }
  }

  const { error: deleteError } = await supabase.from("movimentacoes_insumo").delete().eq("aplicacao_id", id);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  const { error: updateAplicacaoError } = await supabase
    .from("aplicacoes")
    .update({ talhao_id, safra_id, numero, data })
    .eq("id", id);

  if (updateAplicacaoError) {
    throw new Error(updateAplicacaoError.message);
  }

  const { data: aplicacaoAtual } = await supabase.from("aplicacoes").select("etapa").eq("id", id).single();

  for (const item of itens) {
    const { data: insumo, error: buscaError } = await supabase
      .from("insumos")
      .select("estoque_atual")
      .eq("id", item.insumo_id)
      .single();

    if (buscaError || !insumo) {
      throw new Error("Insumo não encontrado.");
    }

    const { error } = await supabase.from("movimentacoes_insumo").insert({
      tenant_id,
      insumo_id: item.insumo_id,
      talhao_id,
      safra_id,
      etapa: aplicacaoAtual?.etapa ?? null,
      aplicacao_id: id,
      tipo: "aplicacao",
      quantidade: item.quantidade,
      quantidade_ha: item.quantidade_ha,
      custo_total: item.custo_total,
      data,
    });

    if (error) {
      throw new Error(error.message);
    }

    const { error: updateError } = await supabase
      .from("insumos")
      .update({ estoque_atual: Number(insumo.estoque_atual) - item.quantidade })
      .eq("id", item.insumo_id);

    if (updateError) {
      throw new Error(updateError.message);
    }
  }

  revalidatePath("/estoque-insumos");
  revalidatePath("/estoque-insumos/movimentacoes");
  if (safra_id) revalidatePath(`/safras/${safra_id}`);
  if (anterior?.safra_id && anterior.safra_id !== safra_id) revalidatePath(`/safras/${anterior.safra_id}`);
}

export async function excluirMovimentacaoInsumo(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;

  const { data: atual, error: buscaError } = await supabase
    .from("movimentacoes_insumo")
    .select("insumo_id, tipo, quantidade, safra_id")
    .eq("id", id)
    .single();

  if (buscaError || !atual) {
    throw new Error("Movimentação não encontrada.");
  }

  const { data: insumo, error: insumoError } = await supabase
    .from("insumos")
    .select("estoque_atual")
    .eq("id", atual.insumo_id)
    .single();

  if (insumoError || !insumo) {
    throw new Error("Insumo não encontrado.");
  }

  const { error } = await supabase.from("movimentacoes_insumo").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  // Desfaz o efeito no estoque: entrada devolvida tira do estoque, saída/aplicação devolvida repõe.
  const delta = atual.tipo === "entrada" ? -atual.quantidade : atual.quantidade;

  const { error: updateError } = await supabase
    .from("insumos")
    .update({ estoque_atual: Number(insumo.estoque_atual) + delta })
    .eq("id", atual.insumo_id);

  if (updateError) {
    throw new Error(updateError.message);
  }

  revalidatePath("/estoque-insumos");
  revalidatePath("/estoque-insumos/movimentacoes");
  if (atual.safra_id) revalidatePath(`/safras/${atual.safra_id}`);
}
