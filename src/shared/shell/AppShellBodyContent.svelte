<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import type { WithElementRef } from "../../lib/utils.js";
  import { ScrollArea } from "../shadcn/scroll-area/index.js";
  import { useAppShell } from "./app-shell-context.svelte.js";
  import { useAppShellBody } from "./app-shell-body-context.svelte.js";

  let {
    ref = $bindable(null),
    label,
    class: className,
    children,
    ...restProps
  }: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
    /** Optional accessible name for this independently scrolling region. */
    label?: string;
  } = $props();

  useAppShell();
  const body = useAppShellBody();

  if (body.layout !== "regions") {
    throw new Error(
      'AppShell.Body.Content requires AppShell.Body layout="regions"',
    );
  }
</script>

<div
  bind:this={ref}
  {...restProps}
  class={["ui-minimal-app-shell__body-content", className]
    .filter(Boolean)
    .join(" ")}
  data-ui-component="app-shell"
  data-ui-part="body-content"
  role={label ? "region" : undefined}
  aria-label={label}
>
  <ScrollArea
    type="auto"
    class="ui-minimal-app-shell__body-content-scroll-area"
  >
    {@render children?.()}
  </ScrollArea>
</div>
