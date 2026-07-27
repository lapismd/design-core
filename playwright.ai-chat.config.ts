import { defineConfig, devices } from "@playwright/test";

const storybookPort = process.env.STORYBOOK_PORT ?? "9009";
const baseURL =
  process.env.AI_CHAT_STORYBOOK_URL ?? `http://127.0.0.1:${storybookPort}`;

export default defineConfig({
  testDir: "./tests/ai-chat",
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  webServer: {
    command: "pnpm storybook:ui",
    url: baseURL,
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
});
