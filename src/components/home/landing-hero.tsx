import Link from "next/link";

type HeroPreviewRun = {
  gpuName: string;
  primaryValue: number;
  gpuVendor: string;
};

export function LandingHero({
  stats,
  previewRuns,
}: {
  stats: { gpus: number; workloads: number; runs: number };
  previewRuns: HeroPreviewRun[];
}) {
  const max = Math.max(...previewRuns.map((r) => r.primaryValue), 1);

  return (
    <section className="relative overflow-hidden border-b border-[var(--line)]">
      <div className="pointer-events-none absolute inset-0 grid-fade opacity-40" />
      <div className="pointer-events-none absolute -right-24 top-20 h-64 w-64 rounded-full bg-[var(--accent-soft)] blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent scan-line" />

      <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:py-24">
        <div>
          <p className="animate-rise text-sm font-medium tracking-[0.28em] text-[var(--accent)] uppercase">
            ROCm Benchmark Hub
          </p>
          <h1 className="animate-rise-delay mt-4 text-4xl leading-[1.05] font-semibold tracking-tight text-[var(--fg)] sm:text-5xl lg:text-6xl">
            Benchmark AMD GPUs on the workloads you actually ship.
          </h1>
          <p className="animate-rise-delay-2 mt-5 max-w-xl text-base leading-relaxed text-[var(--muted)] sm:text-lg">
            Community-sourced results for Llama 3, DeepSeek, Stable Diffusion,
            PyTorch training, and vLLM serving — compared across MI300X, MI325X,
            MI250, Radeon 7900 XTX, RTX 5090, and H100 with matched config
            fingerprints.
          </p>

          <dl className="animate-rise-delay-2 mt-8 flex flex-wrap gap-6 border-y border-[var(--line)] py-5">
            {[
              { label: "GPUs tracked", value: stats.gpus },
              { label: "Workloads", value: stats.workloads },
              { label: "Published runs", value: stats.runs },
            ].map((item) => (
              <div key={item.label}>
                <dt className="text-xs tracking-wide text-[var(--muted)] uppercase">
                  {item.label}
                </dt>
                <dd className="metric-num mt-1 text-2xl font-medium text-[var(--fg)]">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>

          <div className="animate-rise-delay-2 mt-8 flex flex-wrap gap-3">
            <Link
              href="/leaderboard"
              className="bg-[var(--accent)] px-5 py-3 text-sm font-medium text-white transition hover:brightness-110"
            >
              Browse leaderboard
            </Link>
            <Link
              href="/compare?workload=vllm-serving&gpus=mi300x,mi325x,h100&precision=bf16"
              className="border border-[var(--line)] px-5 py-3 text-sm text-[var(--fg)] transition hover:border-[var(--fg)]"
            >
              Compare Instinct vs H100
            </Link>
            <Link
              href="/upload"
              className="px-5 py-3 text-sm text-[var(--muted)] underline-offset-4 transition hover:text-[var(--fg)] hover:underline"
            >
              Submit a run
            </Link>
          </div>
        </div>

        <aside className="animate-rise-delay-2 border border-[var(--line)] bg-[rgba(20,22,28,0.72)] p-5 backdrop-blur-sm lg:mb-2">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-sm font-medium tracking-wide text-[var(--fg)] uppercase">
              vLLM serving snapshot
            </h2>
            <span className="text-xs text-[var(--muted)]">tokens / sec</span>
          </div>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Llama-class configs · bf16 · best run per GPU
          </p>

          <ul className="mt-6 space-y-4">
            {previewRuns.length ? (
              previewRuns.map((run) => {
                const shortName = run.gpuName
                  .replace("Instinct ", "")
                  .replace("GeForce ", "")
                  .replace("NVIDIA ", "")
                  .replace("Radeon RX ", "");
                const width = Math.max(8, (run.primaryValue / max) * 100);
                return (
                  <li key={shortName + run.primaryValue}>
                    <div className="flex items-baseline justify-between gap-2 text-sm">
                      <span className="font-medium">{shortName}</span>
                      <span className="metric-num text-[var(--fg)]">
                        {run.primaryValue.toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-2 h-2 w-full bg-[var(--line)]">
                      <div
                        className="h-full transition-all"
                        style={{
                          width: `${width}%`,
                          backgroundColor:
                            run.gpuVendor === "amd"
                              ? "var(--amd)"
                              : "var(--nvidia)",
                        }}
                      />
                    </div>
                  </li>
                );
              })
            ) : (
              <li className="text-sm text-[var(--muted)]">
                No vLLM runs yet. Seed the database or upload the first result.
              </li>
            )}
          </ul>

          <Link
            href="/leaderboard?workload=vllm-serving"
            className="mt-6 inline-block text-sm text-[var(--accent)] hover:underline"
          >
            Full vLLM leaderboard →
          </Link>
        </aside>
      </div>
    </section>
  );
}
