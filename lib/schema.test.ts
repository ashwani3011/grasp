import { describe, expect, it } from "vitest";
import { explainerSpecSchema } from "@/lib/schema";
import { showcaseSpecs } from "@/lib/showcase";

describe("explainer schemas", () => {
  it("accepts every hand-verified showcase spec", () => {
    expect(showcaseSpecs).toHaveLength(8);
    for (const spec of showcaseSpecs)
      expect(explainerSpecSchema.safeParse(spec).success).toBe(true);
  });

  it("rejects a step that references an unknown chip", () => {
    const source = showcaseSpecs.find((spec) => spec.archetype === "stepper");
    expect(source?.archetype).toBe("stepper");
    if (!source || source.archetype !== "stepper") return;
    const invalid = structuredClone(source);
    invalid.steps[0].columns[0].chipIds.push("model-invented-chip");
    const result = explainerSpecSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    if (!result.success)
      expect(
        result.error.issues.some((issue) =>
          issue.message.includes("Unknown chip"),
        ),
      ).toBe(true);
  });

  it("rejects arbitrary fields from model output", () => {
    const invalid = { ...showcaseSpecs[0], renderReact: "alert('nope')" };
    expect(explainerSpecSchema.safeParse(invalid).success).toBe(false);
  });
});
