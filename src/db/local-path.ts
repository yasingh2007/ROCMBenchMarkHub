import { join } from "path";

export function defaultPglitePath(): string {
  return join(process.cwd(), ".data", "pglite");
}

/**
 * Local PGlite directory when DATABASE_URL is unset.
 * - Dev defaults to `.data/pglite` so `next dev` and `db:seed` share one DB.
 * - Set ROCM_DB_MEMORY=1 for in-memory (e.g. CI).
 * - Production build uses memory unless ROCM_DB_PATH is set.
 */
export function resolvePglitePersistDir(): string | undefined {
  if (process.env.DATABASE_URL) return undefined;
  if (process.env.ROCM_DB_MEMORY === "1") return undefined;
  if (process.env.ROCM_DB_PATH) return process.env.ROCM_DB_PATH;
  if (process.env.NODE_ENV === "development") {
    return defaultPglitePath();
  }
  return undefined;
}