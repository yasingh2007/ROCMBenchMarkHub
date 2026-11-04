import Link from "next/link";
import { notFound } from "next/navigation";
import { LeaderboardChart } from "@/components/leaderboard-chart";
import { getWorkloadBySlug, queryLeaderboard } from "@/lib/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const workload = await getWorkloadBySlug(slug);
  return {
    title: workload?.name ?? "Workload",
    description: workload?.description,
  };
}

export default async function WorkloadPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const workload = await getWorkloadBySlug(slug);
  if (!workload) notFound();

  const runs = await queryLeaderboard({ workloadSlug: slug });
  const bestByGpu = new Map<string, (typeof runs)[number]>();
  for (const row of runs) {
    const prev = bestByGpu.get(row.gpuSlug);
    if (!prev || row.primaryValue > prev.primaryValue) {
      bestByGpu.set(row.gpuSlug, row);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <p className="text-xs tracking-[0.2em] text-[var(--muted)] uppercase">
        {workload.category.replaceAll("_", " ")}
      </p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">
        {workload.name}
      </h1>
      <p className="mt-3 max-w-2xl text-[var(--muted)]">{workload.description}</p>

      <div className="mt-10 border border-[var(--line)] bg-[rgba(20,22,28,0.45)] p-4 sm:p-6">
        <LeaderboardChart
          data={Array.from(bestByGpu.values())}
          metricLabel={workload.primaryMetricLabel}
        />
      </div>

      <div className="mt-10 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-[var(--line)] text-xs tracking-wide text-[var(--muted)] uppercase">
            <tr>
              <th className="py-3 pr-3 font-medium">GPU</th>
              <th className="py-3 pr-3 font-medium">Model</th>
              <th className="py-3 pr-3 font-medium">Stack</th>
              <th className="py-3 pr-3 font-medium text-right">
                {workload.primaryMetricLabel}
              </th>
              <th className="py-3 font-medium">Run</th>
            </tr>
          </thead>
          <tbody>
            {runs.map((run) => (
              <tr key={run.id} className="border-b border-[var(--line)]">
                <td className="py-3 pr-3">
                  <Link
                    href={`/gpus/${run.gpuSlug}`}
                    className="hover:text-[var(--accent)]"
                  >
                    {run.gpuName}
                  </Link>
                </td>
                <td className="py-3 pr-3 font-mono text-xs">
                  {run.model.split("/").pop()} · {run.precision}
                </td>
                <td className="py-3 pr-3 text-[var(--muted)]">
                  {run.framework} {run.frameworkVersion}
                </td>
                <td className="metric-num py-3 pr-3 text-right">
                  {run.primaryValue.toLocaleString()}
                </td>
                <td className="py-3">
                  <Link
                    href={`/runs/${run.id}`}
                    className="text-[var(--accent)] hover:underline"
                  >
                    Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
