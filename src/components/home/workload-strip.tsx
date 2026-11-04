import Link from "next/link";

type Workload = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  primaryMetricLabel: string;
};

const CATEGORY_LABEL: Record<string, string> = {
  llm_inference: "LLM inference",
  llm_serving: "Serving",
  diffusion: "Diffusion",
  training: "Training",
};

export function WorkloadStrip({ workloads }: { workloads: Workload[] }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Workloads</h2>
          <p className="mt-2 max-w-xl text-[var(--muted)]">
            Each category uses its own metrics and Zod schema so comparisons stay
            apples-to-apples.
          </p>
        </div>
        <Link
          href="/leaderboard"
          className="text-sm text-[var(--accent)] hover:underline"
        >
          Filter leaderboard →
        </Link>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {workloads.map((w) => (
          <Link
            key={w.id}
            href={`/workloads/${w.slug}`}
            className="group border border-[var(--line)] p-5 transition hover:border-[var(--accent)] hover:bg-[var(--bg-elevated)]"
          >
            <span className="text-[10px] font-medium tracking-[0.2em] text-[var(--muted)] uppercase">
              {CATEGORY_LABEL[w.category] ?? w.category}
            </span>
            <h3 className="mt-2 text-lg font-medium group-hover:text-[var(--accent)]">
              {w.name}
            </h3>
            <p className="mt-2 line-clamp-2 text-sm text-[var(--muted)]">
              {w.description}
            </p>
            <p className="metric-num mt-4 text-xs text-[var(--muted)]">
              Primary: {w.primaryMetricLabel}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
