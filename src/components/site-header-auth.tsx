import Link from "next/link";
import { auth, signOut } from "@/lib/auth";

export async function SiteHeaderAuth() {
  const session = await auth();

  if (session?.user) {
    return (
      <>
        <span className="hidden text-[var(--muted)] md:inline">
          {session.user.name}
        </span>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="rounded border border-[var(--line)] px-3 py-1.5 text-[var(--muted)] transition hover:border-[var(--fg)] hover:text-[var(--fg)]"
          >
            Sign out
          </button>
        </form>
      </>
    );
  }

  return (
    <Link
      href="/login"
      className="rounded bg-[var(--accent)] px-3 py-1.5 font-medium text-white transition hover:brightness-110"
    >
      Sign in
    </Link>
  );
}
