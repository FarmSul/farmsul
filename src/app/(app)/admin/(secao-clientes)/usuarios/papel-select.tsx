"use client";

import { Select } from "@/components/ui/field";

const PAPEIS = ["proprietario", "gerente", "operador", "consultor"];

export function PapelSelect({
  userId,
  papel,
  action,
}: {
  userId: string;
  papel: string;
  action: (formData: FormData) => void;
}) {
  return (
    <form action={action} className="inline-flex">
      <input type="hidden" name="id" value={userId} />
      <Select
        name="papel"
        defaultValue={papel}
        className="w-36 capitalize"
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
      >
        {PAPEIS.map((p) => (
          <option key={p} value={p} className="capitalize">
            {p}
          </option>
        ))}
      </Select>
    </form>
  );
}
