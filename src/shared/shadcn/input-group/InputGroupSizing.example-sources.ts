export const ButtonSizes = `<script lang="ts">
  import * as InputGroup from "@lapismd/design-core/shadcn/input-group";
  import XIcon from "@lucide/svelte/icons/x";
  let search = $state("Search text");
</script>

<InputGroup.Root>
  <InputGroup.Input aria-label="Search" bind:value={search} />
  <InputGroup.Addon align="inline-end">
    <InputGroup.Button
      size="icon-sm"
      variant="secondary"
      aria-label="Clear search"
      onclick={() => (search = "")}
    ><XIcon aria-hidden="true" /></InputGroup.Button>
  </InputGroup.Addon>
</InputGroup.Root>`;
