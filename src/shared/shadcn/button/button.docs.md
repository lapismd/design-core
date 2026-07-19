<!-- Adapted from https://shadcn-svelte.com/docs/components/button.md for the @stevejuma/ui native-CSS catalog. -->

# Button

Displays a button or a component that looks like a button.

## [Usage](#usage)

```svelte
<script lang="ts">
  import { Button } from "@stevejuma/ui/shadcn/button";
</script>
<Button variant="outline">Button</Button>
```

## [Examples](#examples)

### [Size](#size)

### [Default](#default)

### [Outline](#outline)

### [Secondary](#secondary)

### [Ghost](#ghost)

### [Destructive](#destructive)

### [Link](#link)

### [Icon](#icon)

### [With Icon](#with-icon)

The spacing between the icon and the text is automatically adjusted based on the size of the button. You do not need any margin on the icon.

### [Rounded](#rounded)

Use the `rounded-full` class to make the button rounded.

### [Spinner](#spinner)

### [Button Group](#button-group)

To create a button group, use the `ButtonGroup` component. See the [Button Group](https://shadcn-svelte.com/docs/components/button-group) documentation for more details.

### [Link](#link-1)

You can convert the `<button>` into an `<a>` element by simply passing an `href` as a prop.

Alternatively, you can use the `buttonVariants` helper to create a link that looks like a button.

## [Changelog](#changelog)

### [2025-09-24 New sizes](#2025-09-24-new-sizes)

We have added two new sizes to the button component: `icon-sm` and `icon-lg`. These sizes are used to create icon buttons. To add them, edit `button.svelte` and add the following code under `size` in `buttonVariants`:

components/ui/button.svelte

```ts
export const buttonVariants = tv({
  // ...
  variants: {
    // ...
    size: {
      // ...
      icon: "size-9",
      "icon-sm": "size-8",
      "icon-lg": "size-10",
    },
  },
});
```
