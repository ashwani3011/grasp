"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Code2,
  Loader2,
  MessageSquareText,
  RotateCcw,
  XCircle,
} from "lucide-react";
import type {
  ExplainerSpec,
  InterviewAssessment,
  InterviewSet,
} from "@/lib/schema";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const difficulty = [
  "Easy · Foundation",
  "Medium · Mechanism",
  "Hard · Application",
];

export function InterviewMe({
  concept,
  spec,
}: {
  concept: string;
  spec: ExplainerSpec;
}) {
  const [questions, setQuestions] = useState<InterviewSet["questions"] | null>(
    null,
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [assessment, setAssessment] = useState<InterviewAssessment | null>(
    null,
  );
  const [loading, setLoading] = useState<"questions" | "grading" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function request(body: object) {
    const response = await fetch("/api/interview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = await response.json();
    if (!response.ok)
      throw new Error(
        payload.error ?? "Interview mode is temporarily unavailable.",
      );
    return payload;
  }

  async function start() {
    setLoading("questions");
    setError(null);
    setAssessment(null);
    setAnswers({});
    setActiveIndex(0);
    try {
      const payload = await request({ concept, spec });
      setQuestions(payload.questions);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Interview mode is temporarily unavailable.",
      );
    } finally {
      setLoading(null);
    }
  }

  async function grade() {
    if (!questions) return;
    setLoading("grading");
    setError(null);
    try {
      const result = await request({ concept, spec, questions, answers });
      setAssessment(result);
      setActiveIndex(0);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "We couldn’t grade those answers.",
      );
    } finally {
      setLoading(null);
    }
  }

  function reset() {
    setQuestions(null);
    setAssessment(null);
    setAnswers({});
    setActiveIndex(0);
    setError(null);
  }

  if (!questions)
    return (
      <Card className="mt-6 overflow-hidden border-slate-800 bg-slate-950 p-6 text-white sm:p-7">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold tracking-[0.16em] text-violet-300 uppercase">
              <MessageSquareText className="size-4" />
              Interview mode
            </div>
            <h2 className="mt-2 text-xl font-bold">
              Can you explain it under pressure?
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Three questions from foundation to application, including a
              code-output check.
            </p>
          </div>
          <Button
            onClick={start}
            disabled={loading === "questions"}
            className="shrink-0 bg-white text-slate-950 hover:bg-violet-100"
          >
            {loading === "questions" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ChevronRight className="size-4" />
            )}
            Interview me
          </Button>
        </div>
        {error && <p className="mt-4 text-sm text-rose-300">{error}</p>}
      </Card>
    );

  const question = questions[activeIndex];
  const result = assessment?.results.find(
    (item) => item.questionId === question.id,
  );
  const hasAnswer = Boolean((answers[question.id] ?? "").trim());
  const isLast = activeIndex === questions.length - 1;

  return (
    <Card className="mt-6 overflow-hidden">
      <div className="border-b border-slate-100 p-5 sm:px-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-bold tracking-[0.16em] text-violet-600 uppercase">
              Interview mode · Question {activeIndex + 1} of {questions.length}
            </div>
            <h2 className="mt-1 text-xl font-bold">
              {assessment ? "Review your interview" : difficulty[activeIndex]}
            </h2>
          </div>
          <Button variant="ghost" size="sm" onClick={reset}>
            <RotateCcw className="size-4" />
            Reset
          </Button>
        </div>
        <div
          className="mt-4 grid grid-cols-3 gap-2"
          aria-label="Interview progress"
        >
          {questions.map((item, index) => (
            <div
              key={item.id}
              className={cn(
                "h-1.5 rounded-full transition-colors",
                index <= activeIndex ? "bg-violet-600" : "bg-slate-200",
              )}
            />
          ))}
        </div>
      </div>

      <div className="p-5 sm:p-7">
        <AnimatePresence mode="wait">
          <motion.section
            key={question.id}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.18 }}
          >
            <div className="flex items-start gap-2">
              <h3 className="text-lg leading-7 font-bold text-slate-900">
                {question.question}
              </h3>
              {question.kind === "code_output" && (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-cyan-50 px-2 py-1 text-[10px] font-bold text-cyan-800 uppercase">
                  <Code2 className="size-3" />
                  Output
                </span>
              )}
            </div>

            {question.code && (
              <pre className="mt-4 overflow-x-auto rounded-xl bg-slate-950 p-4 font-mono text-xs leading-6 text-slate-100">
                <code>{question.code}</code>
              </pre>
            )}

            <label
              htmlFor={`answer-${question.id}`}
              className="mt-5 block text-xs font-bold tracking-[0.12em] text-slate-500 uppercase"
            >
              Your answer
            </label>
            <textarea
              id={`answer-${question.id}`}
              value={answers[question.id] ?? ""}
              onChange={(event) =>
                setAnswers((current) => ({
                  ...current,
                  [question.id]: event.target.value,
                }))
              }
              disabled={Boolean(assessment)}
              placeholder="Explain your reasoning…"
              rows={4}
              className="mt-2 w-full resize-y rounded-xl border border-slate-200 bg-white p-3 text-sm leading-6 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 disabled:bg-slate-50"
            />

            {result && (
              <div className="mt-4 space-y-3">
                <div
                  className={cn(
                    "rounded-xl border p-4 text-sm",
                    result.verdict === "correct"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                      : result.verdict === "close"
                        ? "border-amber-200 bg-amber-50 text-amber-950"
                        : "border-rose-200 bg-rose-50 text-rose-900",
                  )}
                >
                  <div className="flex items-center gap-2 font-bold">
                    {result.verdict === "correct" ? (
                      <CheckCircle2 className="size-4" />
                    ) : (
                      <XCircle className="size-4" />
                    )}
                    {result.verdict === "needs_work"
                      ? "Needs work"
                      : result.verdict === "close"
                        ? "Close"
                        : "Correct"}
                  </div>
                  <p className="mt-1 leading-6">{result.feedback}</p>
                  {result.correction && (
                    <p className="mt-1 leading-6">
                      <strong>Correction:</strong> {result.correction}
                    </p>
                  )}
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  <div className="text-xs font-bold tracking-[0.12em] text-slate-500 uppercase">
                    Reference answer
                  </div>
                  <p className="mt-1 leading-6">{question.expectedAnswer}</p>
                </div>
              </div>
            )}
          </motion.section>
        </AnimatePresence>

        {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}

        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
          <Button
            variant="outline"
            onClick={() => setActiveIndex((index) => index - 1)}
            disabled={activeIndex === 0 || loading === "grading"}
          >
            <ChevronLeft className="size-4" />
            Previous
          </Button>

          {!assessment && !isLast && (
            <Button
              onClick={() => setActiveIndex((index) => index + 1)}
              disabled={!hasAnswer}
            >
              Next question
              <ChevronRight className="size-4" />
            </Button>
          )}
          {!assessment && isLast && (
            <Button
              onClick={grade}
              disabled={loading === "grading" || !hasAnswer}
            >
              {loading === "grading" && (
                <Loader2 className="size-4 animate-spin" />
              )}
              Check my answers
            </Button>
          )}
          {assessment && !isLast && (
            <Button onClick={() => setActiveIndex((index) => index + 1)}>
              Next result
              <ChevronRight className="size-4" />
            </Button>
          )}
          {assessment && isLast && (
            <span className="text-xs font-semibold text-slate-500">
              Review complete
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
