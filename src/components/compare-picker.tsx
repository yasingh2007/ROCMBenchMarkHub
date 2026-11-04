"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

export function ComparePicker({
  workloads,
  gpus,
}: {
  workloads: Array<{ value: string; label: string }>;
  gpus: Array<{ value: string; label: string }>;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const initial = useMemo(
    () => (params.get("gpus") ?? "mi300x,h100").split(",").filter(Boolean),
    [params],
  );
  const [selected, setSelected] = useState<string[]>(initial);
  const [workload, setWorkload] = useState(params.get("workload") ?? "vllm-serving");
  const [precision, setPrecision] = useState(params.get("precision") ?? "bf16");

  function toggle(slug: string) {
    setSelected((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  }

  function apply() {
    const q = new URLSearchParams();
    q.set("workload", workload);
    if (precision) q.set("precision", precision);
    if (selected.length) q.set("gpus", selected.join(","));
    router.push(`/compare?${q.toString()}`);
  }

  const selectClass =
    "border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]";

  return (
    <div className="space-y-4 border border-[var(--line)] bg-[rgba(20,22,28,0.65)] p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-xs tracking-wide text-[var(--muted)] uppercase">
          Workload
          <select
            className={selectClass}
            value={workload}
            onChange={(e) => setWorkload(e.target.value)}
          >
            {workloads.map((w) => (
              <option key={w.value} value={w.value}>
                {w.label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-xs tracking-wide text-[var(--muted)] uppercase">
          Precision
          <select
            className={selectClass}
            value={precision}
            onChange={(e) => setPrecision(e.target.value)}
          >
            <option value="">Any</option>
            {["bf16", "fp16", "fp8", "fp32", "int8"].map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div>
        <p className="mb-2 text-xs tracking-wide text-[var(--muted)] uppercase">
          GPUs
        </p>
        <div className="flex flex-wrap gap-2">
          {gpus.map((g) => {
            const on = selected.includes(g.value);
            return (
              <button
                key={g.value}
                type="button"
                onClick={() => toggle(g.value)}
                className={`border px-3 py-1.5 text-sm transition ${
                  on
                    ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--fg)]"
                    : "border-[var(--line)] text-[var(--muted)] hover:border-[var(--fg)] hover:text-[var(--fg)]"
                }`}
              >
                {g.label}
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={apply}
        className="bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition hover:brightness-110"
      >
        Compare
      </button>
    </div>
  );
}
