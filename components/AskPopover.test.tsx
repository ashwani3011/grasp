import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AskPopover } from "@/components/AskPopover";
import { Explainer } from "@/components/Explainer";
import { showcaseBySlug } from "@/lib/showcase";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("AskPopover", () => {
  it("submits a focused question and refills a suggested follow-up", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          answer: "Microtasks drain before the next task is selected.",
          followUp: "Can microtasks delay timers?",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    render(
      <AskPopover
        spec={showcaseBySlug["event-loop"]}
        target={{ kind: "general", id: null }}
        targetLabel="Event loop"
        initialQuestion="Why does the promise run first?"
        onClose={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Ask question" }));
    expect(
      await screen.findByText(
        "Microtasks drain before the next task is selected.",
      ),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/ask",
      expect.objectContaining({ method: "POST" }),
    );

    await user.click(
      screen.getByRole("button", { name: "Can microtasks delay timers?" }),
    );
    expect(screen.getByLabelText("Your question")).toHaveValue(
      "Can microtasks delay timers?",
    );
  });

  it("opens a seeded common question pre-filled", async () => {
    const user = userEvent.setup();
    const spec = showcaseBySlug["event-loop"];
    render(<Explainer spec={spec} />);

    await user.click(
      screen.getByRole("button", { name: spec.commonQuestions[0] }),
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByLabelText("Your question")).toHaveValue(
      spec.commonQuestions[0],
    );
  });
});
