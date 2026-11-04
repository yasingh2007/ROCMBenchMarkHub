import Link from "next/link";
import { LandingHero } from "@/components/home/landing-hero";
import { WorkloadStrip } from "@/components/home/workload-strip";
import { GpuMatrix } from "@/components/home/gpu-matrix";
import { HowItWorks } from "@/components/home/how-it-works";
import { listGpus, listWorkloads, queryLeaderboard } from "@/lib/queries";

export default async function HomePage() {
  const [gpus, workloads, vllmRuns, allRuns] = await Promise.all([
    listGpus(),
    listWorkloads(),
    queryLeaderboard({ workloadSlug: "vllm-serving" }),
    queryLeaderboard({}),
  ]);

  const bestByGpu = new Map<string, (typeof vllmRuns)[number]>();
  for (const row of vllmRuns) {
    const prev = bestByGpu.get(row.gpuSlug);
    if (!prev || row.primaryValue > prev.primaryValue) {
      bestByGpu.set(row.gpuSlug, row);
    }
  }

  const previewRuns = Array.from(bestByGpu.values())
    .sort((a, b) => b.primaryValue - a.primaryValue)
    .slice(0, 4)
    .map((r) => ({
      gpuName: r.gpuName,
      primaryValue: r.primaryValue,
      gpuVendor: r.gpuVendor,
    }));

  const top = vllmRuns.slice(0, 5);

  return (
    <div>
      <LandingHero
        stats={{
          gpus: gpus.length,
          workloads: workloads.length,
          runs: allRuns.length,
        }}
        previewRuns={previewRuns}
      />

      <WorkloadStrip workloads={workloads} />
      <GpuMatrix gpus={gpus} />

      <section className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Latest vLLM serving results
            </h2>
            <p className="mt-2 text-[var(--muted)]">
              Highest throughput entries for production-style serving.
            </p>
          </div>
          <Link
            href="/leaderboard?workload=vllm-serving"
            className="text-sm text-[var(--accent)] hover:underline"
          >
            View all
          </Link>
        </div>
        <ul className="mt-8 space-y-2">
          {top.map((run, i) => (
            <li key={run.id}>
              <Link
                href={`/runs/${run.id}`}
                className="flex items-center justify-between gap-4 border border-[var(--line)] px-4 py-3 transition hover:border-[var(--accent)] hover:bg-white/[0.02]"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <span className="metric-num w-6 shrink-0 text-[var(--muted)]">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{run.gpuName}</p>
                    <p className="truncate text-sm text-[var(--muted)]">
                      {run.model.split("/").pop()} · {run.precision} ·{" "}
                      {run.framework}
                    </p>
                  </div>
                </div>
                <p className="metric-num shrink-0 text-lg">
                  {run.primaryValue.toLocaleString()}
                  <span className="ml-1 text-xs text-[var(--muted)]">tok/s</span>
                </p>
              </Link>
            </li>
          ))}
          {!top.length && (
            <li className="rounded border border-dashed border-[var(--line)] px-4 py-8 text-center text-sm text-[var(--muted)]">
              No runs yet. Run{" "}
              <code className="text-[var(--fg)]">npm run db:seed</code> or{" "}
              <Link href="/upload" className="text-[var(--accent)]">
                upload a result
              </Link>
              .
            </li>
          )}
        </ul>
      </section>

      <HowItWorks />
    </div>
  );
}
