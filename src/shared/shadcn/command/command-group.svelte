<script lang="ts">
  import { Command as CommandPrimitive, useId } from "bits-ui";

  let {
    ref = $bindable(null),
    class: className,
    children,
    heading,
    value,
    ...restProps
  }: CommandPrimitive.GroupProps & {
    heading?: string;
  } = $props();
</script>

<CommandPrimitive.Group
  bind:ref
  data-ui-component="command"
  data-ui-part="command-group"
  data-slot="command-group"
  class={className}
  value={value ?? heading ?? `----${useId()}`}
  {...restProps}
>
  {#if heading}
    <CommandPrimitive.GroupHeading
      data-ui-component="command"
      data-ui-part="command-group-heading"
      data-slot="command-group-heading"
    >
      {heading}
    </CommandPrimitive.GroupHeading>
  {/if}
  <CommandPrimitive.GroupItems {children} />
</CommandPrimitive.Group>
