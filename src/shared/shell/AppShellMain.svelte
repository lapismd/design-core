<script lang="ts">
  import { onDestroy } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import type { WithElementRef } from "../../lib/utils.js";
  import { useAppShell } from "./app-shell-context.svelte.js";
  import { appShellTeleport } from "./app-shell-teleport.js";

  let {
    ref = $bindable(null),
    tabindex: _tabindex,
    class: className,
    children,
    ...restProps
  }: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();

  const controller = useAppShell();

  $effect(() => controller.mobile.setMainElement(ref));
  onDestroy(() => controller.mobile.setMainElement(null));
</script>

<div
  bind:this={ref}
  use:appShellTeleport={{
    enabled: controller.mobile.resolvedMode === "mobile",
    target: controller.mobile.getMainHost(),
  }}
  {...restProps}
  tabindex="-1"
  class={["ui-minimal-app-shell__main", className].filter(Boolean).join(" ")}
  data-ui-component="app-shell"
  data-ui-part="main"
>
  {@render children?.()}
</div>
