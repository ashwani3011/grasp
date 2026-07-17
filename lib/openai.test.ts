import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import {
  generatedExplainerSchema,
  liveGeneratedExplainerSchema,
} from "@/lib/schema";
import { showcaseBySlug } from "@/lib/showcase";

vi.mock("server-only", () => ({}));

let validatedModelCall: typeof import("@/lib/openai").validatedModelCall;
let explainerSystem: typeof import("@/lib/openai").explainerSystem;
let validatedModelCallWithMeta: typeof import("@/lib/openai").validatedModelCallWithMeta;

beforeAll(async () => {
  ({ validatedModelCall, validatedModelCallWithMeta, explainerSystem } =
    await import("@/lib/openai"));
});

describe("explainer prompt", () => {
  it("does not silently narrow family or types-of requests", () => {
    expect(explainerSystem).toContain(
      "cover the family and its important differences rather than selecting one member",
    );
    expect(explainerSystem).toContain("the members are chips, never columns");
    expect(explainerSystem).toContain(
      "means compare var, let, and const unless the input explicitly asks about data or value types",
    );
  });

  it("requires executable exact examples and compact playgrounds", () => {
    expect(explainerSystem).toContain(
      "code is literally executable with a deterministic printed result",
    );
    expect(explainerSystem).toContain(
      "must print its result itself with the relevant console.log, print, or equivalent call",
    );
    expect(explainerSystem).toContain(
      "If the honest example would describe a result rather than execute and print it",
    );
    expect(explainerSystem).toContain(
      "Prefer one control; use two only when essential, and never use three",
    );
    expect(explainerSystem).toContain(
      "Keep the complete control state space at or below 12 scenarios",
    );
  });
});

afterEach(() => vi.unstubAllEnvs());

describe("validatedModelCall", () => {
  const schema = z.object({ answer: z.string().min(3) }).strict();

  it("returns a valid first response without a retry", async () => {
    const request = vi.fn().mockResolvedValue('{"answer":"valid"}');
    await expect(
      validatedModelCall({ schema, initialPrompt: "teach", request }),
    ).resolves.toEqual({ answer: "valid" });
    expect(request).toHaveBeenCalledOnce();
  });

  it("sends validation feedback back exactly once and accepts the repair", async () => {
    const request = vi
      .fn()
      .mockResolvedValueOnce('{"answer":"x"}')
      .mockResolvedValueOnce('{"answer":"repaired"}');
    await expect(
      validatedModelCall({ schema, initialPrompt: "teach", request }),
    ).resolves.toEqual({ answer: "repaired" });
    expect(request).toHaveBeenCalledTimes(2);
    expect(request.mock.calls[1][0]).toContain("ORIGINAL REQUEST:\nteach");
    expect(request.mock.calls[1][0]).toContain("VALIDATION ERRORS");
    expect(request.mock.calls[1][0]).toContain("answer");
  });

  it("reports whether validation repair was actually used", async () => {
    const firstPass = vi.fn().mockResolvedValue('{"answer":"valid"}');
    await expect(
      validatedModelCallWithMeta({
        schema,
        initialPrompt: "teach",
        request: firstPass,
      }),
    ).resolves.toEqual({
      data: { answer: "valid" },
      repairUsed: false,
      lenientUsed: false,
    });

    const repaired = vi
      .fn()
      .mockResolvedValueOnce('{"answer":"x"}')
      .mockResolvedValueOnce('{"answer":"valid"}');
    await expect(
      validatedModelCallWithMeta({
        schema,
        initialPrompt: "teach",
        request: repaired,
      }),
    ).resolves.toEqual({
      data: { answer: "valid" },
      repairUsed: true,
      lenientUsed: false,
    });
  });

  it("accepts a twice-motionless explainer only through the lenient schema", async () => {
    const source = showcaseBySlug["event-loop"];
    if (source.archetype !== "stepper")
      throw new Error("Expected a stepper showcase");
    const motionless = structuredClone(source);
    const allChipIds = motionless.chips.map((chip) => chip.id);
    motionless.steps = motionless.steps.map((step) => ({
      ...step,
      columns: step.columns.map((column, index) => ({
        ...column,
        chipIds: index === 0 ? allChipIds : [],
      })),
    }));
    const request = vi
      .fn()
      .mockResolvedValue(JSON.stringify({ spec: motionless }));

    await expect(
      validatedModelCallWithMeta({
        schema: liveGeneratedExplainerSchema,
        lenientSchema: generatedExplainerSchema,
        initialPrompt: "teach movement",
        request,
      }),
    ).resolves.toMatchObject({ repairUsed: true, lenientUsed: true });
    expect(request).toHaveBeenCalledTimes(2);
  });

  it("still rejects repaired output with movement and non-movement failures", async () => {
    const source = showcaseBySlug["event-loop"];
    if (source.archetype !== "stepper")
      throw new Error("Expected a stepper showcase");
    const invalid = structuredClone(source);
    const allChipIds = invalid.chips.map((chip) => chip.id);
    invalid.commonQuestions = [];
    invalid.steps = invalid.steps.map((step) => ({
      ...step,
      columns: step.columns.map((column, index) => ({
        ...column,
        chipIds: index === 0 ? allChipIds : [],
      })),
    }));
    const request = vi
      .fn()
      .mockResolvedValue(JSON.stringify({ spec: invalid }));

    await expect(
      validatedModelCallWithMeta({
        schema: liveGeneratedExplainerSchema,
        lenientSchema: generatedExplainerSchema,
        initialPrompt: "teach movement",
        request,
      }),
    ).rejects.toMatchObject({ code: "invalid_output" });
    expect(request).toHaveBeenCalledTimes(2);
  });

  it("does not degrade a generated explainer that already moves", async () => {
    const request = vi
      .fn()
      .mockResolvedValue(
        JSON.stringify({ spec: showcaseBySlug["event-loop"] }),
      );

    await expect(
      validatedModelCallWithMeta({
        schema: liveGeneratedExplainerSchema,
        lenientSchema: generatedExplainerSchema,
        initialPrompt: "teach movement",
        request,
      }),
    ).resolves.toMatchObject({
      repairUsed: false,
      lenientUsed: false,
    });
    expect(request).toHaveBeenCalledOnce();
  });

  it("stops after one failed repair", async () => {
    const request = vi.fn().mockResolvedValue('{"answer":"x"}');
    await expect(
      validatedModelCall({ schema, initialPrompt: "teach", request }),
    ).rejects.toMatchObject({ code: "invalid_output" });
    expect(request).toHaveBeenCalledTimes(2);
  });

  it("repairs malformed JSON instead of failing before the retry", async () => {
    const request = vi
      .fn()
      .mockResolvedValueOnce("not-json")
      .mockResolvedValueOnce('{"answer":"repaired"}');

    await expect(
      validatedModelCall({ schema, initialPrompt: "teach", request }),
    ).resolves.toEqual({ answer: "repaired" });
    expect(request).toHaveBeenCalledTimes(2);
    expect(request.mock.calls[1][0]).toContain("INVALID RESPONSE:\nnot-json");
  });

  it("caps validation feedback at sixteen issues", async () => {
    const fields = Array.from(
      { length: 20 },
      (_, index) => [`field_${index}`, z.string()] as const,
    );
    const wideSchema = z.object(Object.fromEntries(fields)).strict();
    const repaired = Object.fromEntries(
      fields.map(([field]) => [field, "valid"]),
    );
    const request = vi
      .fn()
      .mockResolvedValueOnce("{}")
      .mockResolvedValueOnce(JSON.stringify(repaired));

    await expect(
      validatedModelCall({
        schema: wideSchema,
        initialPrompt: "wide",
        request,
      }),
    ).resolves.toEqual(repaired);
    const repairPrompt = request.mock.calls[1][0];
    expect(repairPrompt).toContain("field_15");
    expect(repairPrompt).not.toContain("field_16");
  });
});

describe("publicGenerationError", () => {
  it("includes compact validation diagnostics outside production", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const { GenerationError, publicGenerationError } =
      await import("@/lib/openai");
    const issues = [{ path: ["spec", "steps"], message: "must move" }];

    expect(
      publicGenerationError(
        new GenerationError("invalid_output", "invalid", issues),
      ),
    ).toMatchObject({ status: 502, debug: issues });
  });

  it("never exposes validation diagnostics in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const { GenerationError, publicGenerationError } =
      await import("@/lib/openai");
    const error = publicGenerationError(
      new GenerationError("invalid_output", "invalid", [
        { path: ["spec"], message: "invalid" },
      ]),
    );

    expect(error).not.toHaveProperty("debug");
  });
});
