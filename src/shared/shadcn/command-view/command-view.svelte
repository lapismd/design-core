<script lang="ts">
  import "./command-view.css";
  import { Command as CommandPrimitive } from "bits-ui";
  import * as Command from "../command/index.js";
  import type { CommandRootApi } from "../command/command.svelte";

  let {
    api = $bindable(null),
    ref = $bindable(null),
    value = $bindable(""),
    shouldFilter = true,
    class: className,
    children,
    ...restProps
  }: CommandPrimitive.RootProps & {
    api?: CommandRootApi | null;
  } = $props();
</script>

<div
  data-ui-component="command-view"
  data-ui-part="root"
  data-slot="command-view"
  class={className}
>
  <Command.Root
    bind:this={api}
    bind:value
    bind:ref
    {shouldFilter}
    {...restProps}
  >
    {@render children?.()}
  </Command.Root>
</div>
