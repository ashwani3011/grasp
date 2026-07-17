import { describe, expect, it } from "vitest";
import { zodTextFormat } from "openai/helpers/zod";
import {
  askAnswerSchema,
  askTargetSchema,
  explainerSpecSchema,
  generatedExplainerSchema,
  generatedExplainerWireSchema,
  interviewAssessmentSchema,
  interviewSetSchema,
  liveGeneratedExplainerSchema,
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
    expect(() =>
      zodTextFormat(askAnswerSchema, "grasp_ask_answer"),
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

  it("keeps the first live chip placement when columns contain a duplicate", () => {
    const source = showcaseSpecs.find((spec) => spec.archetype === "stepper");
    if (!source || source.archetype !== "stepper")
      throw new Error("Expected a stepper showcase");

    const wireSpec = structuredClone(source);
    const firstPlacement = wireSpec.steps[0].columns.find(
      (column) => column.chipIds.length > 0,
    );
    const laterColumn = wireSpec.steps[0].columns.find(
      (column) => column !== firstPlacement,
    );
    if (!firstPlacement || !laterColumn)
      throw new Error("Expected two populated step columns");
    const duplicateId = firstPlacement.chipIds[0];
    laterColumn.chipIds.push(duplicateId);

    const parsed = generatedExplainerSchema.parse({ spec: wireSpec });
    expect(parsed.archetype).toBe("stepper");
    if (parsed.archetype !== "stepper") return;
    const parsedFirstPlacement = parsed.steps[0].columns.find(
      (column) => column.columnId === firstPlacement.columnId,
    );
    const parsedLaterColumn = parsed.steps[0].columns.find(
      (column) => column.columnId === laterColumn.columnId,
    );
    expect(parsedFirstPlacement?.chipIds).toContain(duplicateId);
    expect(parsedLaterColumn?.chipIds).not.toContain(duplicateId);
    expect(explainerSpecSchema.safeParse(parsed).success).toBe(true);
  });

  it("dedupes repeated live chip ids within one column", () => {
    const source = showcaseSpecs.find((spec) => spec.archetype === "stepper");
    if (!source || source.archetype !== "stepper")
      throw new Error("Expected a stepper showcase");

    const wireSpec = structuredClone(source);
    const column = wireSpec.steps[0].columns.find(
      (candidate) => candidate.chipIds.length > 0,
    );
    if (!column) throw new Error("Expected a populated step column");
    const duplicateId = column.chipIds[0];
    column.chipIds.push(duplicateId);

    const parsed = generatedExplainerSchema.parse({ spec: wireSpec });
    expect(parsed.archetype).toBe("stepper");
    if (parsed.archetype !== "stepper") return;
    const parsedColumn = parsed.steps[0].columns.find(
      (candidate) => candidate.columnId === column.columnId,
    );
    expect(
      parsedColumn?.chipIds.filter((chipId) => chipId === duplicateId),
    ).toHaveLength(1);
    expect(explainerSpecSchema.safeParse(parsed).success).toBe(true);
  });

  it("accepts every hand-verified showcase spec", () => {
    expect(showcaseSpecs).toHaveLength(8);
    for (const spec of showcaseSpecs)
      expect(explainerSpecSchema.safeParse(spec).success).toBe(true);
  });

  it("defaults missing learning-frame fields for legacy shared specs", () => {
    const legacy = structuredClone(showcaseSpecs[0]) as Record<string, unknown>;
    delete legacy.hook;
    delete legacy.example;
    delete legacy.commonQuestions;

    const parsed = explainerSpecSchema.parse(legacy);
    expect(parsed.hook).toBeNull();
    expect(parsed.example).toBeNull();
    expect(parsed.commonQuestions).toEqual([]);
  });

  it("accepts valid learning-frame fields and rejects oversized content", () => {
    const valid = {
      ...showcaseSpecs[0],
      hook: "This is why a timer can run after a resolved promise.",
      example: {
        code: "console.log('A')",
        output: "A",
        note: "The statement logs synchronously.",
      },
      commonQuestions: ["Why does this happen?"],
    };
    expect(explainerSpecSchema.safeParse(valid).success).toBe(true);
    expect(
      explainerSpecSchema.safeParse({ ...valid, hook: "x".repeat(181) })
        .success,
    ).toBe(false);
    expect(
      explainerSpecSchema.safeParse({
        ...valid,
        example: { ...valid.example, code: "x".repeat(501) },
      }).success,
    ).toBe(false);
    expect(
      explainerSpecSchema.safeParse({
        ...valid,
        commonQuestions: Array.from({ length: 4 }, () => "Question?"),
      }).success,
    ).toBe(false);
  });

  it("requires a live-generated stepper to animate a stable chip", () => {
    const source = showcaseSpecs.find((spec) => spec.archetype === "stepper");
    if (!source || source.archetype !== "stepper")
      throw new Error("Expected a stepper showcase");

    const liveSource = {
      ...source,
      commonQuestions: [
        "What moves between the columns?",
        "Why does the ordering matter?",
        "What happens on the final step?",
      ],
    };
    expect(
      liveGeneratedExplainerSchema.safeParse({ spec: liveSource }).success,
    ).toBe(true);

    const staticStepper = structuredClone(liveSource);
    const allChipIds = staticStepper.chips.map((chip) => chip.id);
    staticStepper.steps = staticStepper.steps.map((step) => ({
      ...step,
      columns: step.columns.map((column, index) => ({
        ...column,
        chipIds: index === 0 ? allChipIds : [],
      })),
    }));
    const result = liveGeneratedExplainerSchema.safeParse({
      spec: staticStepper,
    });

    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues.map((issue) => issue.message)).toContain(
        "No chip ever changes column across steps. Movement is the explanation: make the key object (a request, callback, value, or lookup probe) travel between columns, ending on the payoff step. For a family comparison, make each member a chip that moves through shared lifecycle or state columns; never make the members columns.",
      );
  });

  it("rejects unused chips from live-generated steppers", () => {
    const source = showcaseSpecs.find((spec) => spec.archetype === "stepper");
    if (!source || source.archetype !== "stepper")
      throw new Error("Expected a stepper showcase");

    const withUnusedChip = structuredClone(source);
    withUnusedChip.chips.push({
      id: "unused",
      label: "Unused",
      detail: null,
      tone: "slate",
    });
    const result = liveGeneratedExplainerSchema.safeParse({
      spec: withUnusedChip,
    });

    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues.map((issue) => issue.message)).toContain(
        "Every declared chip must appear in at least one step. Unused chips: unused",
      );
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

describe("ask schemas", () => {
  it("enforces target id semantics", () => {
    expect(
      askTargetSchema.safeParse({ kind: "general", id: null }).success,
    ).toBe(true);
    expect(
      askTargetSchema.safeParse({ kind: "chip", id: "callback" }).success,
    ).toBe(true);
    expect(
      askTargetSchema.safeParse({ kind: "general", id: "callback" }).success,
    ).toBe(false);
    expect(askTargetSchema.safeParse({ kind: "step", id: null }).success).toBe(
      false,
    );
  });

  it("bounds model-generated ask answers", () => {
    expect(
      askAnswerSchema.safeParse({
        answer: "Because it is queued.",
        followUp: null,
      }).success,
    ).toBe(true);
    expect(
      askAnswerSchema.safeParse({
        answer: "x".repeat(451),
        followUp: null,
      }).success,
    ).toBe(false);
    expect(
      askAnswerSchema.safeParse({
        answer: "Short answer.",
        followUp: "x".repeat(121),
      }).success,
    ).toBe(false);
  });
});
