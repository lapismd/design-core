<script lang="ts">
  import type { ComponentProps } from "svelte";
  import { Command as CommandPrimitive, useId } from "bits-ui";
  import * as Command from "../command/index.js";

  let {
    ref = $bindable(null),
    role,
    children,
    child,
    heading,
    value,
    ...props
  }: ComponentProps<typeof Command.Group> = $props();
</script>

{#if role || child}
  <CommandPrimitive.Group
    bind:ref
    value={value ?? heading ?? `----${useId()}`}
    {...props}
  >
    {#snippet child({ props: primitiveProps })}
      {#if child}
        {@render child({
          props: { ...primitiveProps, role: role ?? primitiveProps.role },
        })}
      {:else}
        <div
          {...primitiveProps}
          {role}
          data-ui-component="command"
          data-ui-part="command-group"
          data-slot="command-group"
        >
          {@render children?.()}
        </div>
      {/if}
    {/snippet}
  </CommandPrimitive.Group>
{:else}
  <Command.Group bind:ref {heading} {value} {...props}
    >{@render children?.()}</Command.Group
  >
{/if}
