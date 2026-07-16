import { Boxes, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export function ArchetypeBadge({
  archetype,
  why,
  compact = false,
}: {
  archetype: "stepper" | "playground";
  why: string;
  compact?: boolean;
}) {
  const Icon = archetype === "stepper" ? Boxes : SlidersHorizontal;
  return (
    <div
      className={cn(
        "inline-flex max-w-full items-start gap-2 rounded-2xl border border-violet-200/70 bg-violet-50 px-3 py-2 text-violet-900",
        compact && "py-1.5",
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div className="min-w-0 text-xs leading-5">
        <span className="font-bold capitalize">AI chose {archetype}</span>
        {!compact && <span className="text-violet-700"> · {why}</span>}
      </div>
    </div>
  );
}
