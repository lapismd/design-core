<script lang="ts">
  import { onDestroy, onMount, untrack } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import type { WithElementRef } from "../../lib/utils.js";
  import { setAppShellContext } from "./app-shell-context.svelte.js";
  import type { AppShellController } from "./app-shell-controller.svelte.js";
  import "./shell.tokens.css";
  import "./AppShell.css";

  let {
    ref = $bindable(null),
    controller,
    class: className,
    children,
    ...restProps
  }: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
    /** Reactive state owner shared by this shell's compound components. */
    controller: AppShellController;
  } = $props();

  const rootController = untrack(() => controller);
  setAppShellContext(rootController);

  onMount(() => {
    void rootController.restoreLayout();
  });

  onDestroy(() => {
    void rootController.flushSave();
  });
</script>

<div
  bind:this={ref}
  {...restProps}
  class={["ui-minimal-app-shell", className].filter(Boolean).join(" ")}
  data-ui-component="app-shell"
  data-ui-part="root"
  data-shell-root
  data-left-sidebar-state={rootController.left.state}
  data-right-sidebar-state={rootController.right.state}
>
  {@render children?.()}
</div>
