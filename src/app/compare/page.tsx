import { Suspense } from "react";
import Link from "next/link";
import { ComparePicker } from "@/components/compare-picker";
import { LeaderboardChart } from "@/components/leaderboard-chart";
import { listGpus, listWorkloads, queryLeaderboard } from "@/lib/queries";

export const metadata = {
  title: "Compare GPUs",
};

export default function ComparePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-4 py-12 text-[var(--muted)] sm:px-6">
          Loading comparison…
        </div>
      }
    >
      <ComparePageContent searchParams={searchParams} />
    </Suspense>
  );
}

async function ComparePageContent({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const workload =
    typeof sp.workload === "string" ? sp.workload : "vllm-serving";
  const precision =
    typeof sp.precision === "string" ? sp.precision : undefined;
  const gpuSlugs =
    typeof sp.gpus === "string"
      ? sp.gpus.split(",").map((s) => s.trim()).filter(Boolean)
      : ["mi300x", "h100"];

  const [gpus, workloads, rows] = await Promise.all([
    listGpus(),
    listWorkloads(),
    queryLeaderboard({
      workloadSlug: workload,
      precision,
      gpuSlugs,
    }),
  ]);

  const bestByGpu = new Map<string, (typeof rows)[number]>();
  for (const row of rows) {
    const prev = bestByGpu.get(row.gpuSlug);
    if (!prev || row.primaryValue > prev.primaryValue) {
      bestByGpu.set(row.gpuSlug, row);
    }
  }
  const chartData = gpuSlugs
    .map((slug) => bestByGpu.get(slug))
    .filter(Boolean) as typeof rows;

  const metricLabel = rows[0]?.primaryMetricLabel ?? "Primary metric";
  const workloadName =
    workloads.find((w) => w.slug === workload)?.name ?? workload;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Compare</h1>
      <p className="mt-2 max-w-2xl text-[var(--muted)]">
        Side-by-side best runs for {workloadName}
        {precision ? ` at ${precision}` : ""}.
      </p>

      <div className="mt-8">
        <Suspense fallback={null}>
          <ComparePicker
            workloads={workloads.map((w) => ({
              value: w.slug,
              label: w.name,
            }))}
            gpus={gpus.map((g) => ({ value: g.slug, label: g.name }))}
          />
        </Suspense>
      </div>

      <div className="mt-10 border border-[var(--line)] bg-[rgba(20,22,28,0.45)] p-4 sm:p-6">
        <LeaderboardChart data={chartData} metricLabel={metricLabel} />
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {gpuSlugs.map((slug) => {
          const run = bestByGpu.get(slug);
          const gpu = gpus.find((g) => g.slug === slug);
          return (
            <div
              key={slug}
              className="border border-[var(--line)] p-4"
            >
              <p className="text-xs tracking-wide text-[var(--muted)] uppercase">
                {gpu?.vendor ?? "gpu"}
              </p>
              <h2 className="mt-1 text-lg font-medium">
                {gpu?.name ?? slug}
              </h2>
              {run ? (
                <>
                  <p className="metric-num mt-4 text-3xl">
                    {run.primaryValue.toLocaleString()}
                  </p>
                  <p className="text-xs text-[var(--muted)]">
                    {run.primaryMetricLabel}
                  </p>
                  <ul className="mt-4 space-y-1 text-sm text-[var(--muted)]">
                    <li>{run.model}</li>
                    <li>
                      {run.precision} · {run.framework} {run.frameworkVersion}
                    </li>
                    <li>
                      {run.rocmVersion
                        ? `ROCm ${run.rocmVersion}`
                        : run.cudaVersion
                          ? `CUDA ${run.cudaVersion}`
                          : "—"}
                    </li>
                    <li>
                      <Link
                        href={`/runs/${run.id}`}
                        className="text-[var(--accent)] hover:underline"
                      >
                        View run
                      </Link>
                    </li>
                  </ul>
                </>
              ) : (
                <p className="mt-4 text-sm text-[var(--muted)]">
                  No matching run for this filter set.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
