<script lang="ts">
  import type { AppShellController } from "../../core/app-shell-controller.svelte.js";
  import type { NotificationRecord } from "../../core/notification-manager.svelte.js";
  import WorkspaceIcon from "../../icon/WorkspaceIcon.svelte";
  import type { NotificationPresentationState } from "./notification-presentation.svelte.js";
  import { createNotificationStatusState } from "./notification-status-model.js";
  import "./Notifications.css";

  const STATUS_SELECTOR = "[data-status-bar-item-id='notifications:status']";
  const PANEL_GAP = 6;
  const PANEL_EDGE = 8;

  let {
    app,
    presentation,
    portalTarget,
  }: {
    app: AppShellController;
    presentation: NotificationPresentationState;
    portalTarget: HTMLElement;
  } = $props();

  let panel = $state<HTMLElement | null>(null);
  let panelStyle = $state<string>();
  let records = $derived(app.notifications.records);
  let status = $derived(
    createNotificationStatusState(records, app.notifications.activeProgress),
  );
  let empty = $derived(
    records.length === 0 && status.backgroundTasks.length === 0,
  );

  function formatTime(record: NotificationRecord): string {
    return new Date(record.updatedAt || record.createdAt).toLocaleTimeString();
  }

  function updatePosition(): void {
    const anchor = portalTarget.querySelector<HTMLElement>(STATUS_SELECTOR);
    if (!anchor) {
      panelStyle = undefined;
      return;
    }
    const anchorRect = anchor.getBoundingClientRect();
    const surfaceRect = portalTarget.getBoundingClientRect();
    const right = Math.max(PANEL_EDGE, surfaceRect.right - anchorRect.right);
    const bottom = Math.max(
      PANEL_EDGE,
      surfaceRect.bottom - anchorRect.top + PANEL_GAP,
    );
    panelStyle = `right:${right}px;bottom:${bottom}px;`;
  }

  $effect(() => {
    if (!presentation.centerOpen) return;
    const unread = records.filter((record) => !record.read);
    if (unread.length > 0) {
      void Promise.all(
        unread.map((record) => app.notifications.markRead(record.id)),
      );
    }
  });

  $effect(() => {
    if (!presentation.centerOpen) return;
    const document = portalTarget.ownerDocument;
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (
        target instanceof Node &&
        (panel?.contains(target) ||
          (target instanceof Element &&
            target.closest(STATUS_SELECTOR) !== null))
      ) {
        return;
      }
      presentation.close();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") presentation.close();
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  });

  $effect(() => {
    if (!presentation.centerOpen) {
      panelStyle = undefined;
      return;
    }
    const document = portalTarget.ownerDocument;
    const view = document.defaultView;
    updatePosition();
    view?.addEventListener("resize", updatePosition);
    document.addEventListener("scroll", updatePosition, true);
    return () => {
      view?.removeEventListener("resize", updatePosition);
      document.removeEventListener("scroll", updatePosition, true);
    };
  });
</script>

{#if presentation.centerOpen}
  <div
    bind:this={panel}
    class="ui-workspace-notifications__center"
    style={panelStyle}
    role="dialog"
    aria-modal="false"
    aria-labelledby="ui-workspace-notification-center-title"
    data-ui-component="workspace-notification-center"
    data-ui-part="center"
    data-notification-center
  >
    <header class="ui-workspace-notifications__center-header">
      <h2 id="ui-workspace-notification-center-title">Notifications</h2>
      <div class="ui-workspace-notifications__center-actions">
        {#if records.length > 0}
          <button
            type="button"
            class="ui-workspace-notifications__button"
            onclick={() => void app.notifications.clearAll()}
          >
            Clear all
          </button>
        {/if}
        <button
          type="button"
          class="ui-workspace-notifications__icon-button"
          aria-label="Close notification center"
          onclick={() => presentation.close()}
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>
    </header>

    <div class="ui-workspace-notifications__center-scroll">
      {#if empty}
        <div class="ui-workspace-notifications__empty">
          <WorkspaceIcon name="bell-off" />
          <div>
            <strong>No new notifications</strong>
            <p>Updates and background progress will appear here.</p>
          </div>
        </div>
      {:else}
        {#if status.backgroundTasks.length > 0}
          <section class="ui-workspace-notifications__section">
            <h3>In progress</h3>
            {#each status.backgroundTasks as task (task.id)}
              <article
                class="ui-workspace-notifications__row"
                data-notification-progress-id={task.id}
              >
                <div class="ui-workspace-notifications__row-heading">
                  <div>
                    <strong>{task.title}</strong>
                    {#if task.detail}<p>{task.detail}</p>{/if}
                  </div>
                  {#if task.cancellable}
                    <button
                      type="button"
                      class="ui-workspace-notifications__button"
                      disabled={task.cancelRequested}
                      onclick={() => app.notifications.cancel(task.id)}
                    >
                      {task.cancelRequested ? "Cancelling" : "Cancel"}
                    </button>
                  {/if}
                </div>
                {#if typeof task.progress === "number"}
                  <progress max="100" value={task.progress}>
                    {task.progress}%
                  </progress>
                {:else}
                  <div
                    class="ui-workspace-notifications__indeterminate-progress"
                    role="progressbar"
                    aria-label={`${task.title} progress`}
                  ></div>
                {/if}
              </article>
            {/each}
          </section>
        {/if}

        {#if records.length > 0}
          <section class="ui-workspace-notifications__section">
            <h3>History</h3>
            {#each records as record (record.id)}
              <article
                class="ui-workspace-notifications__row"
                class:ui-workspace-notifications__row--unread={!record.read}
                data-notification-id={record.id}
                data-severity={record.severity}
              >
                <div class="ui-workspace-notifications__row-heading">
                  <div>
                    <strong>{record.title ?? record.message}</strong>
                    {#if record.title}<p>{record.message}</p>{/if}
                  </div>
                  <button
                    type="button"
                    class="ui-workspace-notifications__icon-button"
                    aria-label={`Clear ${record.title ?? record.message}`}
                    onclick={() => void app.notifications.clear(record.id)}
                  >
                    <span aria-hidden="true">×</span>
                  </button>
                </div>
                <time datetime={new Date(record.updatedAt).toISOString()}>
                  {formatTime(record)}
                </time>
              </article>
            {/each}
          </section>
        {/if}
      {/if}
    </div>
  </div>
{/if}
