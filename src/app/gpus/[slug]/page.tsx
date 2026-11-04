import Link from "next/link";
import { notFound } from "next/navigation";
import { getGpuBySlug, queryLeaderboard } from "@/lib/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const gpu = await getGpuBySlug(slug);
  return {
    title: gpu?.name ?? "GPU",
    description: gpu
      ? `Benchmark results for ${gpu.name} (${gpu.architecture}, ${gpu.memoryGb} GB) on ROCm Benchmark Hub.`
      : undefined,
  };
}

export default async function GpuPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const gpu = await getGpuBySlug(slug);
  if (!gpu) notFound();

  const runs = await queryLeaderboard({ gpuSlug: slug });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <p
        className="text-xs tracking-[0.2em] uppercase"
        style={{ color: gpu.vendor === "amd" ? "var(--amd)" : "var(--nvidia)" }}
      >
        {gpu.vendor}
      </p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">{gpu.name}</h1>
      <p className="mt-3 font-mono text-sm text-[var(--muted)]">
        {gpu.architecture} · {gpu.memoryGb} GB · {gpu.formFactor}
      </p>

      <div className="mt-10 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-[var(--line)] text-xs tracking-wide text-[var(--muted)] uppercase">
            <tr>
              <th className="py-3 pr-3 font-medium">Workload</th>
              <th className="py-3 pr-3 font-medium">Model</th>
              <th className="py-3 pr-3 font-medium">Precision</th>
              <th className="py-3 pr-3 font-medium text-right">Result</th>
              <th className="py-3 font-medium">Submitter</th>
            </tr>
          </thead>
          <tbody>
            {runs.map((run) => (
              <tr key={run.id} className="border-b border-[var(--line)]">
                <td className="py-3 pr-3">
                  <Link
                    href={`/workloads/${run.workloadSlug}`}
                    className="hover:text-[var(--accent)]"
                  >
                    {run.workloadName}
                  </Link>
                </td>
                <td className="py-3 pr-3 font-mono text-xs">
                  <Link href={`/runs/${run.id}`} className="hover:text-[var(--accent)]">
                    {run.model.split("/").pop()}
                  </Link>
                </td>
                <td className="py-3 pr-3">{run.precision}</td>
                <td className="metric-num py-3 pr-3 text-right">
                  {run.primaryValue.toLocaleString()}
                  <div className="font-sans text-xs text-[var(--muted)]">
                    {run.primaryMetricLabel}
                  </div>
                </td>
                <td className="py-3 text-[var(--muted)]">@{run.userLogin}</td>
              </tr>
            ))}
            {!runs.length && (
              <tr>
                <td colSpan={5} className="py-8 text-[var(--muted)]">
                  No runs for this GPU yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
