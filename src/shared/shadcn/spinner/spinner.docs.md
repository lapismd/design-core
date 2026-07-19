<!-- Adapted from https://shadcn-svelte.com/docs/components/spinner.md for the @stevejuma/ui native-CSS catalog. -->

# Spinner

An indicator that can be used to show a loading state.

## [Usage](#usage)

```svelte
<script lang="ts">
  import { Spinner } from "@stevejuma/ui/shadcn/spinner";
</script>
```

```svelte
<Spinner />
```

## [Customization](#customization)

You can replace the default spinner icon with any other icon by editing the `Spinner` component.

```svelte
<script lang="ts">
  import { cn } from "../../../../lib/utils.js";
  import LoaderIcon from "@lucide/svelte/icons/loader";
  import type { ComponentProps } from "svelte";
  type Props = ComponentProps<typeof LoaderIcon>;
  let { class: className, ...restProps }: Props = $props();
</script>
<LoaderIcon
  role="status"
  aria-label="Loading"
  class={cn("size-4 animate-spin", className)}
  {...restProps}
/>
```
## [Examples](#examples)

### [Size](#size)

Use the `size-*` utility class to change the size of the spinner.

### [Color](#color)

Use the `text-*` utility class to change the color of the spinner.

### [Button](#button)

Add a spinner to a button to indicate a loading state. The `<Button />` will handle the spacing between the spinner and the text.

### [Badge](#badge)

You can also use a spinner inside a badge.

### [Input Group](#input-group)

Input Group can have spinners inside `<InputGroup.Addon>`.

### [Empty](#empty)

### [Item](#item)

Use the spinner inside `<Item.Media>` to indicate a loading state.
