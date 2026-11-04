import {
  integer,
  jsonb,
  pgTable,
  real,
  text,
  timestamp,
  boolean,
  index,
} from "drizzle-orm/pg-core";

export const gpus = pgTable("gpus", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  vendor: text("vendor").notNull(), // amd | nvidia
  memoryGb: integer("memory_gb").notNull(),
  architecture: text("architecture").notNull(),
  formFactor: text("form_factor").notNull(), // instinct | radeon | datacenter_nvidia | consumer_nvidia
});

export const workloads = pgTable("workloads", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  category: text("category").notNull(), // llm_inference | llm_serving | diffusion | training
  description: text("description").notNull(),
  primaryMetric: text("primary_metric").notNull(),
  primaryMetricLabel: text("primary_metric_label").notNull(),
  higherIsBetter: boolean("higher_is_better").notNull().default(true),
});

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  githubId: text("github_id").notNull().unique(),
  login: text("login").notNull(),
  name: text("name"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const submissions = pgTable(
  "submissions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    gpuId: text("gpu_id")
      .notNull()
      .references(() => gpus.id),
    workloadId: text("workload_id")
      .notNull()
      .references(() => workloads.id),
    model: text("model").notNull(),
    gpuCount: integer("gpu_count").notNull().default(1),
    rocmVersion: text("rocm_version"),
    cudaVersion: text("cuda_version"),
    driverVersion: text("driver_version"),
    framework: text("framework").notNull(),
    frameworkVersion: text("framework_version").notNull(),
    precision: text("precision").notNull(),
    batchSize: integer("batch_size"),
    tensorParallel: integer("tensor_parallel"),
    maxSeqLen: integer("max_seq_len"),
    configFingerprint: text("config_fingerprint").notNull(),
    metrics: jsonb("metrics").notNull().$type<Record<string, number>>(),
    primaryValue: real("primary_value").notNull(),
    notes: text("notes"),
    artifactUrl: text("artifact_url"),
    flagged: boolean("flagged").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("submissions_workload_idx").on(table.workloadId),
    index("submissions_gpu_idx").on(table.gpuId),
    index("submissions_fingerprint_idx").on(table.configFingerprint),
    index("submissions_precision_idx").on(table.precision),
  ],
);

export type Gpu = typeof gpus.$inferSelect;
export type Workload = typeof workloads.$inferSelect;
export type User = typeof users.$inferSelect;
export type Submission = typeof submissions.$inferSelect;
