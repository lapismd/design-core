<!-- Adapted from https://shadcn-svelte.com/docs/components/dialog.md for the @stevejuma/ui native-CSS catalog. -->

# Dialog

A window overlaid on either the primary window or another dialog window, rendering the content underneath inert.

## [Usage](#usage)

```svelte
<script lang="ts">
  import * as Dialog from "@stevejuma/ui/shadcn/dialog";
</script>
```

```svelte
<Dialog.Root>
  <Dialog.Trigger>Open</Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Are you sure absolutely sure?</Dialog.Title>
      <Dialog.Description>
        This action cannot be undone. This will permanently delete your account
        and remove your data from our servers.
      </Dialog.Description>
    </Dialog.Header>
  </Dialog.Content>
</Dialog.Root>
```

## [Examples](#examples)

### [Custom close button](#custom-close-button)
