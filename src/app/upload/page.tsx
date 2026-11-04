import Link from "next/link";
import { auth } from "@/lib/auth";
import { UploadForm } from "@/components/upload-form";
import { isR2Enabled } from "@/lib/r2";
import { EXAMPLE_UPLOAD } from "@/lib/schemas/upload";

export const metadata = {
  title: "Upload",
};

export default async function UploadPage() {
  const session = await auth();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Upload a run</h1>
      <p className="mt-2 text-[var(--muted)]">
        Submit a Zod-validated JSON result. Sign in with GitHub (or local
        dev login) so the run is attributable.
      </p>

      {!session?.user ? (
        <div className="mt-8 border border-[var(--line)] p-6">
          <p className="text-[var(--muted)]">
            You need an account before uploading.
          </p>
          <Link
            href="/login?callbackUrl=/upload"
            className="mt-4 inline-block bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white"
          >
            Sign in to upload
          </Link>
        </div>
      ) : (
        <div className="mt-8">
          <p className="mb-4 text-sm text-[var(--muted)]">
            Signed in as <span className="text-[var(--fg)]">{session.user.name}</span>
          </p>
          <UploadForm r2Enabled={isR2Enabled()} />
        </div>
      )}

      <details className="mt-10 border border-[var(--line)] p-4 text-sm">
        <summary className="cursor-pointer font-medium">
          Example payload shape
        </summary>
        <pre className="mt-3 overflow-x-auto font-mono text-xs text-[var(--muted)]">
          {JSON.stringify(EXAMPLE_UPLOAD, null, 2)}
        </pre>
        <p className="mt-3 text-[var(--muted)]">
          Workload keys: <code>vllm_serving</code>, <code>llama3</code>,{" "}
          <code>deepseek</code>, <code>stable_diffusion</code>,{" "}
          <code>pytorch_training</code>. GPU names must match the catalog
          exactly (e.g. &quot;Instinct MI300X&quot;).
        </p>
      </details>
    </div>
  );
}
