import { z } from "zod";

export const levelSchema = z.enum([
  "beginner",
  "student",
  "interview",
  "deep_dive",
]);

const id = z.string().regex(/^[a-z0-9][a-z0-9_-]{0,47}$/);
const shortText = z.string().trim().min(1).max(160);
const bodyText = z.string().trim().min(1).max(700);

const baseSpec = z
  .object({
    version: z.literal(1),
    title: z.string().trim().min(2).max(90),
    concept: z.string().trim().min(1).max(240),
    level: levelSchema,
    summary: z.string().trim().min(10).max(320),
    whyThisArchetype: z.string().trim().min(8).max(220),
    keyTakeaway: z.string().trim().min(8).max(280),
  })
  .strict();

const chipSchema = z
  .object({
    id,
    label: shortText,
    detail: z.string().trim().max(240).nullable().default(null),
    tone: z.enum(["violet", "cyan", "amber", "rose", "slate"]).default("slate"),
  })
  .strict();

const columnSchema = z
  .object({
    id,
    title: shortText,
    hint: z.string().trim().max(120).nullable().default(null),
  })
  .strict();

const stepColumnSchema = z
  .object({ columnId: id, chipIds: z.array(id).max(12) })
  .strict();

const stepSchema = z
  .object({
    id,
    title: shortText,
    description: bodyText,
    columns: z.array(stepColumnSchema).min(2).max(4),
    callout: z.string().trim().max(220).nullable().default(null),
  })
  .strict();

export const stepperSpecSchema = baseSpec
  .extend({
    archetype: z.literal("stepper"),
    columns: z.array(columnSchema).min(2).max(4),
    chips: z.array(chipSchema).min(1).max(18),
    steps: z.array(stepSchema).min(2).max(8),
  })
  .strict()
  .superRefine((spec, ctx) => {
    const columnIds = new Set(spec.columns.map((column) => column.id));
    const chipIds = new Set(spec.chips.map((chip) => chip.id));
    if (columnIds.size !== spec.columns.length)
      ctx.addIssue({
        code: "custom",
        message: "Column ids must be unique",
        path: ["columns"],
      });
    if (chipIds.size !== spec.chips.length)
      ctx.addIssue({
        code: "custom",
        message: "Chip ids must be unique",
        path: ["chips"],
      });

    spec.steps.forEach((step, stepIndex) => {
      const usedColumns = new Set<string>();
      const usedChips = new Set<string>();
      step.columns.forEach((column, columnIndex) => {
        if (!columnIds.has(column.columnId))
          ctx.addIssue({
            code: "custom",
            message: `Unknown column: ${column.columnId}`,
            path: ["steps", stepIndex, "columns", columnIndex, "columnId"],
          });
        if (usedColumns.has(column.columnId))
          ctx.addIssue({
            code: "custom",
            message: "A column may appear only once per step",
            path: ["steps", stepIndex, "columns"],
          });
        usedColumns.add(column.columnId);
        column.chipIds.forEach((chipId, chipIndex) => {
          if (!chipIds.has(chipId))
            ctx.addIssue({
              code: "custom",
              message: `Unknown chip: ${chipId}`,
              path: [
                "steps",
                stepIndex,
                "columns",
                columnIndex,
                "chipIds",
                chipIndex,
              ],
            });
          if (usedChips.has(chipId))
            ctx.addIssue({
              code: "custom",
              message: `Chip ${chipId} appears twice in one step`,
              path: ["steps", stepIndex, "columns"],
            });
          usedChips.add(chipId);
        });
      });
      if (usedColumns.size !== columnIds.size)
        ctx.addIssue({
          code: "custom",
          message: "Every step must include every declared column",
          path: ["steps", stepIndex, "columns"],
        });
    });
  });

const optionValueSchema = z.union([
  z.string().max(80),
  z.number().finite(),
  z.boolean(),
]);

const controlSchema = z.discriminatedUnion("kind", [
  z
    .object({
      id,
      kind: z.literal("slider"),
      label: shortText,
      min: z.number().finite(),
      max: z.number().finite(),
      step: z.number().positive(),
      defaultValue: z.number().finite(),
      suffix: z.string().max(12).nullable().default(null),
    })
    .strict(),
  z
    .object({
      id,
      kind: z.literal("select"),
      label: shortText,
      options: z
        .array(
          z.object({ label: shortText, value: z.string().max(80) }).strict(),
        )
        .min(2)
        .max(8),
      defaultValue: z.string().max(80),
    })
    .strict(),
  z
    .object({
      id,
      kind: z.literal("toggle"),
      label: shortText,
      defaultValue: z.boolean(),
    })
    .strict(),
]);

const metricSchema = z
  .object({
    id,
    label: shortText,
    value: shortText,
    note: z.string().trim().max(120).nullable().default(null),
    tone: z.enum(["good", "neutral", "warning"]).default("neutral"),
  })
  .strict();
const chartPointSchema = z
  .object({
    x: z.string().max(40),
    values: z.record(z.string(), z.number().finite()),
  })
  .strict();
const seriesSchema = z
  .object({
    id,
    label: shortText,
    color: z.enum(["violet", "cyan", "amber", "rose"]),
  })
  .strict();

const scenarioSchema = z
  .object({
    id,
    when: z.record(z.string(), optionValueSchema),
    explanation: bodyText,
    metrics: z.array(metricSchema).min(1).max(4),
    chartData: z.array(chartPointSchema).min(2).max(16),
  })
  .strict();

export const playgroundSpecSchema = baseSpec
  .extend({
    archetype: z.literal("playground"),
    controls: z.array(controlSchema).min(1).max(3),
    series: z.array(seriesSchema).min(1).max(4),
    xAxisLabel: shortText,
    yAxisLabel: shortText,
    scenarios: z.array(scenarioSchema).min(2).max(24),
  })
  .strict()
  .superRefine((spec, ctx) => {
    const controlIds = new Set(spec.controls.map((control) => control.id));
    const seriesIds = new Set(spec.series.map((series) => series.id));
    const scenarioIds = new Set(spec.scenarios.map((scenario) => scenario.id));
    const controlDomains = new Map<string, Array<string | number | boolean>>();
    if (controlIds.size !== spec.controls.length)
      ctx.addIssue({
        code: "custom",
        message: "Control ids must be unique",
        path: ["controls"],
      });
    if (seriesIds.size !== spec.series.length)
      ctx.addIssue({
        code: "custom",
        message: "Series ids must be unique",
        path: ["series"],
      });
    if (scenarioIds.size !== spec.scenarios.length)
      ctx.addIssue({
        code: "custom",
        message: "Scenario ids must be unique",
        path: ["scenarios"],
      });

    spec.controls.forEach((control, controlIndex) => {
      if (control.kind === "slider") {
        if (control.min >= control.max) {
          ctx.addIssue({
            code: "custom",
            message: "Slider min must be less than max",
            path: ["controls", controlIndex, "min"],
          });
          return;
        }

        const rawStepCount = (control.max - control.min) / control.step;
        const stepCount = Math.round(rawStepCount);
        if (Math.abs(rawStepCount - stepCount) > 1e-8) {
          ctx.addIssue({
            code: "custom",
            message: "Slider step must divide the min-to-max range exactly",
            path: ["controls", controlIndex, "step"],
          });
          return;
        }

        const values = Array.from(
          { length: stepCount + 1 },
          (_, index) => control.min + index * control.step,
        );
        if (values.length > 12) {
          ctx.addIssue({
            code: "custom",
            message: "A slider may expose at most 12 discrete values",
            path: ["controls", controlIndex],
          });
        }
        if (
          !values.some(
            (value) => Math.abs(value - control.defaultValue) <= 1e-8,
          )
        ) {
          ctx.addIssue({
            code: "custom",
            message: "Slider defaultValue must be one of its discrete values",
            path: ["controls", controlIndex, "defaultValue"],
          });
        }
        controlDomains.set(control.id, values);
      }

      if (control.kind === "select") {
        const values = control.options.map((option) => option.value);
        if (new Set(values).size !== values.length) {
          ctx.addIssue({
            code: "custom",
            message: "Select option values must be unique",
            path: ["controls", controlIndex, "options"],
          });
        }
        if (!values.includes(control.defaultValue)) {
          ctx.addIssue({
            code: "custom",
            message: "Select defaultValue must match an option value",
            path: ["controls", controlIndex, "defaultValue"],
          });
        }
        controlDomains.set(control.id, values);
      }

      if (control.kind === "toggle") {
        controlDomains.set(control.id, [false, true]);
      }
    });

    const combinationCount = spec.controls.reduce(
      (count, control) => count * (controlDomains.get(control.id)?.length ?? 0),
      1,
    );
    if (combinationCount > 24) {
      ctx.addIssue({
        code: "custom",
        message: "The control state space may contain at most 24 combinations",
        path: ["controls"],
      });
    }

    const seenStates = new Set<string>();
    spec.scenarios.forEach((scenario, index) => {
      const whenKeys = Object.keys(scenario.when);
      for (const controlId of whenKeys)
        if (!controlIds.has(controlId))
          ctx.addIssue({
            code: "custom",
            message: `Unknown control: ${controlId}`,
            path: ["scenarios", index, "when"],
          });
      for (const control of spec.controls) {
        if (!(control.id in scenario.when)) {
          ctx.addIssue({
            code: "custom",
            message: `Missing control state: ${control.id}`,
            path: ["scenarios", index, "when"],
          });
          continue;
        }
        const value = scenario.when[control.id];
        const domain = controlDomains.get(control.id) ?? [];
        const matchesDomain = domain.some((allowed) =>
          typeof allowed === "number" && typeof value === "number"
            ? Math.abs(allowed - value) <= 1e-8
            : allowed === value,
        );
        if (!matchesDomain) {
          ctx.addIssue({
            code: "custom",
            message: `Invalid value for control: ${control.id}`,
            path: ["scenarios", index, "when", control.id],
          });
        }
      }

      if (whenKeys.length === controlIds.size) {
        const stateKey = JSON.stringify(
          spec.controls.map((control) => scenario.when[control.id]),
        );
        if (seenStates.has(stateKey)) {
          ctx.addIssue({
            code: "custom",
            message: "Scenario control states must be unique",
            path: ["scenarios", index, "when"],
          });
        }
        seenStates.add(stateKey);
      }

      const metricIds = scenario.metrics.map((metric) => metric.id);
      if (new Set(metricIds).size !== metricIds.length) {
        ctx.addIssue({
          code: "custom",
          message: "Metric ids must be unique within a scenario",
          path: ["scenarios", index, "metrics"],
        });
      }

      scenario.chartData.forEach((point, pointIndex) => {
        for (const valueSeriesId of Object.keys(point.values))
          if (!seriesIds.has(valueSeriesId))
            ctx.addIssue({
              code: "custom",
              message: `Unknown series value: ${valueSeriesId}`,
              path: ["scenarios", index, "chartData", pointIndex, "values"],
            });
        for (const seriesId of seriesIds)
          if (!(seriesId in point.values))
            ctx.addIssue({
              code: "custom",
              message: `Missing series value: ${seriesId}`,
              path: ["scenarios", index, "chartData", pointIndex, "values"],
            });
      });
    });

    if (
      combinationCount > 0 &&
      combinationCount <= 24 &&
      spec.scenarios.length !== combinationCount
    ) {
      ctx.addIssue({
        code: "custom",
        message: `Expected exactly ${combinationCount} scenarios to cover every control state`,
        path: ["scenarios"],
      });
    }
  });

export const explainerSpecSchema = z.discriminatedUnion("archetype", [
  stepperSpecSchema,
  playgroundSpecSchema,
]);

const generatedControlValuesSchema = z
  .array(z.object({ controlId: id, value: optionValueSchema }).strict())
  .min(1)
  .max(3)
  .superRefine((values, ctx) => {
    if (new Set(values.map((value) => value.controlId)).size !== values.length)
      ctx.addIssue({
        code: "custom",
        message: "controlId values must be unique",
      });
  });

const generatedSeriesValuesSchema = z
  .array(z.object({ seriesId: id, value: z.number().finite() }).strict())
  .min(1)
  .max(4)
  .superRefine((values, ctx) => {
    if (new Set(values.map((value) => value.seriesId)).size !== values.length)
      ctx.addIssue({
        code: "custom",
        message: "seriesId values must be unique",
      });
  });

const generatedPlaygroundSpecSchema = baseSpec
  .extend({
    archetype: z.literal("playground"),
    controls: z.array(controlSchema).min(1).max(3),
    series: z.array(seriesSchema).min(1).max(4),
    xAxisLabel: shortText,
    yAxisLabel: shortText,
    scenarios: z
      .array(
        z
          .object({
            id,
            when: generatedControlValuesSchema,
            explanation: bodyText,
            metrics: z.array(metricSchema).min(1).max(4),
            chartData: z
              .array(
                z
                  .object({
                    x: z.string().max(40),
                    values: generatedSeriesValuesSchema,
                  })
                  .strict(),
              )
              .min(2)
              .max(16),
          })
          .strict(),
      )
      .min(2)
      .max(24),
  })
  .strict();

/** The OpenAI transport schema avoids a root union and arbitrary-key records. */
export const generatedExplainerWireSchema = z
  .object({
    spec: z.discriminatedUnion("archetype", [
      stepperSpecSchema,
      generatedPlaygroundSpecSchema,
    ]),
  })
  .strict();

/** Normalizes the transport shape, then applies the renderer's trust boundary. */
export const generatedExplainerSchema = generatedExplainerWireSchema
  .transform(({ spec }) => {
    if (spec.archetype === "stepper") return spec;
    return {
      ...spec,
      scenarios: spec.scenarios.map((scenario) => ({
        ...scenario,
        when: Object.fromEntries(
          scenario.when.map(({ controlId, value }) => [controlId, value]),
        ),
        chartData: scenario.chartData.map((point) => ({
          ...point,
          values: Object.fromEntries(
            point.values.map(({ seriesId, value }) => [seriesId, value]),
          ),
        })),
      })),
    };
  })
  .transform((spec, ctx) => {
    const parsed = explainerSpecSchema.safeParse(spec);
    if (parsed.success) return parsed.data;
    for (const issue of parsed.error.issues)
      ctx.addIssue({
        code: "custom",
        message: issue.message,
        path: issue.path,
      });
    return z.NEVER;
  });

/**
 * Generation-time invariant on top of the trust boundary: a freshly generated
 * stepper must animate. Showcase fixtures and shared links are intentionally
 * not re-validated against this rule.
 */
export const liveGeneratedExplainerSchema =
  generatedExplainerSchema.superRefine((spec, ctx) => {
    if (spec.archetype !== "stepper") return;
    const lastColumn = new Map<string, string>();
    const usedChips = new Set<string>();
    let moves = false;
    for (const step of spec.steps)
      for (const column of step.columns)
        for (const chipId of column.chipIds) {
          usedChips.add(chipId);
          const previous = lastColumn.get(chipId);
          if (previous !== undefined && previous !== column.columnId)
            moves = true;
          lastColumn.set(chipId, column.columnId);
        }
    if (!moves)
      ctx.addIssue({
        code: "custom",
        message:
          "No chip ever changes column across steps. Movement is the explanation: make the key object (a request, callback, value, or lookup probe) travel between columns, ending on the payoff step.",
        path: ["spec", "steps"],
      });

    const unusedChipIds = spec.chips
      .map((chip) => chip.id)
      .filter((chipId) => !usedChips.has(chipId));
    if (unusedChipIds.length > 0)
      ctx.addIssue({
        code: "custom",
        message: `Every declared chip must appear in at least one step. Unused chips: ${unusedChipIds.join(", ")}`,
        path: ["spec", "steps"],
      });
  });

export type Level = z.infer<typeof levelSchema>;
export type StepperSpec = z.output<typeof stepperSpecSchema>;
export type PlaygroundSpec = z.output<typeof playgroundSpecSchema>;
export type ExplainerSpec = z.output<typeof explainerSpecSchema>;
export type StepperSpecInput = z.input<typeof stepperSpecSchema>;
export type PlaygroundSpecInput = z.input<typeof playgroundSpecSchema>;
export type ExplainerSpecInput = z.input<typeof explainerSpecSchema>;

export const interviewQuestionSchema = z
  .object({
    id,
    question: bodyText,
    kind: z.enum(["concept", "code_output", "scenario"]),
    code: z.string().max(1200).nullable().default(null),
    expectedAnswer: z.string().trim().min(1).max(500),
    rubric: z.string().trim().min(1).max(500),
  })
  .strict();

const interviewQuestionsSchema = z
  .array(interviewQuestionSchema)
  .length(3)
  .superRefine((questions, ctx) => {
    if (new Set(questions.map((question) => question.id)).size !== 3)
      ctx.addIssue({
        code: "custom",
        message: "Question ids must be unique",
      });
    if (!questions.some((question) => question.kind === "code_output"))
      ctx.addIssue({
        code: "custom",
        message: "At least one code_output question is required",
      });
  });

export const interviewSetSchema = z
  .object({ questions: interviewQuestionsSchema })
  .strict();

export const interviewVerdictSchema = z
  .object({
    verdict: z.enum(["correct", "close", "needs_work"]),
    feedback: z.string().trim().min(1).max(420),
    correction: z.string().trim().max(500).nullable().default(null),
  })
  .strict();

export const interviewAssessmentSchema = z
  .object({
    results: z
      .array(
        z
          .object({
            questionId: id,
            verdict: z.enum(["correct", "close", "needs_work"]),
            feedback: z.string().trim().min(1).max(420),
            correction: z.string().trim().max(500).nullable().default(null),
          })
          .strict(),
      )
      .length(3),
  })
  .strict();

export type InterviewSet = z.infer<typeof interviewSetSchema>;
export type InterviewAssessment = z.infer<typeof interviewAssessmentSchema>;
