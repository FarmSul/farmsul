import { Leaf } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:px-10">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                <Leaf className="h-3.5 w-3.5 text-primary-foreground" strokeWidth={2} />
              </div>
              <span className="text-sm font-semibold tracking-tight text-foreground">FarmSul</span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Gestão de propriedades, talhões e safras — simples assim.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Produto</p>
            <div className="mt-3 flex flex-col gap-2">
              <a href="#funcionalidades" className="text-sm text-foreground hover:text-primary">
                Funcionalidades
              </a>
              <a href="#como-funciona" className="text-sm text-foreground hover:text-primary">
                Como funciona
              </a>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Contato</p>
            <div className="mt-3 flex flex-col gap-2">
              <a href="#" className="text-sm text-foreground hover:text-primary">
                [contato@farmsul.com.br]
              </a>
              <a href="#" className="text-sm text-foreground hover:text-primary">
                [Instagram]
              </a>
              <a href="#" className="text-sm text-foreground hover:text-primary">
                [LinkedIn]
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <span className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} FarmSul. Todos os direitos reservados.
          </span>
          <Badge tone="primary">Acesso por convite</Badge>
        </div>
      </div>
    </footer>
  );
}
