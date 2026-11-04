import { z } from "zod";
import { GPU_SEED, WORKLOAD_SEED } from "@/lib/catalog";

const gpuEnum = z.enum(
  GPU_SEED.map((g) => g.name) as [string, ...string[]],
);
const precisionEnum = z.enum(["fp32", "tf32", "fp16", "bf16", "fp8", "int8"]);

const stackSchema = z
  .object({
    rocm: z.string().optional(),
    cuda: z.string().optional(),
    driver: z.string().optional(),
    framework: z.string().min(1),
    frameworkVersion: z.string().min(1),
    precision: precisionEnum,
  })
  .refine((s) => Boolean(s.rocm || s.cuda), {
    message: "Provide either stack.rocm or stack.cuda",
  });

const baseConfig = z.object({
  batchSize: z.number().int().positive().optional(),
  tensorParallel: z.number().int().positive().optional(),
  maxSeqLen: z.number().int().positive().optional(),
});

const vllmServingSchema = z.object({
  workload: z.literal("vllm_serving"),
  model: z.string().min(1),
  gpu: gpuEnum,
  gpuCount: z.number().int().positive().default(1),
  stack: stackSchema,
  config: baseConfig.extend({
    batchSize: z.number().int().positive(),
    tensorParallel: z.number().int().positive(),
    maxSeqLen: z.number().int().positive(),
  }),
  metrics: z.object({
    tokensPerSec: z.number().positive(),
    ttftMs: z.number().nonnegative(),
    tpotMs: z.number().nonnegative(),
  }),
  notes: z.string().max(2000).optional(),
});

const llama3Schema = z.object({
  workload: z.literal("llama3"),
  model: z.string().min(1),
  gpu: gpuEnum,
  gpuCount: z.number().int().positive().default(1),
  stack: stackSchema,
  config: baseConfig,
  metrics: z.object({
    tokensPerSec: z.number().positive(),
    latencyMs: z.number().nonnegative().optional(),
  }),
  notes: z.string().max(2000).optional(),
});

const deepseekSchema = z.object({
  workload: z.literal("deepseek"),
  model: z.string().min(1),
  gpu: gpuEnum,
  gpuCount: z.number().int().positive().default(1),
  stack: stackSchema,
  config: baseConfig,
  metrics: z.object({
    tokensPerSec: z.number().positive(),
    latencyMs: z.number().nonnegative().optional(),
  }),
  notes: z.string().max(2000).optional(),
});

const stableDiffusionSchema = z.object({
  workload: z.literal("stable_diffusion"),
  model: z.string().min(1),
  gpu: gpuEnum,
  gpuCount: z.number().int().positive().default(1),
  stack: stackSchema,
  config: z.object({
    batchSize: z.number().int().positive(),
    steps: z.number().int().positive().optional(),
    resolution: z.number().int().positive().optional(),
  }),
  metrics: z.object({
    imagesPerSec: z.number().positive(),
    secondsPerImage: z.number().positive().optional(),
  }),
  notes: z.string().max(2000).optional(),
});

const pytorchTrainingSchema = z.object({
  workload: z.literal("pytorch_training"),
  model: z.string().min(1),
  gpu: gpuEnum,
  gpuCount: z.number().int().positive().default(1),
  stack: stackSchema,
  config: z.object({
    batchSize: z.number().int().positive(),
    sequenceLength: z.number().int().positive().optional(),
  }),
  metrics: z.object({
    samplesPerSec: z.number().positive(),
    stepTimeMs: z.number().positive().optional(),
    mfuPercent: z.number().min(0).max(100).optional(),
  }),
  notes: z.string().max(2000).optional(),
});

export const uploadSchema = z.discriminatedUnion("workload", [
  vllmServingSchema,
  llama3Schema,
  deepseekSchema,
  stableDiffusionSchema,
  pytorchTrainingSchema,
]);

export type UploadPayload = z.infer<typeof uploadSchema>;

export const WORKLOAD_KEY_TO_SLUG: Record<
  UploadPayload["workload"],
  (typeof WORKLOAD_SEED)[number]["slug"]
> = {
  vllm_serving: "vllm-serving",
  llama3: "llama-3",
  deepseek: "deepseek",
  stable_diffusion: "stable-diffusion",
  pytorch_training: "pytorch-training",
};

export function primaryMetricValue(payload: UploadPayload): number {
  switch (payload.workload) {
    case "vllm_serving":
    case "llama3":
    case "deepseek":
      return payload.metrics.tokensPerSec;
    case "stable_diffusion":
      return payload.metrics.imagesPerSec;
    case "pytorch_training":
      return payload.metrics.samplesPerSec;
  }
}

export const EXAMPLE_UPLOAD: UploadPayload = {
  workload: "vllm_serving",
  model: "meta-llama/Meta-Llama-3-70B-Instruct",
  gpu: "Instinct MI300X",
  gpuCount: 8,
  stack: {
    rocm: "6.2",
    framework: "vllm",
    frameworkVersion: "0.6.3",
    precision: "bf16",
  },
  config: {
    batchSize: 32,
    tensorParallel: 8,
    maxSeqLen: 4096,
  },
  metrics: {
    tokensPerSec: 4210,
    ttftMs: 38,
    tpotMs: 12.4,
  },
  notes: "TP8 continuous batching, default scheduler",
};
