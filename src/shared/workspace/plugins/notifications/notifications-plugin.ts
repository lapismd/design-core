import {
  AppShellPlugin,
  type AppShellPluginDescriptor,
} from "../../core/index.js";
import { NotificationPresentationState } from "./notification-presentation.svelte.js";
import {
  createNotificationStatusState,
  type NotificationStatusState,
} from "./notification-status-model.js";
import NotificationsOverlay from "./NotificationsOverlay.svelte";
import type {
  NotificationsPluginOptions,
  NotificationsPluginRuntimeOptions,
} from "./types.js";

export const NOTIFICATIONS_PLUGIN_ID = "notifications";
export const TOGGLE_NOTIFICATION_CENTER_COMMAND_ID =
  "plugin-notifications:toggle-center";
export const NOTIFICATION_STATUS_ITEM_ID = "notifications:status";
export const NOTIFICATION_ACTIVITY_ITEM_ID = "notifications:activity";

class NotificationsAppShellPlugin extends AppShellPlugin<NotificationsPluginRuntimeOptions> {
  readonly #presentation = new NotificationPresentationState();

  onload(): void {
    if (this.options.showToasts) {
      this.register(
        this.app.notifications.claimPresentation(NOTIFICATIONS_PLUGIN_ID),
      );
    }
    this.registerOverlay({
      id: "notifications:presentation",
      component: NotificationsOverlay,
      props: {
        presentation: this.#presentation,
        showToasts: this.options.showToasts,
      },
      priority: 200,
    });
    this.addCommand({
      id: TOGGLE_NOTIFICATION_CENTER_COMMAND_ID,
      title: "Toggle notification center",
      category: "Notifications",
      icon: "bell",
      callback: () => this.#presentation.toggle(),
    });

    if (this.options.showStatus) {
      const sync = () => this.#syncStatusItem();
      const ref = this.app.notifications.on("changed", sync);
      this.register(() => this.app.notifications.offref(ref));
      this.register(() => {
        this.app.status.removeItem(NOTIFICATION_STATUS_ITEM_ID);
        this.app.status.removeItem(NOTIFICATION_ACTIVITY_ITEM_ID);
      });
      sync();
    }
    this.register(() => this.#presentation.close());
  }

  #syncStatusItem(): void {
    const state = createNotificationStatusState(
      this.app.notifications.records,
      this.app.notifications.activeProgress,
    );
    this.app.status.addItem(this.#createStatusItem(state));
    if (state.hasProgress) {
      this.app.status.addItem({
        id: NOTIFICATION_ACTIVITY_ITEM_ID,
        align: "center",
        priority: 0,
        icon: "loader-circle",
        busy: true,
        label: state.progressLabel,
        tooltip: state.progressTooltip,
        onSelect: () => this.#presentation.toggle(),
      });
    } else this.app.status.removeItem(NOTIFICATION_ACTIVITY_ITEM_ID);
  }

  #createStatusItem(state: NotificationStatusState) {
    return {
      id: NOTIFICATION_STATUS_ITEM_ID,
      align: "right" as const,
      priority: 10000,
      icon: "bell" as const,
      label: state.unreadText,
      tooltip: state.historyTooltip,
      onSelect: () => this.#presentation.toggle(),
    };
  }
}

export function notificationsPlugin(
  options: NotificationsPluginOptions = {},
): AppShellPluginDescriptor {
  return {
    id: NOTIFICATIONS_PLUGIN_ID,
    name: "Notifications",
    description:
      "Show transient alerts, durable history, and background progress.",
    icon: "bell",
    required: false,
    enabled: options.enabled ?? true,
    plugin: NotificationsAppShellPlugin,
    options: {
      showToasts: options.showToasts ?? true,
      showStatus: options.showStatus ?? true,
    } satisfies NotificationsPluginRuntimeOptions,
  };
}
