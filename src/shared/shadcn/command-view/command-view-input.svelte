<script lang="ts">
  import { Command as CommandPrimitive } from "bits-ui";
  import type { Snippet } from "svelte";
  import SearchIcon from "@lucide/svelte/icons/search";
  import * as InputGroup from "../input-group/index.js";

  let {
    ref = $bindable(null),
    class: className,
    value = $bindable(""),
    start,
    ...restProps
  }: CommandPrimitive.InputProps & {
    start?: Snippet;
  } = $props();
</script>

<div
  data-ui-component="command-view"
  data-ui-part="input-wrapper"
  data-slot="command-view-input-wrapper"
>
  <InputGroup.Root>
    <InputGroup.Addon>
      {#if start}
        {@render start()}
      {:else}
        <SearchIcon
          data-ui-component="command-view"
          data-ui-part="search-icon"
          data-slot="command-view-search-icon"
        />
      {/if}
    </InputGroup.Addon>
    <CommandPrimitive.Input {value} class={className} {...restProps}>
      {#snippet child({ props })}
        <InputGroup.Input {...props} bind:value bind:ref />
      {/snippet}
    </CommandPrimitive.Input>
  </InputGroup.Root>
</div>
