import { beforeEach, describe, expect, it, vi } from "vitest";
import { generateExplainerWithMeta } from "@/lib/openai";
import { generationHeaders } from "@/lib/pipeline";
import { showcaseBySlug } from "@/lib/showcase";
import { POST } from "@/app/api/generate/route";

vi.mock("@/lib/openai", () => ({
  generateExplainerWithMeta: vi.fn(),
  publicGenerationError: vi.fn(() => ({ status: 502, message: "failed" })),
}));

describe("generate route metadata", () => {
  beforeEach(() => vi.clearAllMocks());

  it("keeps the spec response body and reports only real pipeline metadata", async () => {
    const spec = showcaseBySlug["event-loop"];
    vi.mocked(generateExplainerWithMeta).mockResolvedValue({
      spec,
      meta: {
        model: "gpt-test",
        generateMs: 812,
        repairUsed: true,
        movementDegraded: true,
        validation: "zod",
      },
    });
    const response = await POST(
      new Request("http://localhost/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": "192.0.2.201",
        },
        body: JSON.stringify({ concept: spec.concept, level: spec.level }),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(spec);
    expect(response.headers.get(generationHeaders.model)).toBe("gpt-test");
    expect(response.headers.get(generationHeaders.generateMs)).toBe("812");
    expect(response.headers.get(generationHeaders.repairUsed)).toBe("true");
    expect(response.headers.get(generationHeaders.movementDegraded)).toBe(
      "true",
    );
    expect(response.headers.get(generationHeaders.validation)).toBe("zod");
  });
});
