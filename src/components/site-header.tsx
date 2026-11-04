import Link from "next/link";
import { Suspense } from "react";
import { SiteHeaderAuth } from "@/components/site-header-auth";

const links = [
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/compare", label: "Compare" },
  { href: "/upload", label: "Upload" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[rgba(12,13,16,0.8)] backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="group flex items-baseline gap-2">
          <span className="text-sm font-semibold tracking-[0.18em] text-[var(--accent)] uppercase">
            ROCm
          </span>
          <span className="text-sm font-medium tracking-wide text-[var(--fg)]">
            Benchmark Hub
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-[var(--muted)] sm:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-[var(--fg)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 text-sm">
          <Suspense
            fallback={
              <span className="text-[var(--muted)]">Loading…</span>
            }
          >
            <SiteHeaderAuth />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
