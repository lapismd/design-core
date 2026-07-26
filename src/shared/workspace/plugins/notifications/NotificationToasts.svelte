<script lang="ts">
  import type { AppShellController } from "../../core/app-shell-controller.svelte.js";
  import "./Notifications.css";

  let { app }: { app: AppShellController } = $props();
  let records = $derived(app.notifications.transient);
</script>

<div
  class="ui-workspace-notifications__toasts"
  aria-label="Notifications"
  aria-live="polite"
  role="region"
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
    >
      <span class="ui-workspace-notifications__severity" aria-hidden="true"
      ></span>
      <div class="ui-workspace-notifications__toast-content">
        {#if record.title}<strong>{record.title}</strong>{/if}
        <span>{record.message}</span>
      </div>
      <button
        type="button"
        class="ui-workspace-notifications__icon-button"
        aria-label={`Dismiss ${record.title ?? record.message}`}
        onclick={() => app.notifications.dismiss(record.id)}
      >
        <span aria-hidden="true">×</span>
      </button>
    </section>
  {/each}
</div>
