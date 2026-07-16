import "server-only";

import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import type { z } from "zod";
import {
  explainerSpecSchema,
  interviewAssessmentSchema,
  interviewSetSchema,
  type ExplainerSpec,
  type InterviewAssessment,
  type InterviewSet,
  type Level,
} from "@/lib/schema";

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

type ModelValidationIssue = {
  path: PropertyKey[];
  message: string;
};

function validationMessage(issues: ModelValidationIssue[]) {
  return issues
    .slice(0, 16)
    .map(
      (issue) =>
        `${issue.path.map(String).join(".") || "root"}: ${issue.message}`,
    )
    .join("\n");
}

function parseJson<T>(
  schema: z.ZodType<T>,
  raw: string,
):
  | { success: true; data: T }
  | { success: false; issues: ModelValidationIssue[] } {
  try {
    const parsed = schema.safeParse(JSON.parse(raw));
    if (parsed.success) return parsed;
    return { success: false, issues: parsed.error.issues };
  } catch (cause) {
    return {
      success: false as const,
      issues: [
        {
          path: [],
          message: cause instanceof Error ? cause.message : "Invalid JSON",
        },
      ],
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

  const issues = validationMessage(first.issues);
  const repairPrompt = [
    "Your previous JSON response failed validation.",
    "Return a corrected JSON object only. Preserve the teaching intent; change the minimum needed to satisfy every error.",
    "",
    "ORIGINAL REQUEST:",
    initialPrompt.slice(0, 12_000),
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
    repaired.issues,
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

const explainerSystem = `You convert a developer concept, error message, or code snippet into an interactive explorable for Grasp.
Return only one valid JSON object matching the supplied schema. Return no markdown, backticks, commentary, or content outside that object. Never return React, HTML, CSS, or JavaScript to execute.

Choose exactly one archetype:
- stepper: use for ordered state changes, movement, protocols, lifecycles, queues, and scope formation. Declare columns and chips once at the top level. Each step references every column by columnId and places chips by chipId. A chip id is a stable object identity: reuse it when the same thing moves between columns. A chip appears at most once per step.
- playground: use for quantitative variables and trade-offs the learner should feel by adjusting them. Define 1-3 controls, named chart series, and explicit precomputed scenarios. The complete control state space must contain at most 24 combinations, and exactly one scenario must exist for every combination. Each scenario.when includes every control with a valid discrete value. Each chart point contains exactly one numeric value for every declared series id. Never provide formulas or executable code.

Match the requested level:
- beginner: use concrete analogies and minimal jargon.
- student: explain clearly and define the key terms.
- interview: be precise, name the mechanism, and state the common gotcha.
- deep_dive: include relevant edge cases and the underlying reason the mechanism works.

Content rules:
- Technical correctness is the highest priority. When uncertain, choose the simpler accurate explanation.
- summary, step description, and scenario explanation text is concrete and short: one or two sentences, with no filler such as “in this step we will.”
- whyThisArchetype briefly explains why the selected interaction fits the concept.
- keyTakeaway is one concise line explaining what matters most.
- Keep labels concise and the complete spec small enough for a shareable URL.
- Use only fields from the supplied schema. Checkpoints are generated separately by Interview mode; never add checkpoint, narration, params, stacks, or why_it_matters fields.
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

const interviewSystem = `You are a concise, rigorous technical interviewer.
Return only JSON matching the supplied schema. Never return executable UI code.
Questions must test the supplied concept and explainer, not trivia. Exactly one or two questions should contain a short code snippet and ask what it outputs. The expected answer and rubric are private grading material and must be accurate.`;

export async function generateInterview(
  concept: string,
  spec: ExplainerSpec,
): Promise<InterviewSet> {
  const prompt = `Create exactly three interview questions for ${concept}. Include at least one code_output question. Use this validated explainer as context:\n${JSON.stringify(spec)}`;
  return validatedModelCall({
    schema: interviewSetSchema,
    initialPrompt: prompt,
    request: (input) =>
      structuredRequest(
        interviewSetSchema,
        "grasp_interview",
        interviewSystem,
        input,
      ),
  });
}

export async function gradeInterview({
  concept,
  spec,
  questions,
  answers,
}: {
  concept: string;
  spec: ExplainerSpec;
  questions: InterviewSet["questions"];
  answers: Record<string, string>;
}): Promise<InterviewAssessment> {
  const safeQuestions = interviewSetSchema.parse({ questions });
  const questionIds = new Set(
    safeQuestions.questions.map((question) => question.id),
  );
  const assessmentSchema = interviewAssessmentSchema.superRefine(
    (assessment, ctx) => {
      const resultIds = new Set(
        assessment.results.map((result) => result.questionId),
      );
      if (
        resultIds.size !== questionIds.size ||
        [...questionIds].some((id) => !resultIds.has(id))
      ) {
        ctx.addIssue({
          code: "custom",
          message: "Results must match the three question ids",
          path: ["results"],
        });
      }
    },
  );
  const prompt = `Grade all three answers for ${concept}. Be brief, specific, and constructive. A correction is required when the verdict is close or needs_work. Return one result for each questionId.\n\nExplainer:\n${JSON.stringify(spec)}\n\nQuestions and answers:\n${JSON.stringify(safeQuestions.questions.map((question) => ({ question, candidateAnswer: answers[question.id] ?? "" })))}`;
  return validatedModelCall({
    schema: assessmentSchema,
    initialPrompt: prompt,
    request: (input) =>
      structuredRequest(
        assessmentSchema,
        "grasp_assessment",
        interviewSystem,
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
