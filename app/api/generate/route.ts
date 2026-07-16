import { NextResponse } from "next/server";
import { z } from "zod";
import { beginAiRequest } from "@/lib/ai-request-guard";
import { generateExplainer, publicGenerationError } from "@/lib/openai";
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
      return NextResponse.json(
        await generateExplainer(parsed.data.concept, parsed.data.level),
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
