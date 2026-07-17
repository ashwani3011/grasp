import {
  CheckCircle2,
  ChevronDown,
  Hammer,
  RefreshCw,
  Route,
  ShieldCheck,
} from "lucide-react";
import type { ExplainerSpec } from "@/lib/schema";
import type { GenerationMeta } from "@/lib/pipeline";

function durationLabel(milliseconds: number) {
  return milliseconds < 1_000
    ? `${milliseconds}ms`
    : `${(milliseconds / 1_000).toFixed(1)}s`;
}

function validationChecks(spec: ExplainerSpec, movementDegraded: boolean) {
  return spec.archetype === "stepper"
    ? [
        "strict schema + bounds",
        "reference integrity",
        ...(!movementDegraded ? ["stable chip movement"] : []),
      ]
    : [
        "strict schema + bounds",
        "reference integrity",
        "complete scenario coverage",
      ];
}

export function PipelineTrace({
  spec,
  meta,
}: {
  spec: ExplainerSpec;
  meta: GenerationMeta;
}) {
  return (
    <details className="group mt-4 rounded-2xl border border-slate-200 bg-white shadow-sm">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-bold text-slate-700 marker:content-none sm:px-5">
        <span className="flex items-center gap-2">
          <Route className="size-4 text-violet-600" aria-hidden="true" />
          How this was made
        </span>
        <span className="flex items-center gap-2 font-mono text-[11px] font-medium text-slate-400">
          {durationLabel(meta.generateMs)}
          <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
        </span>
      </summary>
      <div className="grid gap-3 border-t border-slate-100 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-4">
        <div className="rounded-xl bg-slate-50 p-3">
          <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800">
            <Hammer className="size-3.5 text-violet-600" aria-hidden="true" />
            Builder
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            {meta.model} produced the JSON spec in{" "}
            {durationLabel(meta.generateMs)}.
          </p>
        </div>

        {meta.repairUsed && (
          <div className="rounded-xl bg-amber-50 p-3">
            <div className="flex items-center gap-2 text-xs font-extrabold text-amber-900">
              <RefreshCw className="size-3.5" aria-hidden="true" />
              Repairer
            </div>
            <p className="mt-1 text-xs leading-5 text-amber-800">
              Self-repaired once from validation feedback.
            </p>
          </div>
        )}

        <div className="rounded-xl bg-emerald-50 p-3">
          <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-900">
            <ShieldCheck className="size-3.5" aria-hidden="true" />
            Inspector
          </div>
          <p className="mt-1 text-xs leading-5 text-emerald-800">
            Zod passed:{" "}
            {validationChecks(spec, meta.movementDegraded).join(" · ")}.
          </p>
        </div>

        <div className="rounded-xl bg-violet-50 p-3">
          <div className="flex items-center gap-2 text-xs font-extrabold text-violet-900">
            <CheckCircle2 className="size-3.5" aria-hidden="true" />
            Shape: {spec.archetype}
          </div>
          <p className="mt-1 text-xs leading-5 text-violet-800">
            {spec.whyThisArchetype}
          </p>
        </div>

        <a
          href="#interview-mode"
          className="rounded-xl border border-slate-200 p-3 transition hover:border-violet-300 hover:bg-violet-50"
        >
          <div className="text-xs font-extrabold text-slate-800">
            Examiner →
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Test the concept in Interview mode.
          </p>
        </a>
      </div>
    </details>
  );
}
