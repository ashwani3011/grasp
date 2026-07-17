import { describe, expect, it } from "vitest";
import { generationHeaders, readGenerationMeta } from "@/lib/pipeline";

describe("generation pipeline metadata", () => {
  it("reads complete trusted metadata headers", () => {
    const headers = new Headers({
      [generationHeaders.model]: "gpt-test",
      [generationHeaders.generateMs]: "1234.4",
      [generationHeaders.repairUsed]: "true",
      [generationHeaders.movementDegraded]: "false",
      [generationHeaders.validation]: "zod",
    });
    expect(readGenerationMeta(headers)).toEqual({
      model: "gpt-test",
      generateMs: 1234,
      repairUsed: true,
      movementDegraded: false,
      validation: "zod",
    });
  });

  it("does not invent a partial pipeline trace", () => {
    expect(readGenerationMeta(new Headers())).toBeNull();
    expect(
      readGenerationMeta(
        new Headers({
          [generationHeaders.model]: "gpt-test",
          [generationHeaders.generateMs]: "not-a-duration",
          [generationHeaders.repairUsed]: "false",
          [generationHeaders.movementDegraded]: "false",
          [generationHeaders.validation]: "zod",
        }),
      ),
    ).toBeNull();
  });
});
