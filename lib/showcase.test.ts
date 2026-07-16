import { describe, expect, it } from "vitest";
import type { StepperSpec } from "@/lib/schema";
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
    for (const stepIndex of [0, 1]) {
      expect(chipColumn(spec, stepIndex, "fresh-value")).toBeUndefined();
      expect(chipColumn(spec, stepIndex, "cache-entry")).toBeUndefined();
    }
    expect(chipColumn(spec, 2, "fresh-value")).toBe("database");
    expect(chipColumn(spec, 3, "cache-entry")).toBe("cache");
    expect(chipColumn(spec, 3, "fresh-value")).toBe("client");
  });
});
