export function ExplainerSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-3xl border border-slate-200 bg-white">
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
  );
}
