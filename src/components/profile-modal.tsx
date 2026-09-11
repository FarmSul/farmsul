"use client";

import * as Dialog from "@radix-ui/react-dialog";
import * as Tabs from "@radix-ui/react-tabs";
import { X, Camera, UserRound, Lock, Mail, Eye, EyeOff, TriangleAlert, Info } from "lucide-react";
import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { Avatar } from "@/components/ui/avatar";
import { FieldGroup, Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { atualizarPerfil, trocarSenha, atualizarEmail } from "@/app/(app)/perfil/actions";

const TABS = [
  { value: "dados", label: "Dados", icon: UserRound },
  { value: "senha", label: "Senha", icon: Lock },
  { value: "email", label: "E-mail", icon: Mail },
];

function AnimatedTabsList({ value }: { value: string }) {
  const listRef = useRef<HTMLDivElement>(null);
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicator, setIndicator] = useState<{ left: number; width: number }>({ left: 0, width: 0 });

  useEffect(() => {
    const el = triggerRefs.current[value];
    if (el) {
      setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
    }
  }, [value]);

  return (
    <Tabs.List ref={listRef} className="relative mb-5 flex gap-5 border-b border-border/50">
      {TABS.map(({ value: tabValue, label, icon: Icon }) => (
        <Tabs.Trigger
          key={tabValue}
          ref={(el) => {
            triggerRefs.current[tabValue] = el;
          }}
          value={tabValue}
          className="flex items-center gap-1.5 px-1 pb-2 text-sm font-medium text-muted-foreground transition-colors data-[state=active]:text-primary"
        >
          <Icon className="h-4 w-4" />
          {label}
        </Tabs.Trigger>
      ))}
      <span
        className="absolute bottom-0 h-px bg-primary transition-[left,width] duration-[220ms]"
        style={{ left: indicator.left, width: indicator.width, transitionTimingFunction: "var(--ease-out-3)" }}
      />
    </Tabs.List>
  );
}

function DadosTab({ nome, email, telefone, avatarUrl }: { nome: string; email: string; telefone: string | null; avatarUrl: string | null }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setErro(null);
        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
          try {
            await atualizarPerfil(formData);
          } catch (err) {
            setErro(err instanceof Error ? err.message : "Erro ao salvar perfil");
          }
        });
      }}
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col items-center gap-2 py-2">
        <div className="relative">
          <Avatar name={nome} src={preview ?? avatarUrl} size="xl" />
          <label
            htmlFor="foto"
            className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-border bg-primary text-primary-foreground hover:bg-primary-hover"
            title="Trocar foto"
          >
            <Camera className="h-4 w-4" />
          </label>
          <input
            id="foto"
            name="foto"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setPreview(URL.createObjectURL(file));
            }}
          />
        </div>
        <label htmlFor="foto" className="cursor-pointer text-sm font-medium text-primary hover:underline">
          Alterar foto
        </label>
        <p className="text-xs text-muted-foreground">PNG, JPG ou WebP · até 2MB</p>
      </div>

      <FieldGroup label="Nome completo" htmlFor="nome_completo">
        <Input id="nome_completo" name="nome_completo" defaultValue={nome} required />
      </FieldGroup>

      <FieldGroup label="E-mail" htmlFor="email_readonly">
        <Input id="email_readonly" value={email} disabled className="opacity-60" />
      </FieldGroup>
      <p className="-mt-3 text-xs text-muted-foreground">Para alterar o e-mail, use a aba &quot;E-mail&quot;.</p>

      <FieldGroup label="Telefone / WhatsApp" htmlFor="telefone">
        <Input id="telefone" name="telefone" defaultValue={telefone ?? ""} placeholder="(67) 99999-9999" />
      </FieldGroup>

      {erro && <p className="text-sm text-danger">{erro}</p>}

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Salvar alterações"}
        </Button>
      </div>
    </form>
  );
}

function SenhaTab() {
  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [mostrar, setMostrar] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setErro(null);
        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
          try {
            await trocarSenha(formData);
            window.location.href = "/login?mensagem=Senha alterada. Entre novamente.";
          } catch (err) {
            setErro(err instanceof Error ? err.message : "Erro ao trocar senha");
          }
        });
      }}
      className="flex flex-col gap-4"
    >
      <p className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2.5 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-300">
        <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
        Após alterar a senha você será desconectado e precisará fazer login novamente.
      </p>

      <FieldGroup label="Nova senha" htmlFor="nova_senha">
        <div className="relative">
          <Input
            id="nova_senha"
            name="nova_senha"
            type={mostrar ? "text" : "password"}
            minLength={8}
            placeholder="Mínimo 8 caracteres"
            required
            className="pr-16"
          />
          <button
            type="button"
            onClick={() => setMostrar((v) => !v)}
            className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            {mostrar ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {mostrar ? "Ocultar" : "Mostrar"}
          </button>
        </div>
      </FieldGroup>

      <FieldGroup label="Confirmar nova senha" htmlFor="confirmar_senha">
        <Input
          id="confirmar_senha"
          name="confirmar_senha"
          type={mostrar ? "text" : "password"}
          minLength={8}
          placeholder="Repita a nova senha"
          required
        />
      </FieldGroup>

      {erro && <p className="text-sm text-danger">{erro}</p>}

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Alterar senha"}
        </Button>
      </div>
    </form>
  );
}

function EmailTab({ email }: { email: string }) {
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setErro(null);
        setSucesso(false);
        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
          try {
            await atualizarEmail(formData);
            setSucesso(true);
          } catch (err) {
            setErro(err instanceof Error ? err.message : "Erro ao solicitar troca de e-mail");
          }
        });
      }}
      className="flex flex-col gap-4"
    >
      <p className="flex items-start gap-2 rounded-lg bg-primary-soft px-3 py-2.5 text-sm text-primary">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          <strong>Como funciona:</strong> informe o novo e-mail abaixo. Enviaremos um link de confirmação
          pra esse endereço — a troca só é feita depois que você clicar nele.
        </span>
      </p>

      <FieldGroup label="E-mail atual" htmlFor="email_atual">
        <Input id="email_atual" value={email} disabled className="opacity-60" />
      </FieldGroup>

      <FieldGroup label="Novo e-mail" htmlFor="novo_email">
        <Input id="novo_email" name="novo_email" type="email" placeholder="seuemail@exemplo.com.br" required />
      </FieldGroup>

      {erro && <p className="text-sm text-danger">{erro}</p>}
      {sucesso && (
        <p className="text-sm text-primary">
          Link de confirmação enviado. Verifique a caixa de entrada do novo e-mail.
        </p>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Enviando..." : "Enviar link de confirmação"}
        </Button>
      </div>
    </form>
  );
}

export function ProfileModal({
  trigger,
  nome,
  email,
  telefone,
  avatarUrl,
}: {
  trigger: ReactNode;
  nome: string;
  email: string;
  telefone: string | null;
  avatarUrl: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [tabValue, setTabValue] = useState("dados");

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 data-[state=open]:[animation:overlay-in_150ms_var(--ease-out-3)]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-border bg-surface p-6 shadow-[var(--shadow-4)] focus:outline-none data-[state=open]:[animation:modal-in_200ms_var(--ease-out-4)]">
          <div className="mb-4 flex items-start justify-between gap-4">
            <Dialog.Title className="text-lg font-semibold text-foreground">Meu perfil</Dialog.Title>
            <Dialog.Close className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-surface-hover hover:text-foreground">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          <Tabs.Root value={tabValue} onValueChange={setTabValue}>
            <AnimatedTabsList value={tabValue} />

            <Tabs.Content value="dados">
              <DadosTab nome={nome} email={email} telefone={telefone} avatarUrl={avatarUrl} />
            </Tabs.Content>
            <Tabs.Content value="senha">
              <SenhaTab />
            </Tabs.Content>
            <Tabs.Content value="email">
              <EmailTab email={email} />
            </Tabs.Content>
          </Tabs.Root>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
