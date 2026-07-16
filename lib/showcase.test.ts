import { describe, expect, it } from "vitest";
import type { PlaygroundSpec, StepperSpec } from "@/lib/schema";
import { showcaseBySlug } from "@/lib/showcase";

function stepper(slug: string): StepperSpec {
  const spec = showcaseBySlug[slug];
  if (spec.archetype !== "stepper")
    throw new Error(`${slug} must be a stepper showcase`);
  return spec;
}

function chipColumn(spec: StepperSpec, stepIndex: number, chipId: string) {
  return spec.steps[stepIndex].columns.find((column) =>
    column.chipIds.includes(chipId),
  )?.columnId;
}

function playground(slug: string): PlaygroundSpec {
  const spec = showcaseBySlug[slug];
  if (spec.archetype !== "playground")
    throw new Error(`${slug} must be a playground showcase`);
  return spec;
}

describe("showcase content correctness", () => {
  it("represents only real stack frames in the initial event-loop state", () => {
    const spec = stepper("event-loop");
    expect(
      spec.steps[0].columns.find(({ columnId }) => columnId === "stack"),
    ).toMatchObject({ chipIds: ["script"] });
    expect(spec.chips.map(({ id }) => id)).not.toContain("log-a");
    expect(spec.chips.map(({ id }) => id)).not.toContain("log-d");
  });

  it("never places an OAuth access token in the browser", () => {
    const spec = stepper("oauth");
    expect(chipColumn(spec, 0, "access-token")).toBeUndefined();
    expect(chipColumn(spec, 1, "access-token")).toBeUndefined();
    expect(
      spec.steps.some(
        (step) =>
          step.columns
            .find(({ columnId }) => columnId === "browser")
            ?.chipIds.includes("access-token") ?? false,
      ),
    ).toBe(false);
    expect(chipColumn(spec, 3, "access-token")).toBe("backend");
  });

  it("keeps a closure linked to one mutable lexical binding", () => {
    const spec = stepper("closures");
    expect(spec.chips.map(({ id }) => id)).not.toContain("count-one");
    for (const stepIndex of [0, 1, 2, 3])
      expect(chipColumn(spec, stepIndex, "count-binding")).toBe("environment");
    expect(chipColumn(spec, 0, "increment")).toBeUndefined();
    expect(chipColumn(spec, 2, "increment")).toBe("returned");
  });

  it("creates cache values only after a miss reaches the origin", () => {
    const spec = stepper("caching");
    expect(spec.title).toBe("A cache miss lifecycle");
    for (const stepIndex of [0, 1]) {
      expect(chipColumn(spec, stepIndex, "fresh-value")).toBeUndefined();
      expect(chipColumn(spec, stepIndex, "cache-entry")).toBeUndefined();
    }
    expect(chipColumn(spec, 2, "fresh-value")).toBe("database");
    expect(chipColumn(spec, 3, "cache-entry")).toBe("cache");
    expect(chipColumn(spec, 3, "fresh-value")).toBe("client");
  });

  it("plots quadratic Big-O work as a curve rather than a scaled line", () => {
    const spec = playground("big-o");
    for (const point of spec.scenarios[2].chartData) {
      const input = Number(point.x);
      expect(point.values.baseline).toBe(input ** 2);
      expect(point.values.optimized).toBe(input);
    }
  });

  it("plots indexing as linear scan work versus logarithmic lookup work", () => {
    const spec = playground("database-indexing");
    const endpointGaps = spec.scenarios.map((scenario) => {
      const point = scenario.chartData.at(-1);
      if (!point) throw new Error("Indexing scenario must contain chart data");
      const rows = Number(point.x);
      expect(point.values.baseline).toBe(rows);
      expect(point.values.optimized).toBe(Math.ceil(Math.log2(rows)));
      return point.values.baseline / point.values.optimized;
    });
    expect(endpointGaps[1]).toBeGreaterThan(endpointGaps[0]);
    expect(endpointGaps[2]).toBeGreaterThan(endpointGaps[1]);
  });

  it("models trailing debounce as one call per continuous burst", () => {
    const spec = playground("debouncing");
    for (const scenario of spec.scenarios)
      for (const point of scenario.chartData) {
        expect(point.values.baseline).toBe(Number(point.x));
        expect(point.values.optimized).toBe(1);
      }
  });

  it("keeps the valid cache hit-rate model at ten percent origin load", () => {
    const spec = playground("cache-hit-rate");
    for (const scenario of spec.scenarios)
      for (const point of scenario.chartData)
        expect(point.values.optimized).toBe(point.values.baseline * 0.1);
  });
});
