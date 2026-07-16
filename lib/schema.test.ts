import { describe, expect, it } from "vitest";
import { zodTextFormat } from "openai/helpers/zod";
import {
  explainerSpecSchema,
  generatedExplainerSchema,
  generatedExplainerWireSchema,
  interviewAssessmentSchema,
  interviewSetSchema,
} from "@/lib/schema";
import { showcaseSpecs } from "@/lib/showcase";

describe("explainer schemas", () => {
  it("provides an object-rooted schema for OpenAI structured output", () => {
    expect(() =>
      zodTextFormat(generatedExplainerWireSchema, "grasp_explainer"),
    ).not.toThrow();
    expect(() =>
      zodTextFormat(interviewSetSchema, "grasp_interview"),
    ).not.toThrow();
    expect(() =>
      zodTextFormat(interviewAssessmentSchema, "grasp_assessment"),
    ).not.toThrow();
  });

  it("normalizes generated playground arrays into validated renderer maps", () => {
    const source = showcaseSpecs.find(
      (spec) => spec.archetype === "playground",
    );
    if (!source || source.archetype !== "playground")
      throw new Error("Expected a playground showcase");

    const wireSpec = {
      ...source,
      scenarios: source.scenarios.map((scenario) => ({
        ...scenario,
        when: Object.entries(scenario.when).map(([controlId, value]) => ({
          controlId,
          value,
        })),
        chartData: scenario.chartData.map((point) => ({
          ...point,
          values: Object.entries(point.values).map(([seriesId, value]) => ({
            seriesId,
            value,
          })),
        })),
      })),
    };

    expect(generatedExplainerSchema.parse({ spec: wireSpec })).toEqual(source);
  });

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

  it("rejects playgrounds with incomplete scenario coverage", () => {
    const source = showcaseSpecs.find(
      (spec) => spec.archetype === "playground",
    );
    expect(source?.archetype).toBe("playground");
    if (!source || source.archetype !== "playground") return;

    const invalid = structuredClone(source);
    invalid.scenarios.pop();
    const result = explainerSpecSchema.safeParse(invalid);

    expect(result.success).toBe(false);
    if (!result.success)
      expect(
        result.error.issues.some((issue) =>
          issue.message.includes("cover every control state"),
        ),
      ).toBe(true);
  });

  it("rejects playground defaults and chart values outside their domains", () => {
    const source = showcaseSpecs.find(
      (spec) => spec.archetype === "playground",
    );
    expect(source?.archetype).toBe("playground");
    if (!source || source.archetype !== "playground") return;

    const invalid = structuredClone(source);
    const control = invalid.controls[0];
    if (control.kind !== "slider") throw new Error("Fixture must use a slider");
    control.defaultValue = control.max + control.step;
    invalid.scenarios[0].chartData[0].values.unknown = 42;
    const result = explainerSpecSchema.safeParse(invalid);

    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);
      expect(messages).toContain(
        "Slider defaultValue must be one of its discrete values",
      );
      expect(messages).toContain("Unknown series value: unknown");
    }
  });
});
