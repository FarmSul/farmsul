import { Loader2 } from "lucide-react";

export function Spinner({ className = "h-6 w-6" }: { className?: string }) {
  return <Loader2 className={`${className} animate-spin text-primary`} />;
}

export function PageLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Spinner className="h-8 w-8" />
    </div>
  );
}
