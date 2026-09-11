"use client";

import { usePathname } from "next/navigation";
import { CloudRain, Thermometer, ClipboardList } from "lucide-react";
import { PageBanner } from "@/components/ui/page-banner";
import { SectionTabs } from "./section-tabs";

const BANNERS = {
  "/registros": {
    icon: CloudRain,
    title: "Registros climáticos",
    description: "Chuvas e leituras das estações da fazenda, com previsão do tempo.",
    tags: ["Clima"],
  },
  "/registros/estacoes": {
    icon: Thermometer,
    title: "Registros climáticos",
    description: "Pluviômetros e estações meteorológicas cadastrados.",
    tags: ["Estações"],
  },
  "/registros/leituras": {
    icon: ClipboardList,
    title: "Registros climáticos",
    description: "Leituras manuais de chuva, temperatura, umidade e pressão.",
    tags: ["Leituras"],
  },
} as const;

export default function RegistrosLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const banner = BANNERS[pathname as keyof typeof BANNERS] ?? BANNERS["/registros"];

  return (
    <div>
      <PageBanner icon={banner.icon} title={banner.title} description={banner.description} tags={[...banner.tags]} />
      <SectionTabs />
      {children}
    </div>
  );
}
