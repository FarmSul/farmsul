"use client";

import { type ReactNode } from "react";

export function ConfirmButton({
  confirmText,
  className,
  title,
  children,
}: {
  confirmText: string;
  className?: string;
  title?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="submit"
      title={title}
      className={className}
      onClick={(e) => {
        if (!window.confirm(confirmText)) {
          e.preventDefault();
        }
      }}
    >
      {children}
    </button>
  );
}
