<script lang="ts">
  import { onMount } from "svelte";
  import type { WorkspaceStatusItem as StatusItem } from "../core/types.js";
  import WorkspaceStatusItem from "../status-item/WorkspaceStatusItem.svelte";

  let {
    item,
    overflowed,
    overflowTarget,
    onWidth,
  }: {
    item: StatusItem;
    overflowed: boolean;
    overflowTarget: HTMLElement | null;
    onWidth: (id: string, width: number) => void;
  } = $props();
  let home: HTMLDivElement | undefined = $state();
  let content: HTMLDivElement | undefined = $state();

  onMount(() => {
    const node = content!;
    const observer = new ResizeObserver(() =>
      onWidth(item.id, node.getBoundingClientRect().width),
    );
    observer.observe(node);
    return () => observer.disconnect();
  });
  $effect(() => {
    if (!content || !home) return;
    const destination = overflowed && overflowTarget ? overflowTarget : home;
    if (content.parentElement === destination) return;
    const focused = content.ownerDocument.activeElement;
    const restore = focused instanceof HTMLElement && content.contains(focused);
    destination.append(content);
    if (restore && !destination.inert)
      (focused as HTMLElement).focus({ preventScroll: true });
    return () => {
      if (content && home && content.parentElement !== home)
        home.append(content);
    };
  });
</script>

<div
  bind:this={home}
  class="ui-workspace-status-entry"
  data-overflowed={overflowed}
  inert={overflowed}
>
  <div bind:this={content} class="ui-workspace-status-entry__content">
    <WorkspaceStatusItem {item} />
  </div>
</div>
