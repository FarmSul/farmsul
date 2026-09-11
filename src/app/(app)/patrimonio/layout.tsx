"use client";

import { usePathname } from "next/navigation";
import { Tractor, ClipboardList, Wrench, Fuel } from "lucide-react";
import { PageBanner } from "@/components/ui/page-banner";
import { SectionTabs } from "./section-tabs";

const BANNERS = {
  "/patrimonio": {
    icon: ClipboardList,
    title: "Patrimônio",
    description: "Visão geral das máquinas, equipamentos e veículos da fazenda.",
    tags: ["Resumo"],
  },
  "/patrimonio/ativos": {
    icon: Tractor,
    title: "Patrimônio",
    description: "Máquinas, equipamentos e veículos cadastrados.",
    tags: ["Equipamentos"],
  },
  "/patrimonio/manutencao": {
    icon: Wrench,
    title: "Patrimônio",
    description: "Manutenções abertas para os equipamentos, com custo de mão de obra e peças.",
    tags: ["Manutenção"],
  },
  "/patrimonio/abastecimento": {
    icon: Fuel,
    title: "Patrimônio",
    description: "Abastecimentos de combustível por equipamento, com baixa automática no estoque.",
    tags: ["Combustível"],
  },
} as const;

export default function PatrimonioLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const banner = BANNERS[pathname as keyof typeof BANNERS] ?? BANNERS["/patrimonio"];

  return (
    <div>
      <PageBanner icon={banner.icon} title={banner.title} description={banner.description} tags={[...banner.tags]} />
      <SectionTabs />
      {children}
    </div>
  );
}
