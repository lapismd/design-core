<script lang="ts">
  import type { AppShellController } from "../../core/app-shell-controller.svelte.js";
  import InfoIcon from "@lucide/svelte/icons/info";
  import TriangleAlertIcon from "@lucide/svelte/icons/triangle-alert";
  import CircleAlertIcon from "@lucide/svelte/icons/circle-alert";
  import XIcon from "@lucide/svelte/icons/x";
  import type { NotificationToastRecord } from "./types.js";
  import { notificationPortal } from "./notification-portal.js";
  import { notificationClick } from "./notification-click.js";
  import "./Notifications.css";

  let {
    app,
    records: controlled,
    onDismiss,
    onAction,
    onPause,
    onResume,
    portal = false,
  }: {
    app?: AppShellController;
    records?: readonly NotificationToastRecord[];
    onDismiss?: (id: string) => void;
    onAction?: (id: string, action: string) => void;
    onPause?: (id: string) => void;
    onResume?: (id: string) => void;
    /** Portal above page content and into the active modal's keyboard scope. */
    portal?: boolean;
  } = $props();
  let records = $derived<readonly NotificationToastRecord[]>(
    controlled ?? app?.notifications.transient ?? [],
  );
  function resume(event: Event, id: string) {
    const node = event.currentTarget as HTMLElement;
    if (!node.matches(":hover") && !node.contains(document.activeElement))
      onResume?.(id);
  }
</script>

<div
  class="ui-workspace-notifications__toasts"
  use:notificationPortal={portal}
  data-portal={portal || undefined}
  aria-label={records.length ? "Notifications" : undefined}
  role={records.length ? "region" : undefined}
  data-ui-component="workspace-notification-toasts"
  data-notification-toasts
>
  {#each records as record (record.id)}
    <section
      class="ui-workspace-notifications__toast"
      data-ui-part="toast"
      data-severity={record.severity}
      data-notification-id={record.id}
      role={record.severity === "error" ? "alert" : "status"}
      onpointerenter={() => onPause?.(record.id)}
      onpointerleave={(event) => resume(event, record.id)}
      onfocusin={() => onPause?.(record.id)}
      onfocusout={(event) => {
        if (
          !(event.relatedTarget instanceof Node) ||
          !event.currentTarget.contains(event.relatedTarget)
        ) {
          if (!event.currentTarget.matches(":hover")) onResume?.(record.id);
        }
      }}
    >
      <span class="ui-workspace-notifications__severity" aria-hidden="true">
        {#if record.severity === "error"}<CircleAlertIcon />
        {:else if record.severity === "warning"}<TriangleAlertIcon />
        {:else}<InfoIcon />{/if}
      </span>
      <div class="ui-workspace-notifications__toast-content">
        {#if record.title}<strong>{record.title}</strong>{/if}
        <span>{record.message}</span>
        {#if record.action && onAction}<button
            type="button"
            class="ui-workspace-notifications__button"
            use:notificationClick={() =>
              onAction?.(record.id, record.action!.id)}
            >{record.action.label}</button
          >{/if}
      </div>
      <button
        type="button"
        class="ui-workspace-notifications__icon-button"
        aria-label={`Dismiss ${record.title ?? record.message}`}
        use:notificationClick={() =>
          onDismiss
            ? onDismiss(record.id)
            : app?.notifications.dismiss(record.id)}
      >
        <XIcon aria-hidden="true" />
      </button>
    </section>
  {/each}
</div>
