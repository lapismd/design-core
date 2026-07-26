<script lang="ts">
  import type { AppShellController } from "../../core/app-shell-controller.svelte.js";
  import WorkspaceIcon from "../../icon/WorkspaceIcon.svelte";
  import type { NotificationPresentationState } from "./notification-presentation.svelte.js";
  import { createNotificationStatusState } from "./notification-status-model.js";
  import "./Notifications.css";

  let {
    app,
    presentation,
  }: {
    app: AppShellController;
    presentation: NotificationPresentationState;
  } = $props();

  let status = $derived(
    createNotificationStatusState(
      app.notifications.records,
      app.notifications.activeProgress,
    ),
  );
</script>

<button
  type="button"
  class="ui-workspace-notifications__status"
  class:ui-workspace-notifications__status--busy={status.hasProgress}
  aria-label={status.hasProgress
    ? status.progressTooltip
    : status.historyTooltip}
  aria-expanded={presentation.centerOpen}
  aria-haspopup="dialog"
  onclick={() => presentation.toggle()}
>
  <WorkspaceIcon name={status.hasProgress ? "loader-circle" : "bell"} />
  {#if status.hasProgress}
    <span>{status.progressLabel}</span>
  {:else if status.unreadText}
    <span>{status.unreadText}</span>
  {/if}
</button>
