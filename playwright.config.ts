import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.BASE_URL || "http://127.0.0.1:3100";
const bypassSecret = process.env.BASE_URL
  ? process.env.VERCEL_AUTOMATION_BYPASS_SECRET
  : undefined;

if (process.env.CI && process.env.BASE_URL && !bypassSecret) {
  throw new Error(
    "Set the VERCEL_AUTOMATION_BYPASS_SECRET Actions secret before testing protected previews.",
  );
}

if (bypassSecret && new URL(baseURL).protocol !== "https:") {
  throw new Error("The deployment-protection bypass requires an HTTPS BASE_URL.");
}

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    // Traces record headers; never upload the automation secret in a trace.
    trace: bypassSecret ? "off" : "on-first-retry",
    extraHTTPHeaders: bypassSecret
      ? {
          "x-vercel-protection-bypass": bypassSecret,
          "x-vercel-set-bypass-cookie": "true",
        }
      : undefined,
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-chrome", use: { ...devices["Pixel 7"] } },
  ],
  // Preview deployments are already running. Local runs own their server so
  // tests cannot accidentally pass against a stale development session.
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: "pnpm build && pnpm start --hostname 127.0.0.1 --port 3100",
        url: baseURL,
        reuseExistingServer: false,
        timeout: 180_000,
      },
});
