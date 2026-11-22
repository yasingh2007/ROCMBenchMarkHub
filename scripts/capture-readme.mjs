import { chromium } from "playwright";
import { mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { ensurePlaywrightBrowsersHint } from "./playwright-env.mjs";

import "./playwright-env.mjs";
ensurePlaywrightBrowsersHint();

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "docs", "homepage.png");
const url = process.env.CAPTURE_URL ?? "http://localhost:3000";

mkdirSync(dirname(out), { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
await page.waitForTimeout(1500);
await page.screenshot({ path: out, fullPage: false });
await browser.close();

console.log(`Saved ${out}`);