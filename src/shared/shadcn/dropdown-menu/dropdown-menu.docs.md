<!-- Adapted from https://shadcn-svelte.com/docs/components/dropdown-menu.md for the @stevejuma/ui native-CSS catalog. -->

# Dropdown Menu

Displays a menu to the user  such as a set of actions or functions  triggered by a button.

## [Usage](#usage)

```svelte
<script lang="ts">
  import * as DropdownMenu from "@stevejuma/ui/shadcn/dropdown-menu";
</script>
```

```svelte
<DropdownMenu.Root>
  <DropdownMenu.Trigger>Open</DropdownMenu.Trigger>
  <DropdownMenu.Content>
    <DropdownMenu.Group>
      <DropdownMenu.Label>My Account</DropdownMenu.Label>
      <DropdownMenu.Separator />
      <DropdownMenu.Item>Profile</DropdownMenu.Item>
      <DropdownMenu.Item>Billing</DropdownMenu.Item>
      <DropdownMenu.Item>Team</DropdownMenu.Item>
      <DropdownMenu.Item>Subscription</DropdownMenu.Item>
    </DropdownMenu.Group>
  </DropdownMenu.Content>
</DropdownMenu.Root>
```

## [Examples](#examples)

### [Checkboxes](#checkboxes)

### [Radio Group](#radio-group)

### [Dialog](#dialog)

This example shows how to open a dialog from a dropdown menu.

## [Changelog](#changelog)

### [2024-10-30 Classes for DropdownMenu.SubTrigger](#2024-10-30-classes-for-dropdownmenusubtrigger)

- Added `gap-2 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0` to the `<DropdownMenu.SubTrigger>` to automatically style icon inside the dropdown menu sub trigger.
- Removed `size-4` from the icon inside the `<DropdownMenu.SubTrigger>` since it is now handled by the parent `<DropdownMenu.SubTrigger>` .
