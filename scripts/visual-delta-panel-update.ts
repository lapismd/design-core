import { spawnSync } from "node:child_process";

if (process.env.VISUAL_UPDATE_APPROVED !== "1") {
  console.error(
    "Panel baseline updates require VISUAL_UPDATE_APPROVED=1 after human review.",
  );
  process.exit(1);
}

if (process.env.VISUAL_DELTA_PANEL_SKIP_BUILD !== "1") {
  // Panel acceptance hosts the package Storybook, not the UI catalog.
  const build = spawnSync(
    "pnpm",
    ["--filter", "storybook-addon-visual-delta", "build-storybook"],
    {
      stdio: "inherit",
      env: process.env,
    },
  );
  if (build.status !== 0) process.exit(build.status ?? 1);
}

const update = spawnSync(
  "pnpm",
  [
    "exec",
    "playwright",
    "test",
    "-c",
    "packages/storybook-addon-visual-delta/playwright.panel.config.ts",
    "packages/storybook-addon-visual-delta/tests/panel.spec.ts",
    "--update-snapshots=all",
  ],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      PLAYWRIGHT_UPDATE_SNAPSHOTS: "1",
      PLAYWRIGHT_UPDATE_MODE: "all",
      // Static was built above; avoid a second package Storybook build.
      VISUAL_DELTA_PANEL_SKIP_STATIC_BUILD: "1",
    },
  },
);
if (update.status === 0) process.exit(0);

// Re-run in compare-only mode after an interrupted update so the gated command
// succeeds only when every panel baseline is readable and every non-screenshot
// assertion passes.
const verify = spawnSync(
  "pnpm",
  [
    "exec",
    "playwright",
    "test",
    "-c",
    "packages/storybook-addon-visual-delta/playwright.panel.config.ts",
    "packages/storybook-addon-visual-delta/tests/panel.spec.ts",
  ],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      PLAYWRIGHT_UPDATE_SNAPSHOTS: "0",
      VISUAL_DELTA_PANEL_SKIP_STATIC_BUILD: "1",
    },
  },
);
process.exit(verify.status ?? 1);
