import { Suspense } from "react";
import Link from "next/link";
import { FilterBar } from "@/components/filters";
import { LeaderboardChart } from "@/components/leaderboard-chart";
import {
  listFingerprints,
  listGpus,
  listWorkloads,
  queryLeaderboard,
} from "@/lib/queries";

export const metadata = {
  title: "Leaderboard",
};

export default function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-4 py-12 text-[var(--muted)] sm:px-6">
          Loading leaderboard…
        </div>
      }
    >
      <LeaderboardPageContent searchParams={searchParams} />
    </Suspense>
  );
}

async function LeaderboardPageContent({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const workload = typeof sp.workload === "string" ? sp.workload : undefined;
  const gpu = typeof sp.gpu === "string" ? sp.gpu : undefined;
  const precision = typeof sp.precision === "string" ? sp.precision : undefined;
  const fingerprint =
    typeof sp.fingerprint === "string" ? sp.fingerprint : undefined;

  const [gpus, workloads, rows, fingerprints] = await Promise.all([
    listGpus(),
    listWorkloads(),
    queryLeaderboard({
      workloadSlug: workload,
      gpuSlug: gpu,
      precision,
      fingerprint,
    }),
    listFingerprints(workload),
  ]);

  const metricLabel = rows[0]?.primaryMetricLabel ?? "Primary metric";
  const precisions = Array.from(new Set(rows.map((r) => r.precision))).sort();
  // If filtered empty, still show common precisions
  const precisionOptions =
    precisions.length > 0 ? precisions : ["bf16", "fp16", "fp8", "fp32"];

  // Chart: best run per GPU for current filters
  const bestByGpu = new Map<string, (typeof rows)[number]>();
  for (const row of rows) {
    const prev = bestByGpu.get(row.gpuSlug);
    if (!prev || row.primaryValue > prev.primaryValue) {
      bestByGpu.set(row.gpuSlug, row);
    }
  }
  const chartData = Array.from(bestByGpu.values());

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Leaderboard</h1>
      <p className="mt-2 max-w-2xl text-[var(--muted)]">
        Filter by workload, GPU, precision, and config family so comparisons stay fair.
      </p>

      <div className="mt-8">
        <Suspense fallback={null}>
          <FilterBar
            basePath="/leaderboard"
            workloads={workloads.map((w) => ({
              value: w.slug,
              label: w.name,
            }))}
            gpus={gpus.map((g) => ({ value: g.slug, label: g.name }))}
            precisions={precisionOptions}
            fingerprints={fingerprints}
          />
        </Suspense>
      </div>

      <div className="mt-10 border border-[var(--line)] bg-[rgba(20,22,28,0.45)] p-4 sm:p-6">
        <p className="mb-4 text-xs tracking-wide text-[var(--muted)] uppercase">
          Best run per GPU · {metricLabel}
        </p>
        <LeaderboardChart data={chartData} metricLabel={metricLabel} />
      </div>

      <div className="mt-10 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-[var(--line)] text-xs tracking-wide text-[var(--muted)] uppercase">
            <tr>
              <th className="py-3 pr-3 font-medium">GPU</th>
              <th className="py-3 pr-3 font-medium">Workload</th>
              <th className="py-3 pr-3 font-medium">Model</th>
              <th className="py-3 pr-3 font-medium">Precision</th>
              <th className="py-3 pr-3 font-medium">Stack</th>
              <th className="py-3 pr-3 font-medium text-right">Metric</th>
              <th className="py-3 font-medium">Submitter</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-[var(--line)] hover:bg-white/[0.02]"
              >
                <td className="py-3 pr-3">
                  <Link
                    href={`/runs/${row.id}`}
                    className="font-medium hover:text-[var(--accent)]"
                  >
                    {row.gpuName}
                  </Link>
                  <div className="text-xs text-[var(--muted)]">
                    ×{row.gpuCount}
                  </div>
                </td>
                <td className="py-3 pr-3">{row.workloadName}</td>
                <td className="py-3 pr-3 font-mono text-xs">
                  {row.model.split("/").pop()}
                </td>
                <td className="py-3 pr-3">{row.precision}</td>
                <td className="py-3 pr-3 text-[var(--muted)]">
                  {row.framework} {row.frameworkVersion}
                  <div className="text-xs">
                    {row.rocmVersion
                      ? `ROCm ${row.rocmVersion}`
                      : row.cudaVersion
                        ? `CUDA ${row.cudaVersion}`
                        : "—"}
                  </div>
                </td>
                <td className="metric-num py-3 pr-3 text-right">
                  {row.primaryValue.toLocaleString()}
                  <div className="text-xs font-sans text-[var(--muted)]">
                    {row.primaryMetricLabel}
                  </div>
                </td>
                <td className="py-3 text-[var(--muted)]">@{row.userLogin}</td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={7} className="py-10 text-center text-[var(--muted)]">
                  No submissions match. Try clearing filters or{" "}
                  <Link href="/upload" className="text-[var(--accent)]">
                    upload a run
                  </Link>
                  .
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
