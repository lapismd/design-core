<script lang="ts">
  import { onDestroy, type Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import type { WorkspaceTabsNode } from "../core/types.js";
  import type { WorkspaceDragState } from "../drag/workspace-drag.svelte.js";

  let {
    pane,
    index,
    drag,
    children,
    dropZones = ["left", "right"],
    indicatorRoot = null,
    indicatorScope,
    insertionReferenceSelector,
    activate,
    ...rest
  }: HTMLAttributes<HTMLDivElement> & {
    pane: WorkspaceTabsNode;
    index: number;
    drag: WorkspaceDragState;
    children?: Snippet;
    dropZones?: Array<"left" | "right">;
    indicatorRoot?: HTMLElement | null;
    indicatorScope: string;
    insertionReferenceSelector?: string;
    activate?: () => void;
  } = $props();

  let container = $state<HTMLElement>();
  let selectTimeout: ReturnType<typeof setTimeout> | null = null;
  const indicatorWidth = 3;

  function clearSelectTimeout() {
    if (selectTimeout === null) return;
    clearTimeout(selectTimeout);
    selectTimeout = null;
  }

  function clearIndicator() {
    drag.clearTabMoveIndicator(indicatorScope);
    if (
      drag.target?.paneId === pane.id &&
      drag.target.insertionIndex !== undefined
    ) {
      drag.clearTarget(pane.id);
    }
  }

  function updateIndicator(clientX: number, source: "html5" | "pointer") {
    if (!container || !indicatorRoot || !drag.active) return;
    if (selectTimeout === null && pane.activeItemId !== pane.items[index]?.id) {
      selectTimeout = setTimeout(() => {
        if (drag.tabMoveIndicator.scope === indicatorScope) activate?.();
      }, 2000);
    }

    const rect = container.getBoundingClientRect();
    if (rect.width <= 0) return;
    const insertionReference = insertionReferenceSelector
      ? container.querySelector<HTMLElement>(insertionReferenceSelector)
      : null;
    const insertionRect = insertionReference?.getBoundingClientRect() ?? rect;
    if (insertionRect.width <= 0) return;
    const fromLeft = (clientX - insertionRect.x) / insertionRect.width;
    const positions = [
      { position: "left" as const, distance: fromLeft },
      { position: "right" as const, distance: 1 - fromLeft },
    ]
      .filter((candidate) => dropZones.includes(candidate.position))
      .sort((a, b) => a.distance - b.distance);
    if (!positions.length || positions[0]!.distance >= 0.5) {
      clearIndicator();
      return;
    }

    const position = positions[0]!.position;
    const insertionIndex = position === "left" ? index : index + 1;
    if (!drag.setInsertionTarget(pane.id, insertionIndex, source)) {
      clearIndicator();
      return;
    }
    const rootRect = indicatorRoot.getBoundingClientRect();
    drag.setTabMoveIndicator(indicatorScope, {
      x:
        position === "left"
          ? rect.left - rootRect.left
          : rect.right - rootRect.left - indicatorWidth,
      y: rect.top - rootRect.top,
      width: indicatorWidth,
      height: rect.height,
    });
  }

  function register(node: HTMLElement) {
    return {
      destroy: drag.registerPointerDropTarget(node, {
        onMove: (event) => updateIndicator(event.clientX, "pointer"),
        onDrop: () => {
          drag.commitCurrentDrop("pointer");
          clearSelectTimeout();
        },
        onLeave: () => {
          clearIndicator();
          clearSelectTimeout();
        },
      }),
    };
  }

  function handleDragLeave(event: DragEvent) {
    if (
      container &&
      event.relatedTarget instanceof Node &&
      container.contains(event.relatedTarget)
    ) {
      return;
    }
    clearIndicator();
    clearSelectTimeout();
  }

  onDestroy(() => {
    clearSelectTimeout();
    clearIndicator();
  });
</script>

<!-- Source: packages/workspace/src/lib/components/tabs/tabs-move.svelte -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  bind:this={container}
  {...rest}
  use:register
  ondragenter={(event) => event.preventDefault()}
  ondragover={(event) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
    updateIndicator(event.clientX, "html5");
  }}
  ondragleave={handleDragLeave}
  ondrop={(event) => {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    drag.commitCurrentDrop("html5");
    clearSelectTimeout();
  }}
>
  {@render children?.()}
</div>
