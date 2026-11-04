import { getDb } from "@/db";
import { gpus, submissions, users, workloads } from "@/db/schema";
import { and, desc, eq, inArray, sql } from "drizzle-orm";

export type LeaderboardFilters = {
  workloadSlug?: string;
  gpuSlug?: string;
  precision?: string;
  fingerprint?: string;
  gpuSlugs?: string[];
};

export async function ensureCatalog() {
  const db = await getDb();
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(gpus);

  if (Number(count) === 0) {
    const { GPU_SEED, WORKLOAD_SEED } = await import("@/lib/catalog");
    await db.insert(gpus).values([...GPU_SEED]);
    await db.insert(workloads).values([...WORKLOAD_SEED]);
  }
}

export async function listGpus() {
  await ensureCatalog();
  const db = await getDb();
  return db.select().from(gpus).orderBy(gpus.name);
}

export async function listWorkloads() {
  await ensureCatalog();
  const db = await getDb();
  return db.select().from(workloads).orderBy(workloads.name);
}

export async function getGpuBySlug(slug: string) {
  await ensureCatalog();
  const db = await getDb();
  const rows = await db.select().from(gpus).where(eq(gpus.slug, slug)).limit(1);
  return rows[0] ?? null;
}

export async function getWorkloadBySlug(slug: string) {
  await ensureCatalog();
  const db = await getDb();
  const rows = await db
    .select()
    .from(workloads)
    .where(eq(workloads.slug, slug))
    .limit(1);
  return rows[0] ?? null;
}

export async function getSubmissionById(id: string) {
  await ensureCatalog();
  const db = await getDb();
  const rows = await db
    .select({
      submission: submissions,
      gpu: gpus,
      workload: workloads,
      user: users,
    })
    .from(submissions)
    .innerJoin(gpus, eq(submissions.gpuId, gpus.id))
    .innerJoin(workloads, eq(submissions.workloadId, workloads.id))
    .innerJoin(users, eq(submissions.userId, users.id))
    .where(eq(submissions.id, id))
    .limit(1);

  return rows[0] ?? null;
}

export async function queryLeaderboard(filters: LeaderboardFilters = {}) {
  await ensureCatalog();
  const db = await getDb();

  const conditions = [eq(submissions.flagged, false)];

  if (filters.workloadSlug) {
    conditions.push(eq(workloads.slug, filters.workloadSlug));
  }
  if (filters.gpuSlug) {
    conditions.push(eq(gpus.slug, filters.gpuSlug));
  }
  if (filters.gpuSlugs?.length) {
    conditions.push(inArray(gpus.slug, filters.gpuSlugs));
  }
  if (filters.precision) {
    conditions.push(eq(submissions.precision, filters.precision));
  }
  if (filters.fingerprint) {
    conditions.push(eq(submissions.configFingerprint, filters.fingerprint));
  }

  return db
    .select({
      id: submissions.id,
      model: submissions.model,
      gpuCount: submissions.gpuCount,
      precision: submissions.precision,
      framework: submissions.framework,
      frameworkVersion: submissions.frameworkVersion,
      rocmVersion: submissions.rocmVersion,
      cudaVersion: submissions.cudaVersion,
      batchSize: submissions.batchSize,
      tensorParallel: submissions.tensorParallel,
      maxSeqLen: submissions.maxSeqLen,
      configFingerprint: submissions.configFingerprint,
      metrics: submissions.metrics,
      primaryValue: submissions.primaryValue,
      notes: submissions.notes,
      createdAt: submissions.createdAt,
      gpuSlug: gpus.slug,
      gpuName: gpus.name,
      gpuVendor: gpus.vendor,
      workloadSlug: workloads.slug,
      workloadName: workloads.name,
      primaryMetric: workloads.primaryMetric,
      primaryMetricLabel: workloads.primaryMetricLabel,
      higherIsBetter: workloads.higherIsBetter,
      userLogin: users.login,
      userAvatar: users.avatarUrl,
    })
    .from(submissions)
    .innerJoin(gpus, eq(submissions.gpuId, gpus.id))
    .innerJoin(workloads, eq(submissions.workloadId, workloads.id))
    .innerJoin(users, eq(submissions.userId, users.id))
    .where(and(...conditions))
    .orderBy(desc(submissions.primaryValue));
}

export async function listFingerprints(workloadSlug?: string) {
  await ensureCatalog();
  const db = await getDb();
  const conditions = [eq(submissions.flagged, false)];
  if (workloadSlug) {
    conditions.push(eq(workloads.slug, workloadSlug));
  }

  const rows = await db
    .selectDistinct({
      fingerprint: submissions.configFingerprint,
      model: submissions.model,
      precision: submissions.precision,
      framework: submissions.framework,
      batchSize: submissions.batchSize,
      tensorParallel: submissions.tensorParallel,
      maxSeqLen: submissions.maxSeqLen,
    })
    .from(submissions)
    .innerJoin(workloads, eq(submissions.workloadId, workloads.id))
    .where(and(...conditions));

  return rows;
}
