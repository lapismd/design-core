<script lang="ts">
  import { buttonVariants } from "$lib/registry/ui/button/index.js";
  import * as Dialog from "$lib/registry/ui/dialog/index.js";
  import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";

  let open = $state(false);
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger class={buttonVariants({ variant: "outline" })}>
    Actions
  </DropdownMenu.Trigger>
  <DropdownMenu.Content>
    <DropdownMenu.Item onSelect={() => (open = true)}>New…</DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>

<Dialog.Root bind:open>
  <Dialog.Content>
    <Dialog.Title>Create</Dialog.Title>
  </Dialog.Content>
</Dialog.Root>
