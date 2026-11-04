"use client";

import { useRouter, useSearchParams } from "next/navigation";

type Option = { value: string; label: string };

export function FilterBar({
  workloads,
  gpus,
  precisions,
  fingerprints,
  basePath,
}: {
  workloads: Option[];
  gpus: Option[];
  precisions: string[];
  fingerprints: Array<{
    fingerprint: string;
    model: string;
    precision: string;
    framework: string;
  }>;
  basePath: string;
}) {
  const router = useRouter();
  const params = useSearchParams();

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (!value) next.delete(key);
    else next.set(key, value);
    router.push(`${basePath}?${next.toString()}`);
  }

  const selectClass =
    "w-full border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--fg)] outline-none focus:border-[var(--accent)]";

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <label className="grid gap-1 text-xs tracking-wide text-[var(--muted)] uppercase">
        Workload
        <select
          className={selectClass}
          value={params.get("workload") ?? ""}
          onChange={(e) => update("workload", e.target.value)}
        >
          <option value="">All</option>
          {workloads.map((w) => (
            <option key={w.value} value={w.value}>
              {w.label}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-1 text-xs tracking-wide text-[var(--muted)] uppercase">
        GPU
        <select
          className={selectClass}
          value={params.get("gpu") ?? ""}
          onChange={(e) => update("gpu", e.target.value)}
        >
          <option value="">All</option>
          {gpus.map((g) => (
            <option key={g.value} value={g.value}>
              {g.label}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-1 text-xs tracking-wide text-[var(--muted)] uppercase">
        Precision
        <select
          className={selectClass}
          value={params.get("precision") ?? ""}
          onChange={(e) => update("precision", e.target.value)}
        >
          <option value="">All</option>
          {precisions.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-1 text-xs tracking-wide text-[var(--muted)] uppercase">
        Config family
        <select
          className={selectClass}
          value={params.get("fingerprint") ?? ""}
          onChange={(e) => update("fingerprint", e.target.value)}
        >
          <option value="">All configs</option>
          {fingerprints.map((f) => (
            <option key={f.fingerprint} value={f.fingerprint}>
              {f.model.split("/").pop()} · {f.precision} · {f.framework}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
