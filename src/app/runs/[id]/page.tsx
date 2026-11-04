import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getSubmissionById } from "@/lib/queries";
import { FlagButton } from "@/components/flag-button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const row = await getSubmissionById(id);
  if (!row) return { title: "Run" };
  return {
    title: `${row.gpu.name} · ${row.workload.name}`,
    description: `${row.submission.model} on ${row.gpu.name}: ${row.submission.primaryValue} ${row.workload.primaryMetricLabel}`,
  };
}

export default async function RunPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const row = await getSubmissionById(id);
  if (!row) notFound();

  const session = await auth();
  const { submission, gpu, workload, user } = row;
  const metrics = submission.metrics;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <p className="text-xs tracking-[0.2em] text-[var(--muted)] uppercase">
        Run detail
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        {gpu.name}
        <span className="text-[var(--muted)]"> · </span>
        {workload.name}
      </h1>
      <p className="mt-2 font-mono text-sm text-[var(--muted)]">
        {submission.model}
      </p>

      <div className="mt-8 border border-[var(--line)] p-6">
        <p className="text-xs tracking-wide text-[var(--muted)] uppercase">
          {workload.primaryMetricLabel}
        </p>
        <p className="metric-num mt-2 text-5xl">
          {submission.primaryValue.toLocaleString()}
        </p>
      </div>

      <dl className="mt-8 grid gap-4 sm:grid-cols-2">
        {[
          ["Precision", submission.precision],
          ["GPU count", String(submission.gpuCount)],
          ["Framework", `${submission.framework} ${submission.frameworkVersion}`],
          [
            "Accelerator stack",
            submission.rocmVersion
              ? `ROCm ${submission.rocmVersion}`
              : submission.cudaVersion
                ? `CUDA ${submission.cudaVersion}`
                : "—",
          ],
          ["Batch size", submission.batchSize?.toString() ?? "—"],
          ["Tensor parallel", submission.tensorParallel?.toString() ?? "—"],
          ["Max seq len", submission.maxSeqLen?.toString() ?? "—"],
          ["Config fingerprint", submission.configFingerprint],
          ["Submitter", `@${user.login}`],
          [
            "Submitted",
            new Date(submission.createdAt).toLocaleString(),
          ],
        ].map(([label, value]) => (
          <div key={label} className="border-b border-[var(--line)] pb-3">
            <dt className="text-xs tracking-wide text-[var(--muted)] uppercase">
              {label}
            </dt>
            <dd className="mt-1 font-mono text-sm break-all">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8">
        <h2 className="text-sm tracking-wide text-[var(--muted)] uppercase">
          All metrics
        </h2>
        <ul className="mt-3 space-y-2">
          {Object.entries(metrics).map(([key, value]) => (
            <li
              key={key}
              className="flex justify-between border border-[var(--line)] px-3 py-2 text-sm"
            >
              <span className="text-[var(--muted)]">{key}</span>
              <span className="metric-num">{value.toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </div>

      {submission.notes && (
        <div className="mt-8">
          <h2 className="text-sm tracking-wide text-[var(--muted)] uppercase">
            Notes
          </h2>
          <p className="mt-2 text-[var(--muted)]">{submission.notes}</p>
        </div>
      )}

      {submission.artifactUrl && (
        <div className="mt-8">
          <a
            href={submission.artifactUrl}
            className="text-[var(--accent)] hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            Download artifact
          </a>
        </div>
      )}

      <div className="mt-10 flex flex-wrap items-center gap-4">
        <Link
          href={`/gpus/${gpu.slug}`}
          className="text-sm text-[var(--muted)] hover:text-[var(--fg)]"
        >
          More {gpu.name} runs
        </Link>
        <Link
          href={`/workloads/${workload.slug}`}
          className="text-sm text-[var(--muted)] hover:text-[var(--fg)]"
        >
          More {workload.name} runs
        </Link>
        {session?.user && !submission.flagged && (
          <FlagButton submissionId={submission.id} />
        )}
        {submission.flagged && (
          <span className="text-sm text-[var(--accent)]">Flagged for review</span>
        )}
      </div>
    </div>
  );
}
