<script lang="ts">
  import { buttonVariants } from "$lib/registry/ui/button/index.js";
  import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger class={buttonVariants({ variant: "outline" })}
    >Open</DropdownMenu.Trigger
  >
  <DropdownMenu.Content>
    <DropdownMenu.Item>Profile</DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>
