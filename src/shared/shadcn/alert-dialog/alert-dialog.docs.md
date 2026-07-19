<!-- Adapted from https://shadcn-svelte.com/docs/components/alert-dialog.md for the @stevejuma/ui native-CSS catalog. -->

# Alert Dialog

A modal dialog that interrupts the user with important content and expects a response.

## [Usage](#usage)

```svelte
<script lang="ts">
  import * as AlertDialog from "@stevejuma/ui/shadcn/alert-dialog";
</script>
```

```svelte
<AlertDialog.Root>
  <AlertDialog.Trigger>Open</AlertDialog.Trigger>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
      <AlertDialog.Description>
        This action cannot be undone. This will permanently delete your account
        and remove your data from our servers.
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
      <AlertDialog.Action>Continue</AlertDialog.Action>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
```
