import Link from "next/link";

const STEPS = [
  {
    step: "01",
    title: "Run your benchmark",
    body: "Measure Llama, DeepSeek, SD, training, or vLLM on your stack. Export results as JSON from your bench script.",
  },
  {
    step: "02",
    title: "Upload with provenance",
    body: "Sign in with GitHub (or Dev Login locally). Submit JSON validated against workload-specific Zod schemas.",
  },
  {
    step: "03",
    title: "Compare fairly",
    body: "Filter by config fingerprint — model, precision, batch, parallelism — then chart MI300X against H100 and the rest.",
  },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h2 className="text-2xl font-semibold tracking-tight">How it works</h2>
      <ol className="mt-10 grid gap-6 md:grid-cols-3">
        {STEPS.map((s) => (
          <li
            key={s.step}
            className="border border-[var(--line)] p-5"
          >
            <span className="metric-num text-sm text-[var(--accent)]">
              {s.step}
            </span>
            <h3 className="mt-3 text-lg font-medium">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
              {s.body}
            </p>
          </li>
        ))}
      </ol>
      <p className="mt-8 text-center text-sm text-[var(--muted)]">
        Ready to contribute?{" "}
        <Link href="/upload" className="text-[var(--accent)] hover:underline">
          Upload your first run
        </Link>
        {" · "}
        <Link href="/login" className="text-[var(--accent)] hover:underline">
          Sign in
        </Link>
      </p>
    </section>
  );
}
