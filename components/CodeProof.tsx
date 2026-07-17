"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Code2 } from "lucide-react";
import type { ExplainerSpec } from "@/lib/schema";
import { Button } from "@/components/ui/button";

type CodeExample = NonNullable<ExplainerSpec["example"]>;

export function CodeProof({ example }: { example: CodeExample }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <section className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 text-slate-100 shadow-sm">
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3 sm:px-5">
        <Code2 className="size-4 text-violet-300" aria-hidden="true" />
        <h3 className="text-xs font-extrabold tracking-[0.14em] uppercase">
          Prove it in code
        </h3>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-xs leading-6 text-slate-200 sm:p-5 sm:text-sm">
        <code>{example.code}</code>
      </pre>
      <div className="border-t border-white/10 bg-white/[0.04] p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-bold text-white">What does this print?</p>
          {!revealed && (
            <Button
              variant="outline"
              size="sm"
              className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
              onClick={() => setRevealed(true)}
            >
              Reveal output
            </Button>
          )}
        </div>
        <AnimatePresence initial={false}>
          {revealed && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="mt-3 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3"
              role="status"
            >
              <div className="flex items-center gap-2 font-mono text-sm font-bold text-emerald-200">
                <Check className="size-4" aria-hidden="true" />
                {example.output}
              </div>
              <p className="mt-1 text-xs leading-5 text-slate-300">
                {example.note}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
