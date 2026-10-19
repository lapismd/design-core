<script lang="ts">
  import { onMount } from "svelte";
  import * as Popover from "../../shadcn/popover/index.js";
  import type { WorkspaceStatusItem } from "../core/types.js";
  import WorkspaceIcon from "../icon/WorkspaceIcon.svelte";
  import WorkspaceStatusEntry from "./WorkspaceStatusEntry.svelte";
  import { statusOverflow } from "./status-overflow.js";

  let {
    items,
    side,
  }: { items: WorkspaceStatusItem[]; side: "left" | "right" } = $props();
  let root: HTMLDivElement | undefined = $state();
  // Keep contributions present until the first layout measurement is available.
  let available = $state(Number.POSITIVE_INFINITY);
  let widths = $state(new Map<string, number>());
  let open = $state(false);
  let target = $state<HTMLDivElement | null>(null);
  let hidden = $derived(statusOverflow(items, widths, available));
  const reportWidth = (id: string, width: number) => {
    if (widths.get(id) === width) return;
    const next = new Map(widths);
    next.set(id, width);
    widths = next;
  };
  onMount(() => {
    const observer = new ResizeObserver(() => {
      available = root!.clientWidth;
    });
    observer.observe(root!);
    return () => observer.disconnect();
  });
  $effect(() => {
    if (hidden.size === 0) open = false;
  });
</script>

<div
  bind:this={root}
  class="ui-workspace-status-bar__side"
  data-ui-part={side}
  data-side={side}
>
  <div class="ui-workspace-status-bar__items">
    {#each items as item (item.id)}
      <WorkspaceStatusEntry
        {item}
        overflowed={hidden.has(item.id)}
        overflowTarget={open ? target : null}
        onWidth={reportWidth}
      />
    {/each}
  </div>
  <Popover.Root bind:open>
    <Popover.Trigger
      class="ui-workspace-status-item ui-workspace-status-bar__more"
      style={hidden.size ? undefined : "display:none"}
      aria-label={`More ${side} status items`}
      title={`More ${side} status items`}
    >
      <WorkspaceIcon name="ellipsis" />
    </Popover.Trigger>
    <Popover.Content
      portalProps={{
        to: root?.closest<HTMLElement>("[data-app-shell-root]") ?? "body",
      }}
      class="ui-workspace-status-overflow"
      side="top"
      align={side === "left" ? "start" : "end"}
      sideOffset={6}
      aria-label={`${side} status items`}
      onOpenAutoFocus={(event) => {
        event.preventDefault();
        queueMicrotask(() =>
          target
            ?.querySelector<HTMLElement>("button, a, input, [tabindex='0']")
            ?.focus(),
        );
      }}
    >
      <div bind:this={target} class="ui-workspace-status-overflow__items"></div>
    </Popover.Content>
  </Popover.Root>
</div>
