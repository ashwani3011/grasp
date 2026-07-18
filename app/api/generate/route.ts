import { NextResponse } from "next/server";
import { z } from "zod";
import { beginAiRequest } from "@/lib/ai-request-guard";
import { generateExplainerWithMeta, publicGenerationError } from "@/lib/openai";
import { generationHeaders } from "@/lib/pipeline";
import { levelSchema } from "@/lib/schema";

export const runtime = "nodejs";

const requestSchema = z
  .object({ concept: z.string().trim().min(1).max(6_000), level: levelSchema })
  .strict();

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
        { error: "Add a concept and choose a valid level." },
        { status: 400, headers: admission.headers },
      );

    try {
      const generated = await generateExplainerWithMeta(
        parsed.data.concept,
        parsed.data.level,
      );
      const headers = new Headers(admission.headers);
      headers.set(generationHeaders.model, generated.meta.model);
      headers.set(
        generationHeaders.generateMs,
        String(generated.meta.generateMs),
      );
      headers.set(
        generationHeaders.repairUsed,
        String(generated.meta.repairUsed),
      );
      headers.set(
        generationHeaders.movementDegraded,
        String(generated.meta.movementDegraded),
      );
      headers.set(generationHeaders.validation, generated.meta.validation);
      return NextResponse.json(
        generated.kind === "explainer"
          ? generated.spec
          : { kind: "clarification" },
        { headers },
      );
    } catch (cause) {
      const error = publicGenerationError(cause);
      const payload: Record<string, unknown> = { error: error.message };
      if ("debug" in error && error.debug !== undefined)
        payload.debug = error.debug;
      return NextResponse.json(payload, {
        status: error.status,
        headers: admission.headers,
      });
    }
  } finally {
    admission.release();
  }
}
