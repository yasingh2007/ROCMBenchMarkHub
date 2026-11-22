import { copyFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const envLocal = join(root, ".env.local");
const envExample = join(root, ".env.example");

if (!existsSync(envLocal) && existsSync(envExample)) {
  copyFileSync(envExample, envLocal);
  console.log("Created .env.local from .env.example");
} else if (existsSync(envLocal)) {
  console.log(".env.local already exists");
} else {
  console.warn("Missing .env.example — create .env.local manually");
}

console.log("");
console.log("Next steps:");
console.log("  npm run db:seed");
console.log("  npm run dev");
console.log("");
console.log("Optional: npm run setup:playwright  (for capture:readme)");
console.log("");
console.log(
  "If npm is not found in a terminal, reopen the terminal or install Node.js LTS from https://nodejs.org",
);