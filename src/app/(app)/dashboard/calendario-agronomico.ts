export type FaseCalendario = {
  inicio: number;
  fim: number;
  titulo: string;
  descricao: string;
};

// Referência genérica de manejo por dias após o início da safra (DAS), pensada
// como estimativa de ponto de partida — varia por região, cultivar, clima e
// nível de infestação. Não substitui o acompanhamento agronômico da lavoura.
export const CALENDARIO_AGRONOMICO: Record<string, FaseCalendario[]> = {
  soja: [
    {
      inicio: 0,
      fim: 15,
      titulo: "Emergência e estande inicial",
      descricao: "Avaliar estande de plantas, falhas de germinação e primeira infestação de plantas daninhas.",
    },
    {
      inicio: 10,
      fim: 25,
      titulo: "Controle de plantas daninhas",
      descricao: "Janela típica da 1ª aplicação de herbicida em pós-emergência, antes do fechamento das entrelinhas.",
    },
    {
      inicio: 20,
      fim: 45,
      titulo: "Lagartas e percevejos iniciais",
      descricao: "Período de maior pressão de lagartas desfolhadoras. Monitore semanalmente com pano de batida.",
    },
    {
      inicio: 40,
      fim: 65,
      titulo: "Ferrugem asiática e fungicidas",
      descricao: "A partir do florescimento (R1), avaliar necessidade de aplicação preventiva de fungicida.",
    },
    {
      inicio: 60,
      fim: 95,
      titulo: "Enchimento de grãos e percevejos",
      descricao: "Monitorar percevejos sugadores de grãos (R3–R6) — período crítico para produtividade e qualidade.",
    },
    {
      inicio: 105,
      fim: 145,
      titulo: "Maturação e colheita",
      descricao: "Janela de colheita varia conforme o grupo de maturação da cultivar.",
    },
  ],
  milho: [
    {
      inicio: 0,
      fim: 25,
      titulo: "Controle de lagarta-do-cartucho",
      descricao: "Janela crítica de monitoramento e controle de Spodoptera frugiperda logo após a emergência.",
    },
    {
      inicio: 20,
      fim: 40,
      titulo: "Adubação de cobertura (nitrogênio)",
      descricao: "Época típica da aplicação de cobertura nitrogenada, geralmente entre os estádios V4 e V8.",
    },
    {
      inicio: 40,
      fim: 70,
      titulo: "Doenças foliares",
      descricao: "Monitorar cercosporiose, ferrugens e outras doenças foliares, sobretudo em anos mais chuvosos.",
    },
    {
      inicio: 60,
      fim: 95,
      titulo: "Pragas de espiga e percevejos",
      descricao: "Atenção a lagartas de espiga e percevejos durante o florescimento e enchimento de grãos.",
    },
    {
      inicio: 135,
      fim: 165,
      titulo: "Colheita",
      descricao: "Janela de colheita varia conforme o ciclo do híbrido (precoce, normal ou tardio).",
    },
  ],
};

export function culturaTemCalendario(cultura: string): boolean {
  return cultura in CALENDARIO_AGRONOMICO;
}
