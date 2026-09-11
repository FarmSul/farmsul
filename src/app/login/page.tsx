import { Leaf, Sprout, MapPin, LandPlot } from "lucide-react";
import { login } from "./actions";
import { Button } from "@/components/ui/button";
import { FieldGroup, Input } from "@/components/ui/field";

const HIGHLIGHTS = [
  { icon: MapPin, text: "Propriedades, talhões e safras em um só lugar" },
  { icon: Sprout, text: "Controle de insumos e aplicações por talhão" },
  { icon: LandPlot, text: "Visão financeira por safra e propriedade" },
];

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string; mensagem?: string }>;
}) {
  const { erro, mensagem } = await searchParams;

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-primary p-12 text-primary-foreground lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 60% 70%, white 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="relative flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
            <Leaf className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">FarmSul</span>
        </div>

        <div className="relative flex flex-col gap-8">
          <h1 className="max-w-md text-3xl font-semibold leading-tight tracking-tight">
            Gestão completa da sua fazenda, em um só sistema.
          </h1>
          <ul className="flex flex-col gap-4">
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-white/90">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15">
                  <Icon className="h-4 w-4" strokeWidth={2} />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-white/60">
          © {new Date().getFullYear()} FarmSul
        </p>
      </div>

      <div className="flex w-full flex-1 items-center justify-center bg-background px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Leaf className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-foreground">FarmSul</span>
          </div>

          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Entrar</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Acesse o painel da sua fazenda.
          </p>

          {erro && (
            <p className="mt-6 rounded-lg bg-danger-soft px-3 py-2.5 text-sm text-danger">
              {erro}
            </p>
          )}

          {mensagem && (
            <p className="mt-6 rounded-lg bg-primary-soft px-3 py-2.5 text-sm text-primary">
              {mensagem}
            </p>
          )}

          <form action={login} className="mt-8 flex flex-col gap-4">
            <FieldGroup label="E-mail" htmlFor="email">
              <Input id="email" name="email" type="email" autoComplete="email" required />
            </FieldGroup>

            <FieldGroup label="Senha" htmlFor="password">
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </FieldGroup>

            <Button type="submit" className="mt-2 w-full">
              Entrar
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
