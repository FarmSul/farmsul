import Link from "next/link";
import { Leaf } from "lucide-react";
import { CtaLink } from "./cta-link";

const NAV_LINKS = [
  { href: "#funcionalidades", label: "Funcionalidades" },
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#contato", label: "Contato" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-6 sm:px-10">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Leaf className="h-4 w-4 text-primary-foreground" strokeWidth={2} />
          </div>
          <span className="text-base font-semibold tracking-tight text-foreground">FarmSul</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map(({ href, label }) => (
            <a key={href} href={href} className="text-sm font-medium text-foreground hover:text-primary">
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="hidden text-sm font-medium text-muted-foreground hover:text-foreground sm:block"
          >
            Entrar
          </Link>
          <CtaLink href="#contato">Solicitar acesso</CtaLink>
        </div>
      </div>
    </header>
  );
}
