"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function FlagButton({ submissionId }: { submissionId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function flag() {
    if (!confirm("Flag this run as suspicious?")) return;
    setPending(true);
    try {
      const res = await fetch(`/api/submissions/${submissionId}/flag`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed");
      router.refresh();
    } catch {
      alert("Could not flag run");
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={flag}
      disabled={pending}
      className="border border-[var(--line)] px-3 py-1.5 text-sm text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-50"
    >
      {pending ? "Flagging…" : "Flag run"}
    </button>
  );
}
