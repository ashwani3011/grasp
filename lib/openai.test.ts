import { beforeAll, describe, expect, it, vi } from "vitest";
import { z } from "zod";

vi.mock("server-only", () => ({}));

let validatedModelCall: typeof import("@/lib/openai").validatedModelCall;

beforeAll(async () => {
  ({ validatedModelCall } = await import("@/lib/openai"));
});

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
});
