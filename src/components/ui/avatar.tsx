import Image from "next/image";

const PALETTE = [
  "bg-blue-600",
  "bg-emerald-600",
  "bg-amber-600",
  "bg-violet-600",
  "bg-rose-600",
  "bg-cyan-600",
  "bg-indigo-600",
  "bg-teal-600",
];

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

const SIZES = {
  sm: { box: "h-7 w-7", text: "text-[11px]", px: 28 },
  md: { box: "h-9 w-9", text: "text-xs", px: 36 },
  lg: { box: "h-16 w-16", text: "text-lg", px: 64 },
  xl: { box: "h-28 w-28", text: "text-3xl", px: 112 },
} as const;

export function Avatar({
  name,
  src,
  size = "md",
}: {
  name: string;
  src?: string | null;
  size?: keyof typeof SIZES;
}) {
  const { box, text, px } = SIZES[size];

  if (src) {
    return (
      <span className={`relative inline-block ${box} shrink-0 overflow-hidden rounded-full bg-surface-hover`}>
        <Image src={src} alt={name} width={px} height={px} className="h-full w-full object-cover" unoptimized />
      </span>
    );
  }

  const initials =
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("") || "?";
  const color = PALETTE[hashString(name) % PALETTE.length];

  return (
    <span
      className={`inline-flex ${box} ${text} shrink-0 items-center justify-center rounded-full font-semibold text-white ${color}`}
    >
      {initials}
    </span>
  );
}
