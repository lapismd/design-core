import { defineConfig, devices } from "@playwright/test";

const storybookPort = Number(process.env.STORYBOOK_PORT ?? "9009");
const port = Number(process.env.SHELL_STORYBOOK_PORT ?? storybookPort + 250);
const visualPort = Number(process.env.SHELL_VISUAL_SERVER_PORT ?? port + 1);
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./tests/shell",
  fullyParallel: false,
  expect: {
    timeout: 15_000,
  },
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"]],
  use: {
    baseURL,
    viewport: { width: 800, height: 900 },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: [
      `STORYBOOK_PORT=${port}`,
      `VISUAL_SERVER_PORT=${visualPort}`,
      `STORYBOOK_EXTRA_PORTS='${visualPort} ${port + 90}'`,
      "pnpm storybook",
    ].join(" "),
    url: `${baseURL}/index.json`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
