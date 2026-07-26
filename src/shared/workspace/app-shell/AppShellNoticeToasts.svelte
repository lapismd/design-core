<script lang="ts">
  import type { AppShellController } from "../core/app-shell-controller.svelte.js";
  import WorkspaceIcon from "../icon/WorkspaceIcon.svelte";

  let { app }: { app: AppShellController } = $props();
  let records = $derived(
    app.notifications.hasCustomPresenter ? [] : app.notifications.transient,
  );
</script>

{#if records.length > 0}
  <div
    class="ui-app-shell__notice-toasts"
    aria-label="Notifications"
    aria-live="polite"
    role="region"
    data-ui-part="fallback-notices"
  >
    {#each records as record (record.id)}
      <section
        class="ui-app-shell__notice-toast"
        data-severity={record.severity}
        data-notification-id={record.id}
        role={record.severity === "error" ? "alert" : "status"}
      >
        <span aria-hidden="true"></span>
        <div>
          {#if record.title}<strong>{record.title}</strong>{/if}
          <span>{record.message}</span>
        </div>
        <button
          type="button"
          aria-label={`Dismiss ${record.title ?? record.message}`}
          onclick={() => app.notifications.dismiss(record.id)}
        >
          <WorkspaceIcon name="x" />
        </button>
      </section>
    {/each}
  </div>
{/if}
