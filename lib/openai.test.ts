import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { z } from "zod";

vi.mock("server-only", () => ({}));

let validatedModelCall: typeof import("@/lib/openai").validatedModelCall;
let explainerSystem: typeof import("@/lib/openai").explainerSystem;

beforeAll(async () => {
  ({ validatedModelCall, explainerSystem } = await import("@/lib/openai"));
});

describe("explainer prompt", () => {
  it("does not silently narrow family or types-of requests", () => {
    expect(explainerSystem).toContain(
      "cover the family and its important differences rather than selecting one member",
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
