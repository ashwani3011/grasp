import { beforeEach, describe, expect, it, vi } from "vitest";
import { askExplainer } from "@/lib/openai";
import { showcaseBySlug } from "@/lib/showcase";
import { POST } from "@/app/api/ask/route";

vi.mock("@/lib/openai", () => ({
  askExplainer: vi.fn(),
  publicGenerationError: vi.fn(() => ({ status: 502, message: "failed" })),
}));

let requestNumber = 0;

function askRequest(body: unknown) {
  requestNumber += 1;
  return new Request("http://localhost/api/ask", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": `192.0.2.${requestNumber}`,
    },
    body: JSON.stringify(body),
  });
}

describe("ask route", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects an unknown step id", async () => {
    const response = await POST(
      askRequest({
        spec: showcaseBySlug["event-loop"],
        target: { kind: "step", id: "missing-step" },
        question: "What happens here?",
      }),
    );

    expect(response.status).toBe(400);
    expect(askExplainer).not.toHaveBeenCalled();
  });

  it("rejects a scenario target on a stepper", async () => {
    const response = await POST(
      askRequest({
        spec: showcaseBySlug["event-loop"],
        target: { kind: "scenario", id: "sync" },
        question: "Why this scenario?",
      }),
    );

    expect(response.status).toBe(400);
    expect(askExplainer).not.toHaveBeenCalled();
  });

  it("rejects an oversized question", async () => {
    const response = await POST(
      askRequest({
        spec: showcaseBySlug["event-loop"],
        target: { kind: "general", id: null },
        question: "x".repeat(501),
      }),
    );

    expect(response.status).toBe(400);
    expect(askExplainer).not.toHaveBeenCalled();
  });

  it("returns a validated contextual answer", async () => {
    vi.mocked(askExplainer).mockResolvedValue({
      answer: "Microtasks drain before the event loop selects the next task.",
      followUp: "Can microtasks starve the task queue?",
    });
    const spec = showcaseBySlug["event-loop"];
    if (spec.archetype !== "stepper")
      throw new Error("Event loop showcase must be a stepper");
    const target = { kind: "step" as const, id: spec.steps[0].id };
    const response = await POST(
      askRequest({ spec, target, question: "Why does this run first?" }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      answer: expect.any(String),
      followUp: expect.any(String),
    });
    expect(askExplainer).toHaveBeenCalledWith(
      spec,
      target,
      "Why does this run first?",
    );
  });
});
