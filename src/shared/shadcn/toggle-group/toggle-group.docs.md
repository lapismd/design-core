<!-- Adapted from https://shadcn-svelte.com/docs/components/toggle-group.md for the @stevejuma/ui native-CSS catalog. -->

# Toggle Group

A set of two-state buttons that can be toggled on or off.

## [Usage](#usage)

```svelte
<script lang="ts">
  import * as ToggleGroup from "@stevejuma/ui/shadcn/toggle-group";
</script>
```

```svelte
<ToggleGroup.Root type="single">
  <ToggleGroup.Item value="a">A</ToggleGroup.Item>
  <ToggleGroup.Item value="b">B</ToggleGroup.Item>
  <ToggleGroup.Item value="c">C</ToggleGroup.Item>
</ToggleGroup.Root>
```

## [Examples](#examples)

### [Outline](#outline)

### [Single](#single)

### [Small](#small)

### [Large](#large)

### [Disabled](#disabled)

### [Spacing](#spacing)

Use `spacing={2}` to add spacing between toggle group items.
