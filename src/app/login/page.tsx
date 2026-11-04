import { signIn, auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export const metadata = {
  title: "Sign in",
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-md px-4 py-20 text-[var(--muted)] sm:px-6">
          Loading…
        </div>
      }
    >
      <LoginPageContent searchParams={searchParams} />
    </Suspense>
  );
}

async function LoginPageContent({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  const sp = await searchParams;
  const callbackUrl =
    typeof sp.callbackUrl === "string" ? sp.callbackUrl : "/";

  if (session?.user) {
    redirect(callbackUrl);
  }

  const githubConfigured = Boolean(
    process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET,
  );

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-20 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Sign in</h1>
      <p className="mt-2 text-[var(--muted)]">
        GitHub identity ties benchmark submissions to a real engineer account.
      </p>

      <div className="mt-8 space-y-4">
        {githubConfigured && (
          <form
            action={async () => {
              "use server";
              await signIn("github", { redirectTo: callbackUrl });
            }}
          >
            <button
              type="submit"
              className="w-full border border-[var(--line)] bg-[var(--bg-elevated)] px-4 py-3 text-sm font-medium transition hover:border-[var(--fg)]"
            >
              Continue with GitHub
            </button>
          </form>
        )}

        <form
          action={async (formData) => {
            "use server";
            await signIn("dev-login", {
              username: String(formData.get("username") || "rocm-dev"),
              redirectTo: callbackUrl,
            });
          }}
          className="space-y-3 border border-[var(--line)] p-4"
        >
          <p className="text-xs tracking-wide text-[var(--muted)] uppercase">
            {githubConfigured ? "Local / preview login" : "Dev login"}
          </p>
          <input
            name="username"
            placeholder="GitHub-style username"
            defaultValue="rocm-dev"
            className="w-full border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
          />
          <button
            type="submit"
            className="w-full bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
