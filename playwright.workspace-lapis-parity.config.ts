import { defineConfig, devices } from "@playwright/test";

const storybookPort = Number(process.env.STORYBOOK_PORT ?? 9110);
const baseURL = `http://127.0.0.1:${storybookPort}`;

export default defineConfig({
  testDir: "./tests/workspace-lapis-parity",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  workers: 1,
  reporter: [["list"]],
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL,
    locale: "en-GB",
    timezoneId: "Europe/London",
    colorScheme: "light",
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 3,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 900 },
        deviceScaleFactor: 3,
      },
    },
  ],
  webServer: {
    command:
      "STORYBOOK_PORT=9110 VISUAL_SERVER_PORT=9111 pnpm storybook:workspace-parity",
    url: `${baseURL}/index.json`,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
