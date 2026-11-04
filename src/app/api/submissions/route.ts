import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/db";
import { gpus, submissions, workloads } from "@/db/schema";
import {
  uploadSchema,
  WORKLOAD_KEY_TO_SLUG,
  primaryMetricValue,
} from "@/lib/schemas/upload";
import { configFingerprint } from "@/lib/fingerprint";
import { ensureCatalog } from "@/lib/queries";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const { queryLeaderboard } = await import("@/lib/queries");

  const rows = await queryLeaderboard({
    workloadSlug: searchParams.get("workload") ?? undefined,
    gpuSlug: searchParams.get("gpu") ?? undefined,
    precision: searchParams.get("precision") ?? undefined,
    fingerprint: searchParams.get("fingerprint") ?? undefined,
  });

  return NextResponse.json({ submissions: rows });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = uploadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const payload = parsed.data;
  await ensureCatalog();
  const db = await getDb();

  const gpuRows = await db
    .select()
    .from(gpus)
    .where(eq(gpus.name, payload.gpu))
    .limit(1);
  const gpu = gpuRows[0];
  if (!gpu) {
    return NextResponse.json({ error: "Unknown GPU" }, { status: 400 });
  }

  const workloadSlug = WORKLOAD_KEY_TO_SLUG[payload.workload];
  const workloadRows = await db
    .select()
    .from(workloads)
    .where(eq(workloads.slug, workloadSlug))
    .limit(1);
  const workload = workloadRows[0];
  if (!workload) {
    return NextResponse.json({ error: "Unknown workload" }, { status: 400 });
  }

  const batchSize =
    "batchSize" in payload.config ? payload.config.batchSize : null;
  const tensorParallel =
    "tensorParallel" in payload.config
      ? (payload.config.tensorParallel as number | undefined)
      : null;
  const maxSeqLen =
    "maxSeqLen" in payload.config
      ? (payload.config.maxSeqLen as number | undefined)
      : null;

  const fingerprint = configFingerprint({
    workload: workloadSlug,
    model: payload.model,
    precision: payload.stack.precision,
    batchSize,
    tensorParallel,
    maxSeqLen,
    framework: payload.stack.framework,
  });

  const id = nanoid();
  const artifactUrl =
    typeof (body as { artifactUrl?: string }).artifactUrl === "string"
      ? (body as { artifactUrl: string }).artifactUrl
      : null;

  await db.insert(submissions).values({
    id,
    userId: session.user.id,
    gpuId: gpu.id,
    workloadId: workload.id,
    model: payload.model,
    gpuCount: payload.gpuCount,
    rocmVersion: payload.stack.rocm ?? null,
    cudaVersion: payload.stack.cuda ?? null,
    driverVersion: payload.stack.driver ?? null,
    framework: payload.stack.framework,
    frameworkVersion: payload.stack.frameworkVersion,
    precision: payload.stack.precision,
    batchSize: batchSize ?? null,
    tensorParallel: tensorParallel ?? null,
    maxSeqLen: maxSeqLen ?? null,
    configFingerprint: fingerprint,
    metrics: payload.metrics,
    primaryValue: primaryMetricValue(payload),
    notes: payload.notes ?? null,
    artifactUrl,
    flagged: false,
  });

  return NextResponse.json({ id, configFingerprint: fingerprint }, { status: 201 });
}
