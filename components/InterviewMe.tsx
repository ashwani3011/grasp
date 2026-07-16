"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
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
      setAssessment(await request({ concept, spec, questions, answers }));
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
              Three concept-specific questions, including a code-output check.
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

  return (
    <Card className="mt-6 overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-100 p-5 sm:px-7">
        <div>
          <div className="text-xs font-bold tracking-[0.16em] text-violet-600 uppercase">
            Interview mode
          </div>
          <h2 className="mt-1 text-xl font-bold">Answer all three</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setQuestions(null);
            setAssessment(null);
            setAnswers({});
          }}
        >
          <RotateCcw className="size-4" />
          Reset
        </Button>
      </div>
      <div className="space-y-6 p-5 sm:p-7">
        {questions.map((question, index) => {
          const result = assessment?.results.find(
            (item) => item.questionId === question.id,
          );
          return (
            <section
              key={question.id}
              className="grid gap-3 md:grid-cols-[32px_1fr]"
            >
              <div className="flex size-8 items-center justify-center rounded-full bg-slate-950 text-xs font-bold text-white">
                {index + 1}
              </div>
              <div>
                <div className="flex items-start gap-2">
                  <h3 className="leading-6 font-bold text-slate-900">
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
                  <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-950 p-4 font-mono text-xs leading-6 text-slate-100">
                    <code>{question.code}</code>
                  </pre>
                )}
                <textarea
                  value={answers[question.id] ?? ""}
                  onChange={(event) =>
                    setAnswers((current) => ({
                      ...current,
                      [question.id]: event.target.value,
                    }))
                  }
                  disabled={Boolean(assessment)}
                  placeholder="Your answer…"
                  rows={3}
                  className="mt-3 w-full resize-y rounded-xl border border-slate-200 bg-white p-3 text-sm leading-6 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 disabled:bg-slate-50"
                />
                <AnimatePresence>
                  {result && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "mt-3 rounded-xl border p-3 text-sm",
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </section>
          );
        })}
        {error && <p className="text-sm text-rose-600">{error}</p>}
        {!assessment && (
          <Button
            onClick={grade}
            disabled={
              loading === "grading" ||
              questions.some((question) => !(answers[question.id] ?? "").trim())
            }
          >
            {loading === "grading" && (
              <Loader2 className="size-4 animate-spin" />
            )}
            Check my answers
          </Button>
        )}
      </div>
    </Card>
  );
}
