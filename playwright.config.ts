import { defineConfig } from "@playwright/test";

// Smoke tests run against the static export in `out/`, served as any static host would.
export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL: "http://localhost:4173",
    viewport: { width: 360, height: 740 },
    browserName: "chromium",
  },
  webServer: {
    command: "npx serve out -l 4173 --no-clipboard",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI,
  },
});
