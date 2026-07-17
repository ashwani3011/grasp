"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MessageCircleQuestion } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AskTarget, PlaygroundSpec } from "@/lib/schema";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const colors = {
  violet: "#7c3aed",
  cyan: "#0891b2",
  amber: "#d97706",
  rose: "#e11d48",
};

type ControlValue = string | number | boolean;

export function Playground({
  spec,
  onAsk,
}: {
  spec: PlaygroundSpec;
  onAsk?: (target: AskTarget, label: string) => void;
}) {
  const defaults = useMemo(
    () =>
      Object.fromEntries(
        spec.controls.map((control) => [control.id, control.defaultValue]),
      ) as Record<string, ControlValue>,
    [spec.controls],
  );
  const [values, setValues] = useState(defaults);
  const scenario =
    spec.scenarios.find((candidate) =>
      Object.entries(candidate.when).every(
        ([id, value]) => values[id] === value,
      ),
    ) ?? spec.scenarios[0];
  const chartData = scenario.chartData.map((point) => ({
    x: point.x,
    ...point.values,
  }));

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="space-y-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
        <div>
          <div className="text-xs font-extrabold tracking-[0.16em] text-slate-500 uppercase">
            Controls
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Change an input. The model can only select verified scenarios—never
            execute code.
          </p>
        </div>
        {spec.controls.map((control) => (
          <div key={control.id}>
            <label
              htmlFor={control.id}
              className="mb-2 flex items-center justify-between gap-3 text-sm font-bold text-slate-800"
            >
              {control.label}
              <span className="rounded-md bg-white px-2 py-1 font-mono text-xs text-violet-700 shadow-sm">
                {String(values[control.id])}
                {control.kind === "slider" ? control.suffix : ""}
              </span>
            </label>
            {control.kind === "slider" && (
              <input
                id={control.id}
                type="range"
                min={control.min}
                max={control.max}
                step={control.step}
                value={Number(values[control.id])}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    [control.id]: Number(event.target.value),
                  }))
                }
                className="w-full accent-violet-600"
              />
            )}
            {control.kind === "select" && (
              <select
                id={control.id}
                value={String(values[control.id])}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    [control.id]: event.target.value,
                  }))
                }
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium outline-none focus:border-violet-400"
              >
                {control.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
            {control.kind === "toggle" && (
              <button
                id={control.id}
                type="button"
                role="switch"
                aria-checked={Boolean(values[control.id])}
                onClick={() =>
                  setValues((current) => ({
                    ...current,
                    [control.id]: !current[control.id],
                  }))
                }
                className={cn(
                  "relative h-7 w-12 rounded-full transition-colors",
                  values[control.id] ? "bg-violet-600" : "bg-slate-300",
                )}
              >
                <span
                  className={cn(
                    "absolute top-1 size-5 rounded-full bg-white shadow-sm transition-transform",
                    values[control.id] ? "translate-x-0.5" : "-translate-x-5",
                  )}
                />
              </button>
            )}
          </div>
        ))}
        <motion.div
          key={scenario.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl bg-violet-50 p-3 text-xs leading-5 text-violet-900"
        >
          <p>{scenario.explanation}</p>
          {onAsk && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 h-8 px-2 text-xs text-violet-700 hover:bg-violet-100"
              onClick={() =>
                onAsk(
                  { kind: "scenario", id: scenario.id },
                  "Current playground scenario",
                )
              }
            >
              <MessageCircleQuestion className="size-3.5" />
              Ask about this scenario
            </Button>
          )}
        </motion.div>
      </aside>

      <div className="min-w-0 space-y-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {scenario.metrics.map((metric) => (
            <motion.div
              layout
              key={metric.id}
              className="rounded-2xl border border-slate-200 bg-white p-3.5"
            >
              <div className="text-[10px] font-bold tracking-[0.13em] text-slate-400 uppercase">
                {metric.label}
              </div>
              <div
                className={cn(
                  "mt-1 text-xl font-extrabold tracking-tight",
                  metric.tone === "good"
                    ? "text-emerald-600"
                    : metric.tone === "warning"
                      ? "text-amber-600"
                      : "text-slate-900",
                )}
              >
                {metric.value}
              </div>
              {metric.note && (
                <div className="mt-0.5 text-[10px] text-slate-400">
                  {metric.note}
                </div>
              )}
            </motion.div>
          ))}
        </div>
        <div
          className="h-[310px] rounded-2xl border border-slate-200 bg-white p-4"
          aria-label={`${spec.title} chart`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 8, right: 8, bottom: 8, left: 0 }}
            >
              <defs>
                {spec.series.map((series) => (
                  <linearGradient
                    key={series.id}
                    id={`gradient-${series.id}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={colors[series.color]}
                      stopOpacity={0.28}
                    />
                    <stop
                      offset="95%"
                      stopColor={colors[series.color]}
                      stopOpacity={0}
                    />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid
                strokeDasharray="4 4"
                stroke="#e2e8f0"
                vertical={false}
              />
              <XAxis
                dataKey="x"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#64748b", fontSize: 11 }}
                label={{
                  value: spec.xAxisLabel,
                  position: "insideBottom",
                  offset: -6,
                  fill: "#94a3b8",
                  fontSize: 10,
                }}
              />
              <YAxis
                width={46}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#64748b", fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  borderColor: "#e2e8f0",
                  fontSize: 12,
                }}
              />
              {spec.series.map((series) => (
                <Area
                  key={series.id}
                  type="monotone"
                  dataKey={series.id}
                  name={series.label}
                  stroke={colors[series.color]}
                  strokeWidth={2.5}
                  fill={`url(#gradient-${series.id})`}
                  animationDuration={350}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-4">
          {spec.series.map((series) => (
            <div
              key={series.id}
              className="flex items-center gap-2 text-xs font-semibold text-slate-600"
            >
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: colors[series.color] }}
              />
              {series.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
