"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Braces,
  GalleryHorizontal,
  Loader2,
  Sparkles,
} from "lucide-react";
import type { ExplainerSpec, Level } from "@/lib/schema";
import { showcaseBySlug, showcaseSpecs } from "@/lib/showcase";
import { Explainer } from "@/components/Explainer";
import { ErrorCard } from "@/components/ErrorCard";
import { ExplainerSkeleton } from "@/components/ExplainerSkeleton";
import { ShareButton } from "@/components/ShareButton";
import { Button } from "@/components/ui/button";

const levels: { value: Level; label: string }[] = [
  { value: "beginner", label: "Beginner" },
  { value: "student", label: "Student" },
  { value: "interview", label: "Interview" },
  { value: "deep_dive", label: "Deep dive" },
];

export function HomeExperience() {
  const [input, setInput] = useState("");
  const [concept, setConcept] = useState(showcaseBySlug["event-loop"].concept);
  const [level, setLevel] = useState<Level>("student");
  const [spec, setSpec] = useState<ExplainerSpec>(showcaseBySlug["event-loop"]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate(nextConcept: string, nextLevel: Level) {
    const trimmed = nextConcept.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    setConcept(trimmed);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ concept: trimmed, level: nextLevel }),
      });
      const payload = await response.json();
      if (!response.ok)
        throw new Error(
          payload.error ?? "Generation is temporarily unavailable.",
        );
      setSpec(payload);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Generation is temporarily unavailable.",
      );
    } finally {
      setLoading(false);
    }
  }

  function loadShowcase(nextSpec: ExplainerSpec) {
    setConcept(nextSpec.concept);
    setInput(nextSpec.concept);
    setLevel(nextSpec.level);
    setSpec(nextSpec);
    setError(null);
    document
      .getElementById("result")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function changeLevel(nextLevel: Level) {
    setLevel(nextLevel);
    await generate(concept, nextLevel);
  }

  return (
    <main>
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-extrabold tracking-tight"
        >
          <span className="flex size-8 items-center justify-center rounded-xl bg-slate-950 text-white">
            <Braces className="size-4" />
          </span>
          Grasp
        </Link>
        <Link
          href="/gallery"
          className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"
        >
          <GalleryHorizontal className="size-4" />
          Gallery
        </Link>
      </nav>
      <section className="mx-auto max-w-5xl px-5 pt-14 pb-12 text-center sm:px-8 sm:pt-20">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/80 px-3 py-1.5 text-xs font-bold text-violet-700 shadow-sm">
          <Sparkles className="size-3.5" />
          Visual explanations, generated live
        </div>
        <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-extrabold tracking-[-0.055em] text-slate-950 sm:text-6xl lg:text-7xl">
          Don’t just read it.
          <br />
          <span className="text-violet-600">Move it. Change it. Grasp it.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
          Turn a developer concept, error message, or code snippet into an
          explorable explanation you can manipulate.
        </p>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void generate(input, level);
          }}
          className="mx-auto mt-8 max-w-3xl rounded-3xl border border-slate-200 bg-white p-2 shadow-[0_28px_80px_-30px_rgba(76,29,149,.35)]"
        >
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            maxLength={6000}
            rows={3}
            aria-label="Concept, code, or error message"
            placeholder="Try “Why does Promise.then run before setTimeout?” or paste an error…"
            className="block w-full resize-none rounded-2xl border-0 bg-transparent p-4 text-left text-base leading-6 text-slate-900 outline-none placeholder:text-slate-400"
          />
          <div className="flex flex-col gap-2 border-t border-slate-100 p-2 sm:flex-row sm:items-center sm:justify-between">
            <div
              className="flex gap-1 overflow-x-auto"
              aria-label="Explanation level"
            >
              {levels.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setLevel(item.value)}
                  className={`shrink-0 rounded-lg px-3 py-2 text-xs font-bold transition ${level === item.value ? "bg-violet-50 text-violet-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <Button type="submit" disabled={loading || !input.trim()}>
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Sparkles className="size-4" />
              )}
              Build explainer
            </Button>
          </div>
        </form>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs font-semibold text-slate-400">
            Instant examples
          </span>
          {showcaseSpecs.slice(0, 5).map((item) => (
            <button
              key={item.title}
              onClick={() => loadShowcase(item)}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:-translate-y-0.5 hover:border-violet-300 hover:text-violet-700"
            >
              {item.concept}
            </button>
          ))}
        </div>
      </section>

      <section
        id="result"
        className="scroll-mt-6 border-t border-slate-200/70 bg-white/45 py-12"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <div className="text-xs font-bold tracking-[0.16em] text-violet-600 uppercase">
                Your explainer
              </div>
              <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950">
                See the system, not just the definition.
              </h2>
            </div>
            <div className="flex gap-1 rounded-xl border border-slate-200 bg-white p-1">
              {levels.map((item) => (
                <button
                  key={item.value}
                  disabled={loading}
                  onClick={() => void changeLevel(item.value)}
                  className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold ${level === item.value ? "bg-slate-950 text-white" : "text-slate-500 hover:bg-slate-50"}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          {loading ? (
            <ExplainerSkeleton />
          ) : error ? (
            <ErrorCard
              message={error}
              action={
                <Button
                  variant="outline"
                  onClick={() => void generate(concept, level)}
                >
                  Try again <ArrowRight className="size-4" />
                </Button>
              }
            />
          ) : (
            <>
              <Explainer spec={spec} actions={<ShareButton spec={spec} />} />
            </>
          )}
        </div>
      </section>
      <footer className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-8 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <span>Grasp · Built for learning by doing</span>
        <span>No account. No tracking. Shareable offline.</span>
      </footer>
    </main>
  );
}
