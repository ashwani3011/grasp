import { Loader2 } from "lucide-react";

export function ExplainerSkeleton({
  status = "Loading the explainer…",
}: {
  status?: string;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
      <div
        role="status"
        aria-live="polite"
        className="flex items-center gap-3 border-b border-violet-100 bg-violet-50/70 px-5 py-3 text-sm font-bold text-violet-900 sm:px-7"
      >
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        {status}
      </div>
      <div className="animate-pulse">
        <div className="space-y-3 border-b border-slate-100 p-7">
          <div className="h-8 w-48 rounded-xl bg-slate-100" />
          <div className="h-9 w-2/3 rounded-xl bg-slate-100" />
          <div className="h-4 w-full max-w-2xl rounded bg-slate-100" />
        </div>
        <div className="grid min-h-[340px] gap-4 p-7 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="rounded-2xl bg-slate-100" />
          ))}
        </div>
      </div>
    </div>
  );
}
