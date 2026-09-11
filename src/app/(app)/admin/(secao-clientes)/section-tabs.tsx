"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const TABS = [
  { key: "lista", href: "/admin/clientes", label: "Lista" },
  { key: "usuarios", href: "/admin/usuarios", label: "Usuários das Empresas" },
  { key: "contatos", href: null, label: "Contatos" },
];

export function SectionTabs() {
  const pathname = usePathname();
  const current = TABS.find((t) => t.href === pathname)?.key ?? "lista";

  const triggerRefs = useRef<Record<string, HTMLElement | null>>({});
  const [indicator, setIndicator] = useState<{ left: number; width: number }>({ left: 0, width: 0 });

  useEffect(() => {
    const el = triggerRefs.current[current];
    if (el) {
      setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
    }
  }, [current]);

  return (
    <div className="relative mb-6 flex gap-6 overflow-x-auto border-b border-border/50">
      {TABS.map((tab) => {
        if (!tab.href) {
          return (
            <span
              key={tab.key}
              ref={(el) => {
                triggerRefs.current[tab.key] = el;
              }}
              title="Em breve"
              className="shrink-0 cursor-not-allowed whitespace-nowrap px-0.5 pb-3 text-sm font-medium text-muted-foreground/40"
            >
              {tab.label}
            </span>
          );
        }

        const active = tab.key === current;
        return (
          <Link
            key={tab.key}
            ref={(el) => {
              triggerRefs.current[tab.key] = el;
            }}
            href={tab.href}
            className={`shrink-0 whitespace-nowrap px-0.5 pb-3 text-sm font-medium transition-colors ${
              active ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
      <span
        className="absolute bottom-0 h-px bg-primary transition-[left,width] duration-[220ms]"
        style={{ left: indicator.left, width: indicator.width, transitionTimingFunction: "var(--ease-out-3)" }}
      />
    </div>
  );
}
