"use client";

import { useRef, useState, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AlertTriangle } from "lucide-react";

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
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  function confirmar() {
    setOpen(false);
    triggerRef.current?.closest("form")?.requestSubmit();
  }

  return (
    <>
      <button ref={triggerRef} type="button" title={title} className={className} onClick={() => setOpen(true)}>
        {children}
      </button>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/40 data-[state=open]:[animation:overlay-in_150ms_var(--ease-out-3)]" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-[60] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-surface p-5 shadow-[var(--shadow-4)] focus:outline-none data-[state=open]:[animation:modal-in_200ms_var(--ease-out-4)]">
            <div className="mb-5 flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-danger-soft text-danger">
                <AlertTriangle className="h-4.5 w-4.5" />
              </span>
              <Dialog.Title className="pt-1.5 text-sm text-foreground">{confirmText}</Dialog.Title>
            </div>
            <div className="flex justify-end gap-2">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover"
                >
                  Cancelar
                </button>
              </Dialog.Close>
              <button
                type="button"
                onClick={confirmar}
                className="rounded-lg bg-danger px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-danger-hover"
              >
                Excluir
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
