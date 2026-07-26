import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const workspaceRoot = path.dirname(fileURLToPath(import.meta.url));

const controllerStoryFiles = [
  "about-dialog/WorkspaceAboutDialog.stories.svelte",
  "app-shell/AppShell.stories.svelte",
  "command-palette/WorkspaceCommandPalette.stories.svelte",
  "plugins/f-mode/FMode.stories.svelte",
  "plugins/notifications/Notifications.stories.svelte",
  "settings/WorkspaceSettings.stories.svelte",
];

describe("workspace story display-mode contract", () => {
  it("pins controller-backed visual stories to desktop configuration", async () => {
    for (const relativePath of controllerStoryFiles) {
      const source = await readFile(
        path.join(workspaceRoot, relativePath),
        "utf8",
      );
      expect(source, relativePath).toMatch(
        /APP_SHELL_SETTING_IDS\.mobileMode\]\s*:\s*"never"/,
      );
    }
  });

  it("pins the reusable demo factory to desktop unless explicitly overridden", async () => {
    const source = await readFile(
      path.join(workspaceRoot, "demo/framework-demo.ts"),
      "utf8",
    );
    expect(source).toMatch(
      /"workspace\.mobile\.mode":\s*options\.mobileMode\s*\?\?\s*"never"/,
    );
  });

  it("keeps mobile stories explicit", async () => {
    const source = await readFile(
      path.join(workspaceRoot, "demo/ReusableFrameworkDemo.stories.svelte"),
      "utf8",
    );
    expect(source).toMatch(/mobileMode:\s*"always"/);
    expect(source).toMatch(/displayMode="mobile"/);
  });
});
