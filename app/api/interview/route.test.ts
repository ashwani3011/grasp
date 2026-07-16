import { beforeEach, describe, expect, it, vi } from "vitest";
import { gradeInterview } from "@/lib/openai";
import { showcaseSpecs } from "@/lib/showcase";
import { POST } from "@/app/api/interview/route";

vi.mock("@/lib/openai", () => ({
  generateInterview: vi.fn(),
  gradeInterview: vi.fn(),
  publicGenerationError: vi.fn(() => ({ status: 502, message: "failed" })),
}));

const questions = [
  {
    id: "q-1",
    question: "Define the mechanism.",
    kind: "concept" as const,
    expectedAnswer: "A precise definition.",
    rubric: "Names the mechanism.",
  },
  {
    id: "q-2",
    question: "What is the output?",
    kind: "code_output" as const,
    code: "console.log('A')",
    expectedAnswer: "A",
    rubric: "States A.",
  },
  {
    id: "q-3",
    question: "Apply it to a production scenario.",
    kind: "scenario" as const,
    expectedAnswer: "A concrete application.",
    rubric: "Applies the mechanism.",
  },
];

function gradingRequest(answers: Record<string, string>) {
  return new Request("http://localhost/api/interview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      concept: showcaseSpecs[0].concept,
      spec: showcaseSpecs[0],
      questions,
      answers,
    }),
  });
}

describe("interview route", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects missing or unrelated answer ids", async () => {
    const response = await POST(
      gradingRequest({ "q-1": "one", "q-2": "two", unrelated: "three" }),
    );

    expect(response.status).toBe(400);
    expect(gradeInterview).not.toHaveBeenCalled();
  });

  it("accepts exactly one answer for every question", async () => {
    vi.mocked(gradeInterview).mockResolvedValue({
      results: questions.map((question) => ({
        questionId: question.id,
        verdict: "correct" as const,
        feedback: "Correct.",
        correction: null,
      })),
    });

    const response = await POST(
      gradingRequest({ "q-1": "one", "q-2": "two", "q-3": "three" }),
    );

    expect(response.status).toBe(200);
    expect(gradeInterview).toHaveBeenCalledOnce();
  });
});
