import { describe, expect, it } from "vitest";
import { AppShellController } from "../../core/app-shell-controller.svelte.js";
import {
  NOTIFICATIONS_PLUGIN_ID,
  NOTIFICATION_STATUS_ITEM_ID,
  TOGGLE_NOTIFICATION_CENTER_COMMAND_ID,
  notificationsPlugin,
} from "./notifications-plugin.js";

describe("notificationsPlugin", () => {
  it("registers presentation and removes every contribution on disable", async () => {
    const app = new AppShellController({
      plugins: [notificationsPlugin()],
    });

    await app.start();
    expect(app.plugins.get(NOTIFICATIONS_PLUGIN_ID)).toMatchObject({
      enabled: true,
      status: "enabled",
    });
    expect(app.notifications.hasCustomPresenter).toBe(true);
    expect(
      app.commands.getCommand(TOGGLE_NOTIFICATION_CENTER_COMMAND_ID),
    ).not.toBeNull();
    expect(app.ui.overlays.map((entry) => entry.id)).toContain(
      "notifications:presentation",
    );
    expect(
      app.status.items.some((item) => item.id === NOTIFICATION_STATUS_ITEM_ID),
    ).toBe(true);

    app.notifications.notify({
      message: "Ready",
      persist: true,
      duration: 0,
    });
    expect(
      app.status.items.find((item) => item.id === NOTIFICATION_STATUS_ITEM_ID)
        ?.label,
    ).toBe("1");

    expect(await app.plugins.disable(NOTIFICATIONS_PLUGIN_ID)).toBe(true);
    expect(app.notifications.hasCustomPresenter).toBe(false);
    expect(app.notifications.transient).toEqual([]);
    expect(
      app.commands.getCommand(TOGGLE_NOTIFICATION_CENTER_COMMAND_ID),
    ).toBeNull();
    expect(app.ui.overlays).toEqual([]);
    expect(
      app.status.items.some((item) => item.id === NOTIFICATION_STATUS_ITEM_ID),
    ).toBe(false);
    await app.dispose();
  });

  it("does not suppress fallback notices when toast presentation is disabled", async () => {
    const app = new AppShellController({
      plugins: [notificationsPlugin({ showToasts: false })],
    });

    await app.start();
    expect(app.notifications.hasCustomPresenter).toBe(false);
    expect(app.ui.overlays).toHaveLength(1);
    await app.dispose();
  });
});
