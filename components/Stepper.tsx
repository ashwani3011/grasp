"use client";

import { useId, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Lightbulb } from "lucide-react";
import type { StepperSpec } from "@/lib/schema";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const chipTone = {
  violet: "border-violet-200 bg-violet-50 text-violet-900",
  cyan: "border-cyan-200 bg-cyan-50 text-cyan-900",
  amber: "border-amber-200 bg-amber-50 text-amber-950",
  rose: "border-rose-200 bg-rose-50 text-rose-900",
  slate: "border-slate-200 bg-slate-50 text-slate-800",
};

export function Stepper({ spec }: { spec: StepperSpec }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const instanceId = useId();
  const activeStep = spec.steps[activeIndex];
  const chipMap = useMemo(
    () => new Map(spec.chips.map((chip) => [chip.id, chip])),
    [spec.chips],
  );
  const positions = useMemo(
    () =>
      new Map(
        activeStep.columns.map((column) => [column.columnId, column.chipIds]),
      ),
    [activeStep],
  );

  return (
    <div className="space-y-6">
      <div
        className="flex gap-2 overflow-x-auto pb-1"
        aria-label="Explanation steps"
      >
        {spec.steps.map((step, index) => (
          <button
            key={step.id}
            type="button"
            onClick={() => setActiveIndex(index)}
            aria-current={index === activeIndex ? "step" : undefined}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-2 text-xs font-bold transition",
              index === activeIndex
                ? "border-slate-950 bg-slate-950 text-white"
                : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-900",
            )}
          >
            <span className="mr-1.5 opacity-60">
              {String(index + 1).padStart(2, "0")}
            </span>
            {step.title}
          </button>
        ))}
      </div>

      <div className="grid min-h-[270px] grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {spec.columns.map((column) => (
          <div
            key={column.id}
            className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3"
          >
            <div className="mb-3 flex items-baseline justify-between gap-2">
              <h3 className="text-xs font-extrabold tracking-[0.16em] text-slate-700 uppercase">
                {column.title}
              </h3>
              {column.hint && (
                <span className="text-[10px] font-medium text-slate-400">
                  {column.hint}
                </span>
              )}
            </div>
            <div className="space-y-2">
              {(positions.get(column.id) ?? []).map((chipId) => {
                const chip = chipMap.get(chipId);
                if (!chip) return null;
                return (
                  <motion.div
                    key={chip.id}
                    layoutId={`${instanceId}-${chip.id}`}
                    layout
                    transition={{ type: "spring", stiffness: 330, damping: 28 }}
                    className={cn(
                      "rounded-xl border p-3 shadow-sm",
                      chipTone[chip.tone],
                    )}
                  >
                    <div className="text-sm font-bold">{chip.label}</div>
                    {chip.detail && (
                      <div className="mt-1 text-xs leading-4 opacity-70">
                        {chip.detail}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 border-t border-slate-100 pt-5 md:grid-cols-[1fr_auto] md:items-end">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.18 }}
          >
            <div className="text-xs font-bold tracking-[0.14em] text-violet-600 uppercase">
              Step {activeIndex + 1} of {spec.steps.length}
            </div>
            <h3 className="mt-1 text-xl font-bold tracking-tight text-slate-950">
              {activeStep.title}
            </h3>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
              {activeStep.description}
            </p>
            {activeStep.callout && (
              <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900">
                <Lightbulb className="size-4" aria-hidden="true" />
                {activeStep.callout}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            aria-label="Previous step"
            disabled={activeIndex === 0}
            onClick={() => setActiveIndex((value) => value - 1)}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <Button
            variant="dark"
            onClick={() =>
              setActiveIndex((value) =>
                Math.min(spec.steps.length - 1, value + 1),
              )
            }
            disabled={activeIndex === spec.steps.length - 1}
          >
            Next <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
