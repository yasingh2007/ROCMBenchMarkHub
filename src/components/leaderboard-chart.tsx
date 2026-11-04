"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Point = {
  gpuName: string;
  gpuVendor: string;
  primaryValue: number;
  model: string;
};

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
];

export function LeaderboardChart({
  data,
  metricLabel,
}: {
  data: Point[];
  metricLabel: string;
}) {
  if (!data.length) {
    return (
      <div className="flex h-64 items-center justify-center border border-dashed border-[var(--line)] text-sm text-[var(--muted)]">
        No runs match these filters.
      </div>
    );
  }

  const chartData = data.map((d, i) => ({
    name: d.gpuName
      .replace("Instinct ", "")
      .replace("GeForce ", "")
      .replace("NVIDIA ", "")
      .replace("Radeon RX ", ""),
    value: Number(d.primaryValue.toFixed(2)),
    fill: COLORS[i % COLORS.length],
    model: d.model,
  }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--line)" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: "var(--muted)", fontSize: 12 }}
            axisLine={{ stroke: "var(--line)" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "var(--muted)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={56}
          />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
            contentStyle={{
              background: "#14161c",
              border: "1px solid var(--line)",
              borderRadius: 0,
              color: "var(--fg)",
            }}
            formatter={(value) => [
              typeof value === "number" ? value.toLocaleString() : String(value ?? ""),
              metricLabel,
            ]}
            labelFormatter={(label, payload) => {
              const model = payload?.[0]?.payload?.model;
              return model ? `${label} · ${model}` : String(label);
            }}
          />
          <Bar dataKey="value" radius={[2, 2, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
