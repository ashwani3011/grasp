import { Lightbulb } from "lucide-react";
import type { ExplainerSpec } from "@/lib/schema";
import { ArchetypeBadge } from "@/components/ArchetypeBadge";
import { CodeProof } from "@/components/CodeProof";
import { Playground } from "@/components/Playground";
import { Stepper } from "@/components/Stepper";
import { Card } from "@/components/ui/card";

export function Explainer({
  spec,
  actions,
}: {
  spec: ExplainerSpec;
  actions?: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden">
      <header className="border-b border-slate-100 p-5 sm:p-7">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <ArchetypeBadge
              archetype={spec.archetype}
              why={spec.whyThisArchetype}
            />
            <h2 className="mt-4 text-2xl font-extrabold tracking-[-0.03em] text-slate-950 sm:text-3xl">
              {spec.title}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              {spec.summary}
            </p>
            {spec.hook && (
              <p className="mt-4 max-w-3xl border-l-2 border-violet-400 pl-3 text-sm leading-6 font-semibold text-slate-700">
                {spec.hook}
              </p>
            )}
          </div>
          {actions}
        </div>
      </header>
      <div className="p-4 sm:p-7">
        {spec.archetype === "stepper" ? (
          <Stepper spec={spec} />
        ) : (
          <Playground spec={spec} />
        )}
        {spec.example && (
          <CodeProof key={spec.example.code} example={spec.example} />
        )}
      </div>
      <footer className="flex gap-3 border-t border-slate-100 bg-slate-50/70 p-5 text-sm leading-6 text-slate-700 sm:px-7">
        <Lightbulb
          className="mt-0.5 size-5 shrink-0 text-amber-500"
          aria-hidden="true"
        />
        <p>
          <strong className="text-slate-950">Keep this:</strong>{" "}
          {spec.keyTakeaway}
        </p>
      </footer>
    </Card>
  );
}
