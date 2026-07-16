import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-slate-200/80 bg-white shadow-[0_20px_60px_-35px_rgba(15,23,42,.3)]",
        className,
      )}
      {...props}
    />
  );
}
