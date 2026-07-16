import "server-only";

import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import type { z } from "zod";
import { explainerSpecSchema, type Level } from "@/lib/schema";

const MODEL = process.env.OPENAI_MODEL ?? "gpt-5.4-mini";

let client: OpenAI | undefined;

function getClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new GenerationError(
      "missing_key",
      "Live generation is not configured yet. Try one of the instant examples.",
    );
  }
  client ??= new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    maxRetries: 1,
    timeout: 45_000,
  });
  return client;
}

export class GenerationError extends Error {
  constructor(
    public readonly code: "missing_key" | "invalid_output" | "upstream",
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "GenerationError";
  }
}

function validationMessage(error: z.ZodError) {
  return error.issues
    .slice(0, 16)
    .map((issue) => `${issue.path.join(".") || "root"}: ${issue.message}`)
    .join("\n");
}

function parseJson<T>(schema: z.ZodType<T>, raw: string) {
  try {
    return schema.safeParse(JSON.parse(raw));
  } catch (cause) {
    return {
      success: false as const,
      error: {
        issues: [
          {
            path: [],
            message: cause instanceof Error ? cause.message : "Invalid JSON",
          },
        ],
      },
    };
  }
}

/**
 * Treats model text as hostile input. A failed parse gets exactly one repair
 * request containing the original response and compact validation feedback.
 */
export async function validatedModelCall<T>({
  schema,
  initialPrompt,
  request,
}: {
  schema: z.ZodType<T>;
  initialPrompt: string;
  request: (prompt: string) => Promise<string>;
}): Promise<T> {
  const firstRaw = await request(initialPrompt);
  const first = parseJson(schema, firstRaw);
  if (first.success) return first.data;

  const issues =
    "issues" in first.error
      ? first.error.issues
          .map((issue) => `${issue.path.join(".") || "root"}: ${issue.message}`)
          .join("\n")
      : validationMessage(first.error);
  const repairPrompt = [
    "Your previous JSON response failed validation.",
    "Return a corrected JSON object only. Preserve the teaching intent; change the minimum needed to satisfy every error.",
    "",
    "VALIDATION ERRORS:",
    issues,
    "",
    "INVALID RESPONSE:",
    firstRaw.slice(0, 24_000),
  ].join("\n");

  const repairedRaw = await request(repairPrompt);
  const repaired = parseJson(schema, repairedRaw);
  if (repaired.success) return repaired.data;
  throw new GenerationError(
    "invalid_output",
    "The explainer could not be validated after one repair attempt.",
    repaired.error,
  );
}

async function structuredRequest<T>(
  schema: z.ZodType<T>,
  name: string,
  system: string,
  prompt: string,
) {
  try {
    const response = await getClient().responses.create({
      model: MODEL,
      instructions: system,
      input: prompt,
      max_output_tokens: 8_000,
      text: { format: zodTextFormat(schema, name) },
    });
    if (!response.output_text)
      throw new Error("The model returned no structured text.");
    return response.output_text;
  } catch (cause) {
    if (cause instanceof GenerationError) throw cause;
    throw new GenerationError(
      "upstream",
      "The model service is temporarily unavailable.",
      cause,
    );
  }
}

const explainerSystem = `You design interactive developer education for Grasp.
You NEVER return React, HTML, CSS, JavaScript to execute, markdown, or prose outside the requested JSON schema.
Choose exactly one archetype:
- stepper: state, ordering, movement, protocols, lifecycles, queues, scopes.
- playground: quantitative trade-offs where changing 1-3 safe controls selects from explicit precomputed scenarios.

Quality rules:
- Teach the requested concept at the requested level with accurate, concrete language.
- Stepper chip ids are stable object identities. Reuse an id when the same item moves between columns. Every step includes every declared column, and a chip appears at most once per step.
- Playground controls never contain code or formulas. Every possible control state used by the UI maps to an explicit scenario. Each chart point contains a numeric value for every declared series id.
- Keep labels concise and the complete spec small enough for a shareable URL.
- Do not invent a third archetype.`;

export async function generateExplainer(concept: string, level: Level) {
  const prompt = `Create an explorable explanation for this input:\n\n${concept}\n\nAudience level: ${level}.`;
  return validatedModelCall({
    schema: explainerSpecSchema,
    initialPrompt: prompt,
    request: (input) =>
      structuredRequest(
        explainerSpecSchema,
        "grasp_explainer",
        explainerSystem,
        input,
      ),
  });
}

export function publicGenerationError(cause: unknown) {
  if (cause instanceof GenerationError) {
    if (cause.cause instanceof OpenAI.APIError && cause.cause.status === 429)
      return {
        status: 429,
        message:
          "Grasp is receiving a lot of requests. Please wait a moment and try again.",
      };
    if (cause.code === "missing_key")
      return { status: 503, message: cause.message };
    if (cause.code === "invalid_output")
      return {
        status: 502,
        message:
          "The AI returned an unsafe or incomplete explainer twice. Please try again.",
      };
  }
  return {
    status: 502,
    message:
      "Grasp couldn’t reach the model service. Your cached examples still work.",
  };
}
