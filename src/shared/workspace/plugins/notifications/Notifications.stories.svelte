<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor } from "storybook/test";
  import AppShellRoot from "../../app-shell/AppShellRoot.svelte";
  import { AppShellController } from "../../core/app-shell-controller.svelte.js";
  import { APP_SHELL_SETTING_IDS } from "../../core/built-in-settings.svelte.js";
  import type { NotificationProgressHandle } from "../../core/notification-manager.svelte.js";
  import NotificationsStorySurface from "./NotificationsStorySurface.svelte";
  import * as exampleSources from "./Notifications.example-sources.js";
  import {
    NOTIFICATIONS_PLUGIN_ID,
    notificationsPlugin,
  } from "./notifications-plugin.js";
  import "./Notifications.stories.css";

  function createNotificationsApp(
    showToasts = true,
    withPlugin = true,
  ): AppShellController {
    return new AppShellController({
      plugins: withPlugin
        ? [notificationsPlugin({ showToasts, showStatus: true })]
        : [],
      configuration: {
        values: {
          [APP_SHELL_SETTING_IDS.mobileMode]: "never",
        },
      },
    });
  }

  const emptyApp = createNotificationsApp();
  const historyApp = createNotificationsApp();
  const toastApp = createNotificationsApp();
  const progressApp = createNotificationsApp();
  const fallbackApp = createNotificationsApp(false);
  const noticeApp = createNotificationsApp(true, false);
  let progressHandle: NotificationProgressHandle | undefined;

  async function waitForPlugin(app: AppShellController): Promise<void> {
    await waitFor(() => {
      expect(app.plugins.get(NOTIFICATIONS_PLUGIN_ID)).toMatchObject({
        enabled: true,
        status: "enabled",
      });
    });
  }

  async function openCenter(
    app: AppShellController,
    canvasElement: HTMLElement,
  ): Promise<void> {
    await waitForPlugin(app);
    const button = await waitFor(() => {
      const element = canvasElement.querySelector<HTMLButtonElement>(
        '[data-status-bar-item-id="notifications:status"]',
      );
      expect(element).not.toBeNull();
      return element!;
    });
    await userEvent.click(button);
    await expect(
      canvasElement.querySelector("[data-notification-center]"),
    ).not.toBeNull();
  }

  const { Story } = defineMeta({
    title: "Workspace/Plugins/Notifications",
    component: NotificationsStorySurface,
    parameters: {
      layout: "fullscreen",
      docs: {
        description: {
          component:
            "Optional notification presentation over the controller-owned transient, durable history, unread, progress, and cancellation service.",
        },
        source: {
          code: exampleSources.Basic,
          language: "ts",
          type: "code",
        },
      },
    },
  });
</script>

<Story
  name="Toast severities"
  tags={["visual-approved"]}
  play={async ({ canvas, canvasElement }) => {
    await waitForPlugin(toastApp);
    toastApp.notifications.clearTransient();
    toastApp.notifications.notify({
      id: "toast-info",
      title: "Workspace restored",
      message: "Your previous layout is ready.",
      severity: "info",
      duration: 0,
    });
    toastApp.notifications.notify({
      id: "toast-warning",
      title: "Sync paused",
      message: "Reconnect to continue.",
      severity: "warning",
      duration: 0,
    });
    toastApp.notifications.notify({
      id: "toast-error",
      title: "Export failed",
      message: "The destination could not be written.",
      severity: "error",
      duration: 0,
    });
    await waitFor(() => {
      expect(canvas.getByText("Workspace restored")).toBeVisible();
      expect(canvas.getByText("Sync paused")).toBeVisible();
      expect(canvas.getByText("Export failed")).toBeVisible();
      expect(
        canvasElement.querySelectorAll(
          "[data-notification-toasts] [data-notification-id]",
        ),
      ).toHaveLength(3);
    });
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/plugins/notifications/toast-severities-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <div class="ui-workspace-notifications-story">
      <div class="ui-workspace-notifications-story__frame">
        <AppShellRoot controller={toastApp} theme="inherit">
          <NotificationsStorySurface />
        </AppShellRoot>
      </div>
    </div>
  {/snippet}
</Story>

<Story
  name="Populated history"
  tags={["visual-approved"]}
  play={async ({ canvas, canvasElement }) => {
    await waitForPlugin(historyApp);
    await historyApp.notifications.clearAll();
    for (const record of [
      {
        id: "history-warning",
        title: "Sync paused",
        message: "Reconnect to continue.",
        severity: "warning" as const,
      },
      {
        id: "history-info",
        title: "Workspace restored",
        message: "Your previous layout was loaded.",
        severity: "info" as const,
      },
    ]) {
      historyApp.notifications.notify({
        ...record,
        persist: true,
        duration: 0,
      });
      historyApp.notifications.dismiss(record.id);
    }
    await openCenter(historyApp, canvasElement);
    await expect(canvas.getByText("Workspace restored")).toBeVisible();
    await expect(canvas.getByText("Sync paused")).toBeVisible();
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/plugins/notifications/populated-history-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <div class="ui-workspace-notifications-story">
      <div class="ui-workspace-notifications-story__frame">
        <AppShellRoot controller={historyApp} theme="inherit">
          <NotificationsStorySurface />
        </AppShellRoot>
      </div>
    </div>
  {/snippet}
</Story>

<Story
  name="Empty notification center"
  tags={["visual-approved"]}
  play={async ({ canvas, canvasElement }) => {
    await waitForPlugin(emptyApp);
    await emptyApp.notifications.clearAll();
    await openCenter(emptyApp, canvasElement);
    await expect(canvas.getByText("No new notifications")).toBeVisible();
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/plugins/notifications/empty-notification-center-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <div class="ui-workspace-notifications-story">
      <div class="ui-workspace-notifications-story__frame">
        <AppShellRoot controller={emptyApp} theme="inherit">
          <NotificationsStorySurface />
        </AppShellRoot>
      </div>
    </div>
  {/snippet}
</Story>

<Story
  name="Progress and cancellation"
  tags={["visual-approved"]}
  play={async ({ canvas, canvasElement }) => {
    await waitForPlugin(progressApp);
    progressHandle?.cancelled();
    progressHandle = progressApp.notifications.createProgress({
      id: "story-index",
      title: "Indexing workspace",
      message: "45 of 100 resources",
      cancellable: true,
    });
    progressHandle.report({ current: 45, total: 100 });
    await openCenter(progressApp, canvasElement);
    await expect(canvas.getByText("Indexing workspace")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Cancel" }));
    await expect(
      canvas.getByRole("button", { name: "Cancelling" }),
    ).toBeDisabled();
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/plugins/notifications/progress-and-cancellation-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <div class="ui-workspace-notifications-story">
      <div class="ui-workspace-notifications-story__frame">
        <AppShellRoot controller={progressApp} theme="inherit">
          <NotificationsStorySurface />
        </AppShellRoot>
      </div>
    </div>
  {/snippet}
</Story>

<Story
  name="Fallback toast presentation"
  tags={["visual-approved"]}
  play={async ({ canvas, canvasElement }) => {
    await waitForPlugin(fallbackApp);
    fallbackApp.notifications.clearTransient();
    fallbackApp.notifications.notify({
      id: "fallback-warning",
      title: "Fallback presentation",
      message: "Plugin toasts are disabled.",
      severity: "warning",
      duration: 0,
    });
    await waitFor(() => {
      expect(canvas.getByText("Fallback presentation")).toBeVisible();
      expect(
        canvasElement.querySelector("[data-ui-part='fallback-notices']"),
      ).not.toBeNull();
      expect(
        canvasElement.querySelector("[data-notification-toasts]"),
      ).toBeNull();
    });
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/plugins/notifications/fallback-toast-presentation-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <div class="ui-workspace-notifications-story">
      <div class="ui-workspace-notifications-story__frame">
        <AppShellRoot controller={fallbackApp} theme="inherit">
          <NotificationsStorySurface />
        </AppShellRoot>
      </div>
    </div>
  {/snippet}
</Story>

<Story
  name="Notice compatibility"
  tags={["visual-approved"]}
  play={async ({ canvas }) => {
    noticeApp.notifications.clearTransient();
    const notice = noticeApp.notices.show("Loading workspace", 0);
    notice.setMessage("Workspace loaded");
    await waitFor(() => {
      expect(canvas.getByText("Workspace loaded")).toBeVisible();
    });
    await userEvent.click(
      canvas.getByRole("button", { name: "Dismiss Workspace loaded" }),
    );
    await waitFor(() => {
      expect(canvas.queryByText("Workspace loaded")).not.toBeInTheDocument();
    });
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/plugins/notifications/notice-compatibility-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <div class="ui-workspace-notifications-story">
      <div class="ui-workspace-notifications-story__frame">
        <AppShellRoot controller={noticeApp} theme="inherit">
          <NotificationsStorySurface />
        </AppShellRoot>
      </div>
    </div>
  {/snippet}
</Story>
