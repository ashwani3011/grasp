import { describe, expect, it } from "vitest";
import { interviewAssessmentSchema, interviewSetSchema } from "@/lib/schema";

const question = {
  question: "What happens next?",
  expectedAnswer: "The callback runs.",
  rubric: "Mentions the callback.",
};

describe("interview schemas", () => {
  it("requires exactly three questions with a code-output question", () => {
    const withoutCode = {
      questions: [1, 2, 3].map((index) => ({
        ...question,
        id: `q-${index}`,
        kind: "concept",
      })),
    };
    expect(interviewSetSchema.safeParse(withoutCode).success).toBe(false);

    withoutCode.questions[1].kind = "code_output";
    expect(interviewSetSchema.safeParse(withoutCode).success).toBe(true);
  });

  it("requires exactly three grading results", () => {
    const result = {
      questionId: "q-1",
      verdict: "correct",
      feedback: "Accurate and concise.",
    };
    expect(
      interviewAssessmentSchema.safeParse({
        results: [
          result,
          { ...result, questionId: "q-2" },
          { ...result, questionId: "q-3" },
        ],
      }).success,
    ).toBe(true);
    expect(
      interviewAssessmentSchema.safeParse({ results: [result] }).success,
    ).toBe(false);
  });
});
