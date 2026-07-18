import { ArrowUp, CircleHelp } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ClarificationCard({ onRefine }: { onRefine: () => void }) {
  return (
    <section
      role="status"
      aria-live="polite"
      className="rounded-3xl border border-violet-200 bg-gradient-to-br from-white to-violet-50/70 p-6 shadow-sm sm:p-8"
    >
      <div className="flex size-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
        <CircleHelp className="size-5" />
      </div>
      <h3 className="mt-5 text-xl font-extrabold tracking-tight text-slate-950">
        What should Grasp explain?
      </h3>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
        That input doesn’t identify a clear subject yet. Try a concept such as
        “closures,” ask a specific question, or paste the code or error you’re
        looking at.
      </p>
      <Button className="mt-5" variant="outline" onClick={onRefine}>
        Refine your input <ArrowUp className="size-4" />
      </Button>
    </section>
  );
}
