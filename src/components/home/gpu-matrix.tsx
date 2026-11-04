import Link from "next/link";

type Gpu = {
  id: string;
  slug: string;
  name: string;
  vendor: string;
  memoryGb: number;
  architecture: string;
  formFactor: string;
};

export function GpuMatrix({ gpus }: { gpus: Gpu[] }) {
  const amd = gpus.filter((g) => g.vendor === "amd");
  const nvidia = gpus.filter((g) => g.vendor === "nvidia");

  return (
    <section className="border-y border-[var(--line)] bg-[rgba(20,22,28,0.35)]">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-2xl font-semibold tracking-tight">GPU matrix</h2>
        <p className="mt-2 text-[var(--muted)]">
          Instinct and Radeon on ROCm, plus NVIDIA baselines on CUDA.
        </p>

        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          {[
            { title: "AMD", items: amd, color: "var(--amd)" },
            { title: "NVIDIA", items: nvidia, color: "var(--nvidia)" },
          ].map((group) => (
            <div key={group.title}>
              <h3
                className="text-xs font-semibold tracking-[0.25em] uppercase"
                style={{ color: group.color }}
              >
                {group.title}
              </h3>
              <ul className="mt-4 divide-y divide-[var(--line)] border-y border-[var(--line)]">
                {group.items.map((g) => (
                  <li key={g.id}>
                    <Link
                      href={`/gpus/${g.slug}`}
                      className="flex items-center justify-between gap-4 py-4 transition hover:bg-white/[0.02]"
                    >
                      <div>
                        <p className="font-medium">{g.name}</p>
                        <p className="mt-1 font-mono text-xs text-[var(--muted)]">
                          {g.architecture} · {g.memoryGb} GB ·{" "}
                          {g.formFactor.replaceAll("_", " ")}
                        </p>
                      </div>
                      <span className="text-sm text-[var(--muted)]">→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/compare?workload=vllm-serving&gpus=mi300x,mi325x,h100,rtx-5090&precision=bf16"
            className="inline-block border border-[var(--line)] px-5 py-2.5 text-sm transition hover:border-[var(--fg)]"
          >
            Open multi-GPU compare
          </Link>
        </div>
      </div>
    </section>
  );
}
