import { NextResponse } from "next/server";
import { z } from "zod";
import {
  generateInterview,
  gradeInterview,
  publicGenerationError,
} from "@/lib/openai";
import { explainerSpecSchema, interviewSetSchema } from "@/lib/schema";

export const runtime = "nodejs";

const baseRequest = z.object({
  concept: z.string().trim().min(1).max(6_000),
  spec: explainerSpecSchema,
});

const requestSchema = z.union([
  baseRequest.strict(),
  baseRequest
    .extend({
      questions: interviewSetSchema.shape.questions,
      answers: z.record(z.string(), z.string().trim().min(1).max(3_000)),
    })
    .strict(),
]);

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
      { error: "The interview request is incomplete or invalid." },
      { status: 400 },
    );

  try {
    if ("answers" in parsed.data)
      return NextResponse.json(await gradeInterview(parsed.data));
    return NextResponse.json(
      await generateInterview(parsed.data.concept, parsed.data.spec),
    );
  } catch (cause) {
    const error = publicGenerationError(cause);
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  }
}
