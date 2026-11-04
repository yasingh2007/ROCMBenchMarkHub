"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EXAMPLE_UPLOAD } from "@/lib/schemas/upload";

export function UploadForm({ r2Enabled }: { r2Enabled: boolean }) {
  const router = useRouter();
  const [jsonText, setJsonText] = useState(
    JSON.stringify(EXAMPLE_UPLOAD, null, 2),
  );
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setStatus(null);

    try {
      let payload: Record<string, unknown>;
      try {
        payload = JSON.parse(jsonText) as Record<string, unknown>;
      } catch {
        throw new Error("JSON is invalid");
      }

      if (file && r2Enabled) {
        setStatus("Requesting artifact upload URL…");
        const prep = await fetch("/api/artifacts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: file.name }),
        });
        const prepJson = await prep.json();
        if (!prep.ok) {
          throw new Error(prepJson.error || "Artifact prep failed");
        }

        setStatus("Uploading artifact…");
        const put = await fetch(prepJson.uploadUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": "application/octet-stream" },
        });
        if (!put.ok) throw new Error("Artifact upload failed");
        payload.artifactUrl = prepJson.publicUrl;
      }

      setStatus("Submitting benchmark…");
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data.error === "Validation failed"
            ? JSON.stringify(data.details, null, 2)
            : data.error || "Upload failed",
        );
      }

      setStatus("Submitted.");
      router.push(`/runs/${data.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="grid gap-2 text-sm text-[var(--muted)]">
        Benchmark JSON
        <textarea
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          rows={22}
          className="w-full border border-[var(--line)] bg-[var(--bg)] p-3 font-mono text-xs text-[var(--fg)] outline-none focus:border-[var(--accent)]"
          spellCheck={false}
        />
      </label>

      <label className="grid gap-2 text-sm text-[var(--muted)]">
        Optional artifact {r2Enabled ? "(R2 enabled)" : "(R2 not configured)"}
        <input
          type="file"
          disabled={!r2Enabled}
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="text-sm text-[var(--fg)] file:mr-3 file:border file:border-[var(--line)] file:bg-transparent file:px-3 file:py-1.5 file:text-[var(--fg)]"
        />
      </label>

      {error && (
        <pre className="overflow-x-auto border border-[var(--accent)] bg-[var(--accent-soft)] p-3 text-xs text-[var(--fg)] whitespace-pre-wrap">
          {error}
        </pre>
      )}
      {status && !error && (
        <p className="text-sm text-[var(--muted)]">{status}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white transition hover:brightness-110 disabled:opacity-50"
      >
        {pending ? "Uploading…" : "Submit run"}
      </button>
    </form>
  );
}
