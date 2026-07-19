<!-- Adapted from https://shadcn-svelte.com/docs/components/command.md for the @stevejuma/ui native-CSS catalog. -->

# Command

Fast, composable, unstyled command menu for Svelte.

## [Usage](#usage)

```svelte
<script lang="ts">
  import * as Command from "@stevejuma/ui/shadcn/command";
</script>
```

```svelte
<Command.Root>
  <Command.Input placeholder="Type a command or search..." />
  <Command.List>
    <Command.Empty>No results found.</Command.Empty>
    <Command.Group heading="Suggestions">
      <Command.Item>Calendar</Command.Item>
      <Command.Item>Search Emoji</Command.Item>
      <Command.Item>Calculator</Command.Item>
    </Command.Group>
    <Command.Separator />
    <Command.Group heading="Settings">
      <Command.Item>Profile</Command.Item>
      <Command.Item>Billing</Command.Item>
      <Command.Item>Settings</Command.Item>
    </Command.Group>
  </Command.List>
</Command.Root>
```

## [Examples](#examples)

### [Dialog](#dialog)

To show the command menu in a dialog, use the `<Command.Dialog />` component instead of `<Command.Root />`. It accepts props for both the `<Dialog.Root />` and `<Command.Root />` components.

lib/components/example-command-menu.svelte

### [Combobox](#combobox)

You can use the `<Command />` component as a combobox. See the [Combobox](https://shadcn-svelte.com/docs/components/combobox) page for more information.

## [Changelog](#changelog)

### [2024-10-30 Classes for icons](#2024-10-30-classes-for-icons)

- Added `gap-2 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0` to the `<Command.Item>` component to automatically style the icons inside.
