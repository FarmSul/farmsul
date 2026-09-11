"use client";

import { useState } from "react";
import { FieldGroup, Input, Select } from "@/components/ui/field";

function arredondar(valor: number, casas: number) {
  const fator = 10 ** casas;
  return Math.round(valor * fator) / fator;
}

export function InsumoFormFields({
  idPrefix = "",
  defaultNome = "",
  defaultCategoria = "fertilizante",
  defaultUnidade = "kg",
  defaultEstoqueAtual = "",
  defaultCustoMedio = "",
  defaultTamanhoEmbalagem = "",
}: {
  idPrefix?: string;
  defaultNome?: string;
  defaultCategoria?: string;
  defaultUnidade?: string;
  defaultEstoqueAtual?: string | number;
  defaultCustoMedio?: string | number;
  defaultTamanhoEmbalagem?: string | number;
}) {
  const [unidade, setUnidade] = useState(defaultUnidade);
  const [estoqueAtual, setEstoqueAtual] = useState(Number(defaultEstoqueAtual) || 0);
  const [custoMedio, setCustoMedio] = useState(Number(defaultCustoMedio) || 0);
  const [valorTotal, setValorTotal] = useState(arredondar((Number(defaultEstoqueAtual) || 0) * (Number(defaultCustoMedio) || 0), 2));
  const [tamanhoEmbalagem, setTamanhoEmbalagem] = useState(Number(defaultTamanhoEmbalagem) || 0);
  const [qtdEmbalagens, setQtdEmbalagens] = useState(() => {
    const tamanho = Number(defaultTamanhoEmbalagem) || 0;
    const estoque = Number(defaultEstoqueAtual) || 0;
    return tamanho > 0 ? arredondar(estoque / tamanho, 2) : 0;
  });

  function alterarEstoque(valor: number) {
    setEstoqueAtual(valor);
    setValorTotal(arredondar(valor * custoMedio, 2));
  }

  function alterarTamanhoEmbalagem(valor: number) {
    setTamanhoEmbalagem(valor);
    if (valor > 0 && qtdEmbalagens > 0) {
      alterarEstoque(arredondar(valor * qtdEmbalagens, 2));
    }
  }

  function alterarQtdEmbalagens(valor: number) {
    setQtdEmbalagens(valor);
    if (tamanhoEmbalagem > 0) {
      alterarEstoque(arredondar(tamanhoEmbalagem * valor, 2));
    }
  }

  function alterarCustoMedio(valor: number) {
    setCustoMedio(valor);
    setValorTotal(arredondar(estoqueAtual * valor, 2));
  }

  function alterarValorTotal(valor: number) {
    setValorTotal(valor);
    if (estoqueAtual > 0) {
      setCustoMedio(arredondar(valor / estoqueAtual, 4));
    }
  }

  return (
    <>
      <FieldGroup label="Nome" htmlFor={`${idPrefix}nome-insumo`}>
        <Input
          id={`${idPrefix}nome-insumo`}
          name="nome"
          placeholder="Ureia, semente de soja..."
          defaultValue={defaultNome}
          required
        />
      </FieldGroup>

      <div className="grid grid-cols-2 gap-4">
        <FieldGroup label="Categoria" htmlFor={`${idPrefix}categoria-insumo`}>
          <Select id={`${idPrefix}categoria-insumo`} name="categoria" defaultValue={defaultCategoria}>
            <option value="semente">Semente</option>
            <option value="fertilizante">Fertilizante</option>
            <option value="defensivo">Defensivo (herbicida, pesticida, foliar...)</option>
            <option value="corretivo">Corretivo (calcário, gesso, cama de frango...)</option>
            <option value="combustivel">Combustível</option>
            <option value="outro">Outro</option>
          </Select>
        </FieldGroup>
        <FieldGroup label="Unidade" htmlFor={`${idPrefix}unidade-insumo`}>
          <Select
            id={`${idPrefix}unidade-insumo`}
            name="unidade"
            value={unidade}
            onChange={(e) => setUnidade(e.target.value)}
          >
            <option value="kg">kg</option>
            <option value="l">L</option>
            <option value="saca">saca</option>
            <option value="un">unidade</option>
          </Select>
        </FieldGroup>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FieldGroup
          label={`Tamanho da embalagem (opcional, ${unidade})`}
          htmlFor={`${idPrefix}tamanho-embalagem-insumo`}
        >
          <Input
            id={`${idPrefix}tamanho-embalagem-insumo`}
            name="tamanho_embalagem"
            type="number"
            step="0.01"
            min="0"
            placeholder="ex: 20"
            value={tamanhoEmbalagem || ""}
            onChange={(e) => alterarTamanhoEmbalagem(Number(e.target.value) || 0)}
          />
        </FieldGroup>
        <FieldGroup label="Quantidade de embalagens" htmlFor={`${idPrefix}qtd-embalagens-insumo`}>
          <Input
            id={`${idPrefix}qtd-embalagens-insumo`}
            type="number"
            step="0.01"
            min="0"
            placeholder="ex: 4"
            value={qtdEmbalagens || ""}
            onChange={(e) => alterarQtdEmbalagens(Number(e.target.value) || 0)}
          />
        </FieldGroup>
      </div>
      <p className="-mt-2 text-xs text-muted-foreground">
        Se o produto vem em embalagem fechada (galão, saco), preencha o tamanho de cada uma e quantas você tem —
        o estoque atual abaixo é calculado automaticamente.
      </p>

      <FieldGroup label="Estoque atual" htmlFor={`${idPrefix}estoque-insumo`}>
        <Input
          id={`${idPrefix}estoque-insumo`}
          name="estoque_atual"
          type="number"
          step="0.01"
          min="0"
          placeholder="0"
          value={estoqueAtual || ""}
          onChange={(e) => alterarEstoque(Number(e.target.value) || 0)}
        />
      </FieldGroup>

      <div className="grid grid-cols-2 gap-4">
        <FieldGroup label={`Valor por ${unidade} (R$, opcional)`} htmlFor={`${idPrefix}custo-insumo`}>
          <Input
            id={`${idPrefix}custo-insumo`}
            name="custo_medio"
            type="number"
            step="0.0001"
            min="0"
            placeholder="0,00"
            value={custoMedio || ""}
            onChange={(e) => alterarCustoMedio(Number(e.target.value) || 0)}
          />
        </FieldGroup>
        <FieldGroup label="Valor total (R$, opcional)" htmlFor={`${idPrefix}valor-total-insumo`}>
          <Input
            id={`${idPrefix}valor-total-insumo`}
            type="number"
            step="0.01"
            min="0"
            placeholder="0,00"
            value={valorTotal || ""}
            onChange={(e) => alterarValorTotal(Number(e.target.value) || 0)}
          />
        </FieldGroup>
      </div>
      <p className="-mt-2 text-xs text-muted-foreground">
        Preencha um dos dois — o outro é calculado automaticamente a partir do estoque atual.
      </p>
    </>
  );
}
