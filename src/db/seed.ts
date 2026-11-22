import "dotenv/config";
import { getDb } from "./index";
import { defaultPglitePath } from "./local-path";

if (
  !process.env.DATABASE_URL &&
  process.env.ROCM_DB_MEMORY !== "1" &&
  !process.env.ROCM_DB_PATH
) {
  process.env.ROCM_DB_PATH = defaultPglitePath();
}

import { gpus, workloads, users, submissions } from "./schema";
import { GPU_SEED, WORKLOAD_SEED } from "../lib/catalog";
import { configFingerprint } from "../lib/fingerprint";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

async function seed() {
  const db = await getDb();

  for (const gpu of GPU_SEED) {
    const existing = await db
      .select()
      .from(gpus)
      .where(eq(gpus.id, gpu.id))
      .limit(1);
    if (!existing[0]) {
      await db.insert(gpus).values(gpu);
    }
  }

  for (const wl of WORKLOAD_SEED) {
    const existing = await db
      .select()
      .from(workloads)
      .where(eq(workloads.id, wl.id))
      .limit(1);
    if (!existing[0]) {
      await db.insert(workloads).values(wl);
    }
  }

  const demoUserId = "user_demo_amd";
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.id, demoUserId))
    .limit(1);

  if (!existingUser[0]) {
    await db.insert(users).values({
      id: demoUserId,
      githubId: "demo:amd-lab",
      login: "amd-lab",
      name: "AMD Lab",
      avatarUrl: "https://avatars.githubusercontent.com/u/8109177?v=4",
    });
  }

  const existingSubs = await db.select().from(submissions).limit(1);
  if (existingSubs[0]) {
    console.log("Seed complete (submissions already present).");
    return;
  }

  const demoRuns: Array<{
    gpuId: string;
    workloadId: string;
    model: string;
    gpuCount: number;
    rocmVersion?: string;
    cudaVersion?: string;
    framework: string;
    frameworkVersion: string;
    precision: string;
    batchSize: number;
    tensorParallel?: number;
    maxSeqLen?: number;
    metrics: Record<string, number>;
    primaryValue: number;
    notes: string;
  }> = [
    {
      gpuId: "gpu_mi300x",
      workloadId: "wl_vllm",
      model: "meta-llama/Meta-Llama-3-70B-Instruct",
      gpuCount: 8,
      rocmVersion: "6.2",
      framework: "vllm",
      frameworkVersion: "0.6.3",
      precision: "bf16",
      batchSize: 32,
      tensorParallel: 8,
      maxSeqLen: 4096,
      metrics: { tokensPerSec: 4210, ttftMs: 38, tpotMs: 12.4 },
      primaryValue: 4210,
      notes: "TP8 continuous batching",
    },
    {
      gpuId: "gpu_mi325x",
      workloadId: "wl_vllm",
      model: "meta-llama/Meta-Llama-3-70B-Instruct",
      gpuCount: 8,
      rocmVersion: "6.3",
      framework: "vllm",
      frameworkVersion: "0.6.4",
      precision: "bf16",
      batchSize: 32,
      tensorParallel: 8,
      maxSeqLen: 4096,
      metrics: { tokensPerSec: 4680, ttftMs: 34, tpotMs: 11.1 },
      primaryValue: 4680,
      notes: "MI325X HBM3E uplift",
    },
    {
      gpuId: "gpu_h100",
      workloadId: "wl_vllm",
      model: "meta-llama/Meta-Llama-3-70B-Instruct",
      gpuCount: 8,
      cudaVersion: "12.4",
      framework: "vllm",
      frameworkVersion: "0.6.3",
      precision: "bf16",
      batchSize: 32,
      tensorParallel: 8,
      maxSeqLen: 4096,
      metrics: { tokensPerSec: 5120, ttftMs: 31, tpotMs: 10.2 },
      primaryValue: 5120,
      notes: "DGX H100 baseline",
    },
    {
      gpuId: "gpu_rtx5090",
      workloadId: "wl_vllm",
      model: "meta-llama/Meta-Llama-3-8B-Instruct",
      gpuCount: 1,
      cudaVersion: "12.8",
      framework: "vllm",
      frameworkVersion: "0.7.0",
      precision: "bf16",
      batchSize: 16,
      tensorParallel: 1,
      maxSeqLen: 4096,
      metrics: { tokensPerSec: 2890, ttftMs: 22, tpotMs: 8.5 },
      primaryValue: 2890,
      notes: "Single-GPU consumer card",
    },
    {
      gpuId: "gpu_mi300x",
      workloadId: "wl_llama3",
      model: "meta-llama/Meta-Llama-3-70B-Instruct",
      gpuCount: 8,
      rocmVersion: "6.2",
      framework: "pytorch",
      frameworkVersion: "2.4.1",
      precision: "bf16",
      batchSize: 8,
      tensorParallel: 8,
      maxSeqLen: 2048,
      metrics: { tokensPerSec: 1850, latencyMs: 54 },
      primaryValue: 1850,
      notes: "Eager mode decode",
    },
    {
      gpuId: "gpu_h100",
      workloadId: "wl_llama3",
      model: "meta-llama/Meta-Llama-3-70B-Instruct",
      gpuCount: 8,
      cudaVersion: "12.4",
      framework: "pytorch",
      frameworkVersion: "2.4.1",
      precision: "bf16",
      batchSize: 8,
      tensorParallel: 8,
      maxSeqLen: 2048,
      metrics: { tokensPerSec: 2140, latencyMs: 48 },
      primaryValue: 2140,
      notes: "Eager mode decode",
    },
    {
      gpuId: "gpu_mi250",
      workloadId: "wl_deepseek",
      model: "deepseek-ai/DeepSeek-V2-Lite-Chat",
      gpuCount: 4,
      rocmVersion: "6.1",
      framework: "vllm",
      frameworkVersion: "0.5.5",
      precision: "fp16",
      batchSize: 16,
      tensorParallel: 4,
      maxSeqLen: 4096,
      metrics: { tokensPerSec: 980, latencyMs: 72 },
      primaryValue: 980,
      notes: "MI250 MoE serving",
    },
    {
      gpuId: "gpu_mi300x",
      workloadId: "wl_deepseek",
      model: "deepseek-ai/DeepSeek-V2-Lite-Chat",
      gpuCount: 4,
      rocmVersion: "6.2",
      framework: "vllm",
      frameworkVersion: "0.6.3",
      precision: "fp16",
      batchSize: 16,
      tensorParallel: 4,
      maxSeqLen: 4096,
      metrics: { tokensPerSec: 1620, latencyMs: 49 },
      primaryValue: 1620,
      notes: "MI300X MoE serving",
    },
    {
      gpuId: "gpu_7900xtx",
      workloadId: "wl_sd",
      model: "stabilityai/stable-diffusion-xl-base-1.0",
      gpuCount: 1,
      rocmVersion: "6.1",
      framework: "diffusers",
      frameworkVersion: "0.30.0",
      precision: "fp16",
      batchSize: 1,
      metrics: { imagesPerSec: 0.42, secondsPerImage: 2.38 },
      primaryValue: 0.42,
      notes: "SDXL 1024, 30 steps",
    },
    {
      gpuId: "gpu_rtx5090",
      workloadId: "wl_sd",
      model: "stabilityai/stable-diffusion-xl-base-1.0",
      gpuCount: 1,
      cudaVersion: "12.8",
      framework: "diffusers",
      frameworkVersion: "0.31.0",
      precision: "fp16",
      batchSize: 1,
      metrics: { imagesPerSec: 1.15, secondsPerImage: 0.87 },
      primaryValue: 1.15,
      notes: "SDXL 1024, 30 steps",
    },
    {
      gpuId: "gpu_mi300x",
      workloadId: "wl_pytorch_train",
      model: "meta-llama/Meta-Llama-3-8B",
      gpuCount: 8,
      rocmVersion: "6.2",
      framework: "pytorch",
      frameworkVersion: "2.4.1",
      precision: "bf16",
      batchSize: 4,
      metrics: { samplesPerSec: 12.4, stepTimeMs: 322, mfuPercent: 41 },
      primaryValue: 12.4,
      notes: "FSDP full shard",
    },
    {
      gpuId: "gpu_h100",
      workloadId: "wl_pytorch_train",
      model: "meta-llama/Meta-Llama-3-8B",
      gpuCount: 8,
      cudaVersion: "12.4",
      framework: "pytorch",
      frameworkVersion: "2.4.1",
      precision: "bf16",
      batchSize: 4,
      metrics: { samplesPerSec: 14.8, stepTimeMs: 270, mfuPercent: 46 },
      primaryValue: 14.8,
      notes: "FSDP full shard",
    },
  ];

  for (const run of demoRuns) {
    const workloadSlug =
      WORKLOAD_SEED.find((w) => w.id === run.workloadId)?.slug ?? "unknown";

    await db.insert(submissions).values({
      id: nanoid(),
      userId: demoUserId,
      gpuId: run.gpuId,
      workloadId: run.workloadId,
      model: run.model,
      gpuCount: run.gpuCount,
      rocmVersion: run.rocmVersion ?? null,
      cudaVersion: run.cudaVersion ?? null,
      driverVersion: null,
      framework: run.framework,
      frameworkVersion: run.frameworkVersion,
      precision: run.precision,
      batchSize: run.batchSize,
      tensorParallel: run.tensorParallel ?? null,
      maxSeqLen: run.maxSeqLen ?? null,
      configFingerprint: configFingerprint({
        workload: workloadSlug,
        model: run.model,
        precision: run.precision,
        batchSize: run.batchSize,
        tensorParallel: run.tensorParallel,
        maxSeqLen: run.maxSeqLen,
        framework: run.framework,
      }),
      metrics: run.metrics,
      primaryValue: run.primaryValue,
      notes: run.notes,
      artifactUrl: null,
      flagged: false,
    });
  }

  console.log(`Seeded ${GPU_SEED.length} GPUs, ${WORKLOAD_SEED.length} workloads, ${demoRuns.length} demo runs.`);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
