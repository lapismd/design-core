---
title: Dropdown Menu
description: Displays a menu to the user.
component: true
---

<script>
	import ComponentPreview from "$lib/components/component-preview.svelte";
</script>

<ComponentPreview name="dropdown-menu-demo">

<div></div>

</ComponentPreview>

## Examples

### Dialog

This example shows how to open a dialog from a dropdown menu.

```svelte
<DropdownMenu.Root>
  <DropdownMenu.Trigger>Actions</DropdownMenu.Trigger>
</DropdownMenu.Root>
```

<ComponentPreview name="dropdown-menu-dialog">

<div></div>

</ComponentPreview>
