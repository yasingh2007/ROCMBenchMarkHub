import { existsSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

if (!process.env.PLAYWRIGHT_BROWSERS_PATH) {
  process.env.PLAYWRIGHT_BROWSERS_PATH = join(root, ".playwright-browsers");
}

export function ensurePlaywrightBrowsersHint() {
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH;
  if (!existsSync(base)) {
    fail();
    return;
  }
  const hasChromium = readdirSync(base).some(
    (name) => name.startsWith("chromium") || name.startsWith("chromium_headless"),
  );
  if (!hasChromium) {
    fail();
  }
}

function fail() {
  console.error(
    "Playwright Chromium is not installed. Run:\n\n  npm run setup:playwright\n",
  );
  process.exit(1);
}