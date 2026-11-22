import { spawnSync } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import "./playwright-env.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const npx = process.platform === "win32" ? "npx.cmd" : "npx";

const result = spawnSync(
  npx,
  ["playwright", "install", "chromium"],
  {
    cwd: root,
    stdio: "inherit",
    env: process.env,
    shell: process.platform === "win32",
  },
);

process.exit(result.status ?? 1);