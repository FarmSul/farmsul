"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode, type ComponentType } from "react";
import {
  Sprout,
  LogOut,
  Menu,
  X,
  Leaf,
  ShieldCheck,
  Building2,
  Layers,
  Wallet,
  Home,
  Users,
  Tractor,
  Banknote,
  FileCheck2,
  FileSignature,
  Beef,
  CloudRain,
  Database,
  Warehouse,
  Settings,
  MapPin,
  LandPlot,
  Store,
  ChevronRight,
} from "lucide-react";
import { logout } from "@/app/(app)/dashboard/actions";
import { Avatar } from "@/components/ui/avatar";
import { ProfileModal } from "@/components/profile-modal";

type IconType = ComponentType<{ className?: string; strokeWidth?: number }>;
type LeafItem = { href: string; label: string; icon: IconType; match?: string[] };
type GroupItem = { label: string; icon: IconType; children: LeafItem[] };

const TENANT_NAV_ITEMS: LeafItem[] = [
  { href: "/dashboard", label: "Início", icon: Home },
  { href: "/safras", label: "Safras", icon: Sprout },
  {
    href: "/patrimonio",
    label: "Patrimônio",
    icon: Tractor,
    match: ["/patrimonio", "/patrimonio/ativos", "/patrimonio/manutencao", "/patrimonio/abastecimento"],
  },
  { href: "/financeiro", label: "Financeiro", icon: Banknote },
  { href: "/fiscal", label: "Fiscal", icon: FileCheck2 },
  { href: "/contratos", label: "Contratos", icon: FileSignature },
  { href: "/pecuaria", label: "Pecuária", icon: Beef },
  {
    href: "/registros",
    label: "Registros",
    icon: CloudRain,
    match: ["/registros", "/registros/estacoes", "/registros/leituras"],
  },
  { href: "/estoque-insumos", label: "Estq. Insumos", icon: Database },
  { href: "/estoque-producao", label: "Estq. Produção", icon: Warehouse },
];

const TENANT_SISTEMA_ITEM: LeafItem = { href: "/configuracoes", label: "Configurações", icon: Settings };

const TENANT_GESTAO_GROUP: GroupItem = {
  label: "Gestão",
  icon: Store,
  children: [
    { href: "/equipe", label: "Equipe", icon: Users, match: ["/equipe", "/equipe/perfis"] },
    { href: "/propriedades", label: "Propriedades", icon: MapPin },
    { href: "/talhoes", label: "Talhões", icon: LandPlot },
  ],
};

const ADMIN_NAV_ITEMS: LeafItem[] = [
  { href: "/admin", label: "Início", icon: Home, match: ["/admin"] },
  { href: "/admin/clientes", label: "Clientes", icon: Building2, match: ["/admin/clientes", "/admin/usuarios"] },
  { href: "/admin/equipe", label: "Usuários internos", icon: ShieldCheck, match: ["/admin/equipe"] },
  { href: "/admin/planos", label: "Planos", icon: Layers, match: ["/admin/planos"] },
  { href: "/admin/financeiro", label: "Financeiro", icon: Wallet, match: ["/admin/financeiro"] },
];

function NavLeaf({
  item,
  pathname,
  onNavigate,
}: {
  item: LeafItem;
  pathname: string;
  onNavigate?: () => void;
}) {
  const active = (item.match ?? [item.href]).includes(pathname);
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-primary-soft text-primary"
          : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
      }`}
    >
      <item.icon className="h-[18px] w-[18px]" strokeWidth={2} />
      {item.label}
    </Link>
  );
}

function NavGroup({
  item,
  pathname,
  onNavigate,
}: {
  item: GroupItem;
  pathname: string;
  onNavigate?: () => void;
}) {
  const childActive = item.children.some((c) => (c.match ?? [c.href]).includes(pathname));
  const [open, setOpen] = useState(childActive);

  useEffect(() => {
    if (childActive) setOpen(true);
  }, [childActive]);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          childActive
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
        }`}
      >
        <item.icon className="h-[18px] w-[18px]" strokeWidth={2} />
        <span className="flex-1 text-left">{item.label}</span>
        <ChevronRight className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-90" : ""}`} />
      </button>

      {open && (
        <div className="ml-[26px] mt-1 flex flex-col gap-1 border-l border-border pl-3">
          {item.children.map((child) => {
            const active = (child.match ?? [child.href]).includes(pathname);
            return (
              <Link
                key={child.href}
                href={child.href}
                onClick={onNavigate}
                className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors ${
                  active
                    ? "bg-primary-soft font-medium text-primary"
                    : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                }`}
              >
                <child.icon className="h-4 w-4" strokeWidth={2} />
                {child.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function NavLinks({ isAdmin, onNavigate }: { isAdmin: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();

  if (isAdmin) {
    return (
      <nav className="flex flex-col gap-1">
        {ADMIN_NAV_ITEMS.map((item) => (
          <NavLeaf key={item.href} item={item} pathname={pathname} onNavigate={onNavigate} />
        ))}
      </nav>
    );
  }

  return (
    <nav className="flex flex-col gap-1">
      {TENANT_NAV_ITEMS.map((item) => (
        <NavLeaf key={item.href} item={item} pathname={pathname} onNavigate={onNavigate} />
      ))}

      <p className="mb-1 mt-4 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground/70">
        Sistema
      </p>
      <NavLeaf item={TENANT_SISTEMA_ITEM} pathname={pathname} onNavigate={onNavigate} />
      <NavGroup item={TENANT_GESTAO_GROUP} pathname={pathname} onNavigate={onNavigate} />
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2 px-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
        <Leaf className="h-[18px] w-[18px] text-primary-foreground" strokeWidth={2} />
      </div>
      <span className="text-base font-semibold tracking-tight text-foreground">FarmSul</span>
    </div>
  );
}

function UserFooter({
  nome,
  papel,
  email,
  telefone,
  avatarUrl,
  isAdmin,
}: {
  nome: string;
  papel: string;
  email: string;
  telefone: string | null;
  avatarUrl: string | null;
  isAdmin: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2 border-t border-border px-3 pt-4">
      <ProfileModal
        nome={nome}
        email={email}
        telefone={telefone}
        avatarUrl={avatarUrl}
        trigger={
          <button
            type="button"
            className="flex min-w-0 flex-1 items-center gap-2 rounded-lg py-1 text-left hover:bg-surface-hover"
          >
            <Avatar name={nome} src={avatarUrl} size="sm" />
            <span className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{nome}</p>
              <p className="truncate text-xs capitalize text-muted-foreground">
                {isAdmin ? "Admin FarmSul" : papel}
              </p>
            </span>
          </button>
        }
      />
      <form action={logout}>
        <button
          type="submit"
          title="Sair"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-danger-soft hover:text-danger"
        >
          <LogOut className="h-[18px] w-[18px]" strokeWidth={2} />
        </button>
      </form>
    </div>
  );
}

export function AppShell({
  nome,
  papel,
  email = "",
  telefone = null,
  avatarUrl = null,
  isAdmin = false,
  children,
}: {
  nome: string;
  papel: string;
  email?: string;
  telefone?: string | null;
  avatarUrl?: string | null;
  isAdmin?: boolean;
  children: ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* topbar mobile */}
      <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 md:hidden">
        <Brand />
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground hover:bg-surface-hover"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* backdrop mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col gap-6 border-r border-border bg-surface p-4 transition-transform md:static md:z-auto md:flex md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between">
          <Brand />
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-surface-hover md:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <NavLinks isAdmin={isAdmin} onNavigate={() => setMobileOpen(false)} />

        <div className="mt-auto">
          <UserFooter
            nome={nome}
            papel={papel}
            email={email}
            telefone={telefone}
            avatarUrl={avatarUrl}
            isAdmin={isAdmin}
          />
        </div>
      </aside>

      <main className="flex-1 px-4 py-8 md:px-8">
        <div className="max-w-[1600px]">{children}</div>
      </main>
    </div>
  );
}
