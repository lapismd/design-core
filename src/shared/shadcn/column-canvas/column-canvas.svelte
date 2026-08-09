<script lang="ts">
  import "./column-canvas.css";
  import { untrack } from "svelte";
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import type { WithElementRef } from "../../../lib/utils.js";
  import type { ColumnCanvasController } from "./column-canvas-controller.svelte.js";
  import { setColumnCanvasContext } from "./context.svelte.js";

  let {
    ref = $bindable(null),
    controller,
    class: className,
    children,
    ...restProps
  }: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
    /**
     * App-owned controller. Do not destructure reactive fields.
     * Narrow column-id generics are accepted via structural cast at the call
     * site or by typing the const as `ColumnCanvasController`.
     */
    controller: ColumnCanvasController;
    children?: Snippet;
  } = $props();

  const rootController = untrack(() => controller);
  setColumnCanvasContext({ controller: rootController });

  $effect(() => {
    void rootController.restoreLayout();
  });

  const spacerStyle = $derived(
    `${Math.max(0, rootController.trailingSpacerWidth)}px`,
  );
</script>

<div
  bind:this={ref}
  {...restProps}
  class={className}
  data-ui-component="column-canvas"
  data-ui-part="root"
  data-layout-ready={rootController.layoutReady ? "true" : "false"}
>
  <div data-ui-component="column-canvas" data-ui-part="row">
    {@render children?.()}
    <div
      data-ui-component="column-canvas"
      data-ui-part="trailing-spacer"
      aria-hidden="true"
      style:width={spacerStyle}
      style:min-width={spacerStyle}
    ></div>
  </div>
</div>
