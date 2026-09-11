"use client";

import { usePathname } from "next/navigation";
import { Database, ArrowLeftRight } from "lucide-react";
import { PageBanner } from "@/components/ui/page-banner";
import { SectionTabs } from "./section-tabs";

const BANNERS = {
  "/estoque-insumos": {
    icon: Database,
    title: "Estoque de Insumos",
    description: "Sementes, fertilizantes, defensivos e combustível disponíveis.",
    tags: ["Insumos", "Estoque"],
  },
  "/estoque-insumos/movimentacoes": {
    icon: ArrowLeftRight,
    title: "Estoque de Insumos",
    description: "Entradas (compras) e aplicações por talhão e safra.",
    tags: ["Movimentações"],
  },
} as const;

export default function EstoqueInsumosLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const banner = BANNERS[pathname as keyof typeof BANNERS] ?? BANNERS["/estoque-insumos"];

  return (
    <div>
      <PageBanner icon={banner.icon} title={banner.title} description={banner.description} tags={[...banner.tags]} />
      <SectionTabs />
      {children}
    </div>
  );
}
