import { StrictMode } from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
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
        onClose={vi.fn()}
      />,
    );

    expect(fetchMock).not.toHaveBeenCalled();
    await user.type(
      screen.getByLabelText("Your question"),
      "Why does the promise run first?",
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

  it("auto-submits a seeded common question exactly once in Strict Mode", async () => {
    const user = userEvent.setup();
    const spec = showcaseBySlug["event-loop"];
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          answer: "Microtasks have priority after synchronous work finishes.",
          followUp: null,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);
    render(
      <StrictMode>
        <Explainer spec={spec} />
      </StrictMode>,
    );

    await user.click(
      screen.getByRole("button", { name: spec.commonQuestions[0] }),
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByLabelText("Your question")).toHaveValue(
      spec.commonQuestions[0],
    );
    expect(
      screen.getByText("Answered in the context of this explainer."),
    ).toBeInTheDocument();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(
      await screen.findByText(
        "Microtasks have priority after synchronous work finishes.",
      ),
    ).toBeInTheDocument();
  });

  it("keeps a seeded question available when auto-submit fails", async () => {
    const question = "Why does this run first?";
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: "Please wait and try again." }), {
        status: 429,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    render(
      <AskPopover
        spec={showcaseBySlug["event-loop"]}
        target={{ kind: "general", id: null }}
        targetLabel="Event loop"
        initialQuestion={question}
        onClose={vi.fn()}
      />,
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Please wait and try again.",
    );
    expect(screen.getByLabelText("Your question")).toHaveValue(question);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
