<script lang="ts">
  import type { AppShellController } from "../../core/app-shell-controller.svelte.js";
  import NotificationCenter from "./NotificationCenter.svelte";
  import type { NotificationPresentationState } from "./notification-presentation.svelte.js";
  import NotificationToasts from "./NotificationToasts.svelte";

  let {
    app,
    portalTarget,
    presentation,
    showToasts = true,
  }: {
    app: AppShellController;
    portalTarget: HTMLElement;
    presentation: NotificationPresentationState;
    showToasts?: boolean;
  } = $props();
</script>

{#if showToasts}
  <NotificationToasts {app} />
{/if}
<NotificationCenter {app} {portalTarget} {presentation} />
