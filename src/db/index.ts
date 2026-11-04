import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { PGlite } from "@electric-sql/pglite";
import { mkdirSync } from "fs";
import * as schema from "./schema";

type AppDb =
  | ReturnType<typeof drizzleNeon<typeof schema>>
  | ReturnType<typeof drizzlePglite<typeof schema>>;

declare global {
  // eslint-disable-next-line no-var
  var __rocmDb: AppDb | undefined;
  // eslint-disable-next-line no-var
  var __rocmPglite: PGlite | undefined;
  // eslint-disable-next-line no-var
  var __rocmDbReady: Promise<AppDb> | undefined;
}

async function ensurePgliteSchema(client: PGlite) {
  await client.exec(`
    CREATE TABLE IF NOT EXISTS gpus (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      vendor TEXT NOT NULL,
      memory_gb INTEGER NOT NULL,
      architecture TEXT NOT NULL,
      form_factor TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS workloads (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      primary_metric TEXT NOT NULL,
      primary_metric_label TEXT NOT NULL,
      higher_is_better BOOLEAN NOT NULL DEFAULT TRUE
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      github_id TEXT NOT NULL UNIQUE,
      login TEXT NOT NULL,
      name TEXT,
      avatar_url TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      gpu_id TEXT NOT NULL REFERENCES gpus(id),
      workload_id TEXT NOT NULL REFERENCES workloads(id),
      model TEXT NOT NULL,
      gpu_count INTEGER NOT NULL DEFAULT 1,
      rocm_version TEXT,
      cuda_version TEXT,
      driver_version TEXT,
      framework TEXT NOT NULL,
      framework_version TEXT NOT NULL,
      precision TEXT NOT NULL,
      batch_size INTEGER,
      tensor_parallel INTEGER,
      max_seq_len INTEGER,
      config_fingerprint TEXT NOT NULL,
      metrics JSONB NOT NULL,
      primary_value REAL NOT NULL,
      notes TEXT,
      artifact_url TEXT,
      flagged BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS submissions_workload_idx ON submissions(workload_id);
    CREATE INDEX IF NOT EXISTS submissions_gpu_idx ON submissions(gpu_id);
    CREATE INDEX IF NOT EXISTS submissions_fingerprint_idx ON submissions(config_fingerprint);
    CREATE INDEX IF NOT EXISTS submissions_precision_idx ON submissions(precision);
  `);
}

async function initDb(): Promise<AppDb> {
  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl) {
    const sql = neon(databaseUrl);
    return drizzleNeon({ client: sql, schema });
  }

  const persistDir = process.env.ROCM_DB_PATH;
  if (persistDir) {
    mkdirSync(persistDir, { recursive: true });
  }

  if (!global.__rocmPglite) {
    global.__rocmPglite = persistDir ? new PGlite(persistDir) : new PGlite();
    await ensurePgliteSchema(global.__rocmPglite);
  }

  return drizzlePglite({ client: global.__rocmPglite, schema });
}

export type Db = AppDb;

export async function getDb(): Promise<Db> {
  if (global.__rocmDb) return global.__rocmDb;
  if (!global.__rocmDbReady) {
    global.__rocmDbReady = initDb().then((db) => {
      global.__rocmDb = db;
      return db;
    });
  }
  return global.__rocmDbReady;
}
