import { describe, expect, it } from "vitest";
import { AppShellController } from "../../core/app-shell-controller.svelte.js";
import { fModePlugin } from "./f-mode-plugin.js";

describe("fModePlugin", () => {
  it("registers through the plugin API and cleans up on disable", async () => {
    const app = new AppShellController({
      plugins: [fModePlugin()],
    });

    await app.start();
    expect(app.plugins.get("fmode")).toMatchObject({
      enabled: true,
      status: "enabled",
    });
    expect(app.commands.getCommand("toggle-fmode")).not.toBeNull();
    expect(
      app.settings.sections.some((section) => section.id === "fmode"),
    ).toBe(true);
    expect(app.ui.overlays.map((overlay) => overlay.id)).toContain(
      "fmode:overlay",
    );

    expect(await app.plugins.disable("fmode")).toBe(true);
    expect(app.commands.getCommand("toggle-fmode")).toBeNull();
    expect(
      app.settings.sections.some((section) => section.id === "fmode"),
    ).toBe(false);
    expect(app.ui.overlays).toEqual([]);
    await app.dispose();
  });
});
