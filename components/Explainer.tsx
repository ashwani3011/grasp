"use client";

import { useRef, useState } from "react";
import { Lightbulb } from "lucide-react";
import type { AskTarget, ExplainerSpec } from "@/lib/schema";
import { ArchetypeBadge } from "@/components/ArchetypeBadge";
import { AskPopover } from "@/components/AskPopover";
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
  const askSequence = useRef(0);
  const [askPrompt, setAskPrompt] = useState<{
    key: number;
    target: AskTarget;
    label: string;
    question?: string;
  } | null>(null);

  function openAsk(target: AskTarget, label: string, question?: string) {
    askSequence.current += 1;
    setAskPrompt({ key: askSequence.current, target, label, question });
  }

  return (
    <>
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
            <Stepper spec={spec} onAsk={openAsk} />
          ) : (
            <Playground spec={spec} onAsk={openAsk} />
          )}
          {spec.example && (
            <CodeProof key={spec.example.code} example={spec.example} />
          )}
        </div>
        <footer className="border-t border-slate-100 bg-slate-50/70 p-5 text-sm leading-6 text-slate-700 sm:px-7">
          <div className="flex gap-3">
            <Lightbulb
              className="mt-0.5 size-5 shrink-0 text-amber-500"
              aria-hidden="true"
            />
            <p>
              <strong className="text-slate-950">Keep this:</strong>{" "}
              {spec.keyTakeaway}
            </p>
          </div>
          {spec.commonQuestions.length > 0 && (
            <div className="mt-5 border-t border-slate-200/70 pt-4">
              <div className="text-[10px] font-extrabold tracking-[0.14em] text-slate-400 uppercase">
                Common questions
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {spec.commonQuestions.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() =>
                      openAsk(
                        { kind: "general", id: null },
                        spec.title,
                        question,
                      )
                    }
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-left text-xs font-semibold text-slate-600 transition hover:border-violet-300 hover:text-violet-700"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}
        </footer>
      </Card>
      {askPrompt && (
        <AskPopover
          key={askPrompt.key}
          spec={spec}
          target={askPrompt.target}
          targetLabel={askPrompt.label}
          initialQuestion={askPrompt.question}
          onClose={() => setAskPrompt(null)}
        />
      )}
    </>
  );
}
