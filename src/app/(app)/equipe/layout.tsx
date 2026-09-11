"use client";

import { usePathname } from "next/navigation";
import { Users, ShieldCheck } from "lucide-react";
import { PageBanner } from "@/components/ui/page-banner";
import { SectionTabs } from "./section-tabs";

const BANNERS = {
  "/equipe": {
    icon: Users,
    title: "Equipe",
    description: "Gerencie os colaboradores que fazem parte do seu tenant.",
  },
  "/equipe/perfis": {
    icon: ShieldCheck,
    title: "Perfis",
    description: "Cadastre os níveis de acesso atribuídos aos colaboradores.",
  },
} as const;

export default function EquipeLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const banner = BANNERS[pathname as keyof typeof BANNERS] ?? BANNERS["/equipe"];

  return (
    <div>
      <PageBanner icon={banner.icon} title={banner.title} description={banner.description} />
      <SectionTabs />
      {children}
    </div>
  );
}
