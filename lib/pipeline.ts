export const generationHeaders = {
  model: "x-grasp-model",
  generateMs: "x-grasp-generate-ms",
  repairUsed: "x-grasp-repair-used",
  validation: "x-grasp-validation",
} as const;

export type GenerationMeta = {
  model: string;
  generateMs: number;
  repairUsed: boolean;
  validation: "zod";
};

export function readGenerationMeta(headers: Headers): GenerationMeta | null {
  const model = headers.get(generationHeaders.model)?.trim();
  const generateMs = Number(headers.get(generationHeaders.generateMs));
  const repairUsed = headers.get(generationHeaders.repairUsed);
  const validation = headers.get(generationHeaders.validation);
  if (
    !model ||
    !Number.isFinite(generateMs) ||
    generateMs < 0 ||
    (repairUsed !== "true" && repairUsed !== "false") ||
    validation !== "zod"
  )
    return null;
  return {
    model,
    generateMs: Math.round(generateMs),
    repairUsed: repairUsed === "true",
    validation,
  };
}
