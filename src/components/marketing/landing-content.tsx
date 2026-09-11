import { MapPin, LandPlot, Sprout, Home, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CtaLink } from "./cta-link";

const STEPS = [
  {
    title: "Cadastre sua propriedade",
    description: "Adicione a fazenda com nome, área e localização.",
  },
  {
    title: "Organize os talhões",
    description: "Divida a propriedade em talhões e acompanhe cada área separadamente.",
  },
  {
    title: "Acompanhe as safras",
    description: "Registre o plantio, a cultura e a evolução de cada safra.",
  },
  {
    title: "Veja tudo no painel",
    description: "Propriedades, talhões e safras numa visão única.",
  },
];

const FEATURES = [
  {
    icon: MapPin,
    title: "Propriedades",
    description: "Cadastre e organize todas as suas fazendas em um só lugar, com área e localização.",
  },
  {
    icon: LandPlot,
    title: "Talhões",
    description: "Divida cada propriedade em talhões e controle cada área de cultivo separadamente.",
  },
  {
    icon: Sprout,
    title: "Safras",
    description: "Acompanhe o plantio, a cultura e o andamento de cada safra, talhão por talhão.",
  },
  {
    icon: Home,
    title: "Painel",
    description: "Visão geral de propriedades, talhões e safras sem abrir várias planilhas.",
  },
];

const TRUST_POINTS = [
  {
    title: "Suporte direto com quem desenvolve o produto",
    description: "Sem central de atendimento genérica — você fala com quem constrói o FarmSul.",
  },
  {
    title: "Evolução guiada pelo uso real no campo",
    description: "Cada funcionalidade nova nasce de uma necessidade de quem já usa.",
  },
  {
    title: "Sem letra miúda",
    description: "Você conversa com a gente antes de começar a usar.",
  },
];

export function LandingContent() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-6 py-20 sm:px-10 sm:py-24">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <Badge tone="primary">Acesso por convite</Badge>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Sua propriedade, os talhões e as safras — tudo em um só lugar.
            </h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-muted-foreground">
              O FarmSul organiza o cadastro das suas fazendas, o controle dos talhões e o acompanhamento das
              safras num painel simples, pensado pra quem toca a produção no dia a dia.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-6">
              <CtaLink href="#contato" className="px-6 py-3 text-[15px]">
                Solicitar acesso
              </CtaLink>
              <a href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Já tem acesso? Entrar →
              </a>
            </div>
          </div>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">Fazenda Exemplo</span>
              <Badge tone="primary">3 talhões</Badge>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2.5">
              <div className="rounded-lg bg-surface-hover p-3">
                <p className="text-[11px] text-muted-foreground">Propriedades</p>
                <p className="mt-0.5 text-lg font-bold text-foreground">1</p>
              </div>
              <div className="rounded-lg bg-surface-hover p-3">
                <p className="text-[11px] text-muted-foreground">Talhões</p>
                <p className="mt-0.5 text-lg font-bold text-foreground">3</p>
              </div>
              <div className="rounded-lg bg-surface-hover p-3">
                <p className="text-[11px] text-muted-foreground">Safra atual</p>
                <p className="mt-1 text-sm font-bold text-foreground">Soja 24/25</p>
              </div>
            </div>
            <div className="mt-5">
              <p className="mb-2.5 text-[11px] text-muted-foreground">Evolução da safra</p>
              <div className="flex h-18 items-end gap-2">
                {[35, 52, 68, 46, 84, 60].map((height, index) => (
                  <div
                    key={index}
                    className={`flex-1 rounded-t ${index === 2 || index === 4 ? "bg-primary" : "bg-primary-soft"}`}
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            </div>
            <p className="mt-4 border-t border-border pt-3.5 text-xs text-muted-foreground">
              Painel geral · atualizado hoje
            </p>
          </Card>
        </div>
      </section>

      <section id="como-funciona" className="border-y border-border bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:px-10">
          <div className="max-w-xl">
            <Badge tone="primary">Como funciona</Badge>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground">
              Do cadastro da fazenda ao acompanhamento da safra.
            </h2>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, index) => (
              <div key={step.title}>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-sm font-bold text-primary">
                  {index + 1}
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="funcionalidades" className="mx-auto max-w-6xl px-6 py-20 sm:px-10">
        <div className="max-w-xl">
          <Badge tone="primary">Funcionalidades</Badge>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground">
            O essencial da gestão da fazenda, sem planilha solta.
          </h2>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <Card key={title} className="p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <Icon className="h-5 w-5" strokeWidth={2} />
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-14 px-6 py-18 sm:px-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <Badge tone="primary">Como estamos hoje</Badge>
            <h2 className="mt-4 text-[28px] font-bold leading-tight tracking-tight text-foreground">
              Em acesso antecipado, feito com produtores do Sul do Brasil.
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
              O FarmSul está em fase inicial. Por isso o acesso ainda é por convite: assim conseguimos
              acompanhar de perto cada propriedade que entra e ajustar o sistema com quem usa no campo.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            {TRUST_POINTS.map((point) => (
              <div key={point.title} className="flex items-start gap-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <Check className="h-4 w-4" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-foreground">{point.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{point.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contato" className="bg-gradient-to-br from-banner-from to-banner-to">
        <div className="mx-auto max-w-2xl px-6 py-20 text-center sm:px-10">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Quer organizar a gestão da sua propriedade?
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/80">
            Conte pra gente um pouco sobre sua fazenda. Se fizer sentido pro momento do FarmSul, a gente
            libera seu acesso.
          </p>
          {/* TODO: aponte para o canal real de contato (mailto ou formulário) quando definido */}
          <CtaLink href="#" variant="white" className="mt-7 px-6 py-3 text-[15px]">
            Solicitar acesso
          </CtaLink>
        </div>
      </section>
    </>
  );
}
