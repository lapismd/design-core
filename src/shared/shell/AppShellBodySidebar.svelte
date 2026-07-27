<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import type { WithElementRef } from "../../lib/utils.js";
  import { ScrollArea } from "../shadcn/scroll-area/index.js";
  import { useAppShell } from "./app-shell-context.svelte.js";
  import { useAppShellBody } from "./app-shell-body-context.svelte.js";
  import type { AppShellSide } from "./app-shell-controller.svelte.js";

  let {
    ref = $bindable(null),
    side,
    label,
    class: className,
    children,
    ...restProps
  }: WithElementRef<HTMLAttributes<HTMLElement>> & {
    /** The side of the main body occupied by this local region. */
    side: AppShellSide;
    /** Accessible landmark name. Defaults from `side`. */
    label?: string;
  } = $props();

  useAppShell();
  const body = useAppShellBody();

  if (body.layout !== "regions") {
    throw new Error(
      'AppShell.Body.Sidebar requires AppShell.Body layout="regions"',
    );
  }

  let accessibleLabel = $derived(
    label ?? (side === "left" ? "Left body sidebar" : "Right body sidebar"),
  );
</script>

<aside
  bind:this={ref}
  {...restProps}
  class={["ui-minimal-app-shell__body-sidebar", className]
    .filter(Boolean)
    .join(" ")}
  data-ui-component="app-shell"
  data-ui-part="body-sidebar"
  data-side={side}
  aria-label={accessibleLabel}
>
  <ScrollArea
    type="auto"
    class="ui-minimal-app-shell__body-sidebar-scroll-area"
  >
    {@render children?.()}
  </ScrollArea>
</aside>
