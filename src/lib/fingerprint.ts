import { createHash } from "crypto";

export function configFingerprint(input: {
  workload: string;
  model: string;
  precision: string;
  batchSize?: number | null;
  tensorParallel?: number | null;
  maxSeqLen?: number | null;
  framework: string;
}): string {
  const parts = [
    input.workload,
    input.model.trim().toLowerCase(),
    input.precision.toLowerCase(),
    input.framework.toLowerCase(),
    String(input.batchSize ?? ""),
    String(input.tensorParallel ?? ""),
    String(input.maxSeqLen ?? ""),
  ].join("|");

  return createHash("sha256").update(parts).digest("hex").slice(0, 16);
}
