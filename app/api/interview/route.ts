import { NextResponse } from "next/server";
import { z } from "zod";
import { beginAiRequest } from "@/lib/ai-request-guard";
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

const gradingRequest = baseRequest
  .extend({
    questions: interviewSetSchema.shape.questions,
    answers: z.record(z.string(), z.string().trim().min(1).max(3_000)),
  })
  .strict()
  .superRefine((request, ctx) => {
    const questionIds = new Set(
      request.questions.map((question) => question.id),
    );
    const answerIds = Object.keys(request.answers);
    if (
      answerIds.length !== questionIds.size ||
      answerIds.some((answerId) => !questionIds.has(answerId))
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Answers must match the three question ids exactly",
        path: ["answers"],
      });
    }
  });

const requestSchema = z.union([baseRequest.strict(), gradingRequest]);

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
        { error: "The interview request is incomplete or invalid." },
        { status: 400, headers: admission.headers },
      );

    try {
      if ("answers" in parsed.data)
        return NextResponse.json(await gradeInterview(parsed.data), {
          headers: admission.headers,
        });
      return NextResponse.json(
        await generateInterview(parsed.data.concept, parsed.data.spec),
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
