import { NextResponse } from "next/server";
import { z } from "zod";
import { generateExplainer, publicGenerationError } from "@/lib/openai";
import { levelSchema } from "@/lib/schema";

export const runtime = "nodejs";

const requestSchema = z
  .object({ concept: z.string().trim().min(1).max(6_000), level: levelSchema })
  .strict();

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Send a valid JSON request." },
      { status: 400 },
    );
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: "Add a concept and choose a valid level." },
      { status: 400 },
    );

  try {
    return NextResponse.json(
      await generateExplainer(parsed.data.concept, parsed.data.level),
    );
  } catch (cause) {
    const error = publicGenerationError(cause);
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  }
}
