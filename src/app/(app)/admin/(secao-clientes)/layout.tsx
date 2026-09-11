"use client";

import { usePathname } from "next/navigation";
import { Building2, Users } from "lucide-react";
import { PageBanner } from "@/components/ui/page-banner";
import { SectionTabs } from "./section-tabs";

const BANNERS = {
  "/admin/clientes": {
    icon: Building2,
    title: "Clientes",
    description: "Carteira completa de clientes da plataforma, com plano contratado e uso.",
    tags: ["Clientes", "Planos", "Receita"],
  },
  "/admin/usuarios": {
    icon: Users,
    title: "Usuários das Empresas",
    description: "Todas as pessoas com acesso a alguma fazenda, em qualquer cliente.",
    tags: ["Usuários", "Clientes"],
  },
} as const;

export default function SecaoClientesLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const banner = BANNERS[pathname as keyof typeof BANNERS] ?? BANNERS["/admin/clientes"];

  return (
    <div>
      <PageBanner icon={banner.icon} title={banner.title} description={banner.description} tags={[...banner.tags]} />
      <SectionTabs />
      {children}
    </div>
  );
}
