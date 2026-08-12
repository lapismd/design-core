<script lang="ts">
  import { Badge } from "@lapismd/design-core/shadcn/badge";
  import type { WorkspaceTab } from "../core/types.js";
  import type { WorkspaceShellController } from "../core/workspace-controller.svelte.js";
  import { resolveWorkspaceViewLabel } from "./workspace-view-label.js";
  import "./WorkspaceViewLabel.css";

  let {
    controller,
    tab,
    hostId,
    paneId,
    fallbackTitle = tab.title,
    showTitle = true,
    announce = true,
    class: className = "",
  }: {
    controller: WorkspaceShellController;
    tab: WorkspaceTab;
    hostId: string;
    paneId: string;
    fallbackTitle?: string;
    showTitle?: boolean;
    announce?: boolean;
    class?: string;
  } = $props();

  let label = $derived(
    resolveWorkspaceViewLabel(controller, tab, hostId, paneId, fallbackTitle),
  );
  let title = $derived(label.title);
  let badge = $derived(label.badge);
  let accessibleLabel = $derived(label.accessibleLabel);
</script>

<span
  class={`ui-workspace-view-label ${className}`.trim()}
  data-ui-component="workspace-view-label"
  data-workspace-view-label={tab.id}
  data-title-visible={showTitle}
  data-has-badge={Boolean(badge)}
  aria-label={announce && badge ? accessibleLabel : undefined}
>
  {#if showTitle}
    <span class="ui-workspace-view-label__title" data-ui-part="title">
      {title}
    </span>
  {:else if !badge}
    <span class="sr-only">{title}</span>
  {/if}
  {#if badge}
    <Badge
      variant="secondary"
      class="ui-workspace-view-label__badge"
      data-workspace-view-badge={tab.id}
      aria-hidden="true"
    >
      {badge.value}
    </Badge>
  {/if}
</span>
