import Link from "next/link";
import { type ReactNode } from "react";

const VARIANTS = {
  primary: "bg-primary text-primary-foreground hover:bg-primary-hover",
  white: "bg-white text-primary hover:bg-surface-hover",
} as const;

export function CtaLink({
  href,
  variant = "primary",
  className = "",
  children,
}: {
  href: string;
  variant?: keyof typeof VARIANTS;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}
