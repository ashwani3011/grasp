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
    detail: z.string().trim().max(240).optional(),
    tone: z.enum(["violet", "cyan", "amber", "rose", "slate"]).default("slate"),
  })
  .strict();

const columnSchema = z
  .object({ id, title: shortText, hint: z.string().trim().max(120).optional() })
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
    callout: z.string().trim().max(220).optional(),
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
      suffix: z.string().max(12).optional(),
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
    note: z.string().trim().max(120).optional(),
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
    spec.scenarios.forEach((scenario, index) => {
      for (const controlId of Object.keys(scenario.when))
        if (!controlIds.has(controlId))
          ctx.addIssue({
            code: "custom",
            message: `Unknown control: ${controlId}`,
            path: ["scenarios", index, "when"],
          });
      scenario.chartData.forEach((point, pointIndex) => {
        for (const seriesId of seriesIds)
          if (!(seriesId in point.values))
            ctx.addIssue({
              code: "custom",
              message: `Missing series value: ${seriesId}`,
              path: ["scenarios", index, "chartData", pointIndex, "values"],
            });
      });
    });
  });

export const explainerSpecSchema = z.discriminatedUnion("archetype", [
  stepperSpecSchema,
  playgroundSpecSchema,
]);

export type Level = z.infer<typeof levelSchema>;
export type StepperSpec = z.infer<typeof stepperSpecSchema>;
export type PlaygroundSpec = z.infer<typeof playgroundSpecSchema>;
export type ExplainerSpec = z.infer<typeof explainerSpecSchema>;

export const interviewQuestionSchema = z
  .object({
    id,
    question: bodyText,
    kind: z.enum(["concept", "code_output", "scenario"]),
    code: z.string().max(1200).optional(),
    expectedAnswer: z.string().trim().min(1).max(500),
    rubric: z.string().trim().min(1).max(500),
  })
  .strict();

export const interviewSetSchema = z
  .object({ questions: z.array(interviewQuestionSchema).length(3) })
  .strict()
  .superRefine((set, ctx) => {
    if (!set.questions.some((question) => question.kind === "code_output"))
      ctx.addIssue({
        code: "custom",
        message: "At least one code_output question is required",
        path: ["questions"],
      });
  });

export const interviewVerdictSchema = z
  .object({
    verdict: z.enum(["correct", "close", "needs_work"]),
    feedback: z.string().trim().min(1).max(420),
    correction: z.string().trim().max(500).optional(),
  })
  .strict();
