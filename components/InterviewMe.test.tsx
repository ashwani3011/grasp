import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { InterviewMe } from "@/components/InterviewMe";
import { showcaseSpecs } from "@/lib/showcase";

const questions = [
  {
    id: "q-1",
    question: "Question one?",
    kind: "concept" as const,
    expectedAnswer: "Reference one.",
    rubric: "Rubric one.",
  },
  {
    id: "q-2",
    question: "Question two?",
    kind: "code_output" as const,
    code: "console.log('two')",
    expectedAnswer: "Reference two.",
    rubric: "Rubric two.",
  },
  {
    id: "q-3",
    question: "Question three?",
    kind: "scenario" as const,
    expectedAnswer: "Reference three.",
    rubric: "Rubric three.",
  },
];

afterEach(() => vi.unstubAllGlobals());

describe("InterviewMe", () => {
  it("collects one answer at a time and grades all three in one batch", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ questions }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: questions.map((question) => ({
            questionId: question.id,
            verdict: "correct",
            feedback: `Feedback for ${question.id}`,
          })),
        }),
      });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();

    render(
      <InterviewMe
        concept={showcaseSpecs[0].concept}
        spec={showcaseSpecs[0]}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Interview me" }));
    expect(await screen.findByText("Question one?")).toBeInTheDocument();
    expect(screen.queryByText("Question two?")).not.toBeInTheDocument();

    await user.type(screen.getByLabelText("Your answer"), "Answer one");
    await user.click(screen.getByRole("button", { name: "Next question" }));
    expect(await screen.findByText("Question two?")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Your answer"), "Answer two");
    await user.click(screen.getByRole("button", { name: "Next question" }));
    expect(await screen.findByText("Question three?")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Your answer"), "Answer three");
    await user.click(screen.getByRole("button", { name: "Check my answers" }));

    expect(await screen.findByText("Feedback for q-1")).toBeInTheDocument();
    expect(screen.getByText("Reference one.")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const gradingBody = JSON.parse(fetchMock.mock.calls[1][1].body as string);
    expect(gradingBody.answers).toEqual({
      "q-1": "Answer one",
      "q-2": "Answer two",
      "q-3": "Answer three",
    });
  });
});
