export const GPU_SEED = [
  {
    id: "gpu_mi300x",
    slug: "mi300x",
    name: "Instinct MI300X",
    vendor: "amd",
    memoryGb: 192,
    architecture: "CDNA3",
    formFactor: "instinct",
  },
  {
    id: "gpu_mi325x",
    slug: "mi325x",
    name: "Instinct MI325X",
    vendor: "amd",
    memoryGb: 256,
    architecture: "CDNA3",
    formFactor: "instinct",
  },
  {
    id: "gpu_mi250",
    slug: "mi250",
    name: "Instinct MI250",
    vendor: "amd",
    memoryGb: 128,
    architecture: "CDNA2",
    formFactor: "instinct",
  },
  {
    id: "gpu_7900xtx",
    slug: "radeon-7900-xtx",
    name: "Radeon RX 7900 XTX",
    vendor: "amd",
    memoryGb: 24,
    architecture: "RDNA3",
    formFactor: "radeon",
  },
  {
    id: "gpu_rtx5090",
    slug: "rtx-5090",
    name: "GeForce RTX 5090",
    vendor: "nvidia",
    memoryGb: 32,
    architecture: "Blackwell",
    formFactor: "consumer_nvidia",
  },
  {
    id: "gpu_h100",
    slug: "h100",
    name: "NVIDIA H100",
    vendor: "nvidia",
    memoryGb: 80,
    architecture: "Hopper",
    formFactor: "datacenter_nvidia",
  },
] as const;

export const WORKLOAD_SEED = [
  {
    id: "wl_llama3",
    slug: "llama-3",
    name: "Llama 3",
    category: "llm_inference",
    description:
      "Meta Llama 3 family inference throughput and latency on ROCm and CUDA.",
    primaryMetric: "tokensPerSec",
    primaryMetricLabel: "Tokens / sec",
    higherIsBetter: true,
  },
  {
    id: "wl_deepseek",
    slug: "deepseek",
    name: "DeepSeek",
    category: "llm_inference",
    description:
      "DeepSeek model family inference benchmarks across AMD and NVIDIA GPUs.",
    primaryMetric: "tokensPerSec",
    primaryMetricLabel: "Tokens / sec",
    higherIsBetter: true,
  },
  {
    id: "wl_sd",
    slug: "stable-diffusion",
    name: "Stable Diffusion",
    category: "diffusion",
    description:
      "Image generation throughput for Stable Diffusion pipelines.",
    primaryMetric: "imagesPerSec",
    primaryMetricLabel: "Images / sec",
    higherIsBetter: true,
  },
  {
    id: "wl_pytorch_train",
    slug: "pytorch-training",
    name: "PyTorch Training",
    category: "training",
    description:
      "Training step time and samples/sec for representative PyTorch workloads.",
    primaryMetric: "samplesPerSec",
    primaryMetricLabel: "Samples / sec",
    higherIsBetter: true,
  },
  {
    id: "wl_vllm",
    slug: "vllm-serving",
    name: "vLLM Serving",
    category: "llm_serving",
    description:
      "Production serving metrics with vLLM: throughput, TTFT, and TPOT.",
    primaryMetric: "tokensPerSec",
    primaryMetricLabel: "Tokens / sec",
    higherIsBetter: true,
  },
] as const;

export const GPU_SLUGS = GPU_SEED.map((g) => g.slug);
export const WORKLOAD_SLUGS = WORKLOAD_SEED.map((w) => w.slug);

export type GpuSlug = (typeof GPU_SEED)[number]["slug"];
export type WorkloadSlug = (typeof WORKLOAD_SEED)[number]["slug"];
