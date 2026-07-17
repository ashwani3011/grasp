"use client";

import { FormEvent, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Loader2, MessageCircleQuestion, X } from "lucide-react";
import {
  askAnswerSchema,
  type AskAnswer,
  type AskTarget,
  type ExplainerSpec,
} from "@/lib/schema";
import { Button } from "@/components/ui/button";

export function AskPopover({
  spec,
  target,
  targetLabel,
  initialQuestion = "",
  onClose,
}: {
  spec: ExplainerSpec;
  target: AskTarget;
  targetLabel: string;
  initialQuestion?: string;
  onClose: () => void;
}) {
  const titleId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [question, setQuestion] = useState(initialQuestion);
  const [answer, setAnswer] = useState<AskAnswer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    inputRef.current?.focus();
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || loading) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spec, target, question: trimmed }),
      });
      const payload: unknown = await response.json();
      if (!response.ok) {
        const message =
          typeof payload === "object" &&
          payload !== null &&
          "error" in payload &&
          typeof payload.error === "string"
            ? payload.error
            : "Grasp couldn’t answer that question. Please try again.";
        throw new Error(message);
      }
      const parsed = askAnswerSchema.safeParse(payload);
      if (!parsed.success)
        throw new Error(
          "Grasp received an incomplete answer. Please try again.",
        );
      setAnswer(parsed.data);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Grasp couldn’t answer that question. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  function selectFollowUp(followUp: string) {
    setQuestion(followUp);
    setAnswer(null);
    setError(null);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/35 p-3 backdrop-blur-[2px] sm:items-center sm:p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
      >
        <motion.section
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          className="max-h-[min(78vh,620px)] w-full max-w-xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-extrabold tracking-[0.14em] text-violet-600 uppercase">
                <MessageCircleQuestion className="size-4" aria-hidden="true" />
                Ask the explainer
              </div>
              <h2
                id={titleId}
                className="mt-2 text-xl font-extrabold text-slate-950"
              >
                {targetLabel}
              </h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                One focused clarification. Answers need the live AI service.
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Close Ask the explainer"
              onClick={onClose}
            >
              <X className="size-4" />
            </Button>
          </div>

          <form onSubmit={(event) => void submit(event)} className="mt-5">
            <label htmlFor={`${titleId}-question`} className="sr-only">
              Your question
            </label>
            <div className="flex gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-100">
              <input
                ref={inputRef}
                id={`${titleId}-question`}
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                maxLength={500}
                placeholder="What is unclear here?"
                className="min-w-0 flex-1 bg-transparent px-2 text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
              <Button
                type="submit"
                size="icon"
                disabled={loading || !question.trim()}
                aria-label="Ask question"
              >
                {loading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <ArrowRight className="size-4" />
                )}
              </Button>
            </div>
          </form>

          {error && (
            <div
              role="alert"
              className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-800"
            >
              {error}
            </div>
          )}

          {answer && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-2xl border border-violet-100 bg-violet-50/70 p-4"
            >
              <p className="text-sm leading-6 text-slate-800">
                {answer.answer}
              </p>
              {answer.followUp && (
                <button
                  type="button"
                  onClick={() => selectFollowUp(answer.followUp!)}
                  className="mt-3 rounded-full border border-violet-200 bg-white px-3 py-1.5 text-left text-xs font-bold text-violet-700 transition hover:border-violet-300 hover:bg-violet-50"
                >
                  {answer.followUp}
                </button>
              )}
            </motion.div>
          )}
        </motion.section>
      </motion.div>
    </AnimatePresence>
  );
}
