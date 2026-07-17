import { NextResponse } from "next/server";
import { z } from "zod";
import { beginAiRequest } from "@/lib/ai-request-guard";
import { askExplainer, publicGenerationError } from "@/lib/openai";
import {
  askTargetSchema,
  explainerSpecSchema,
  type AskTarget,
  type ExplainerSpec,
} from "@/lib/schema";

export const runtime = "nodejs";

const requestSchema = z
  .object({
    spec: explainerSpecSchema,
    target: askTargetSchema,
    question: z.string().trim().min(1).max(500),
  })
  .strict();

function targetExists(spec: ExplainerSpec, target: AskTarget) {
  if (target.kind === "general") return true;
  if (target.kind === "step")
    return (
      spec.archetype === "stepper" &&
      spec.steps.some((step) => step.id === target.id)
    );
  if (target.kind === "chip")
    return (
      spec.archetype === "stepper" &&
      spec.chips.some((chip) => chip.id === target.id)
    );
  return (
    spec.archetype === "playground" &&
    spec.scenarios.some((scenario) => scenario.id === target.id)
  );
}

export async function POST(request: Request) {
  const admission = beginAiRequest(request);
  if (!admission.allowed)
    return NextResponse.json(
      { error: admission.message },
      { status: admission.status, headers: admission.headers },
    );

  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Send a valid JSON request." },
        { status: 400, headers: admission.headers },
      );
    }

    const parsed = requestSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        { error: "Ask one focused question about this explainer." },
        { status: 400, headers: admission.headers },
      );

    if (!targetExists(parsed.data.spec, parsed.data.target))
      return NextResponse.json(
        { error: "That part is not present in this explainer." },
        { status: 400, headers: admission.headers },
      );

    try {
      return NextResponse.json(
        await askExplainer(
          parsed.data.spec,
          parsed.data.target,
          parsed.data.question,
        ),
        { headers: admission.headers },
      );
    } catch (cause) {
      const error = publicGenerationError(cause);
      return NextResponse.json(
        { error: error.message },
        { status: error.status, headers: admission.headers },
      );
    }
  } finally {
    admission.release();
  }
}
