<!-- Adapted from https://shadcn-svelte.com/docs/components/input-group.md for the @stevejuma/ui native-CSS catalog. -->

# Input Group

Display additional information or actions to an input or textarea.

## [Usage](#usage)

```svelte
<script lang="ts">
  import * as InputGroup from "@stevejuma/ui/shadcn/input-group";
  import SearchIcon from "@lucide/svelte/icons/search";
</script>
```

```svelte
<InputGroup.Root>
  <InputGroup.Input placeholder="Search..." />
  <InputGroup.Addon>
    <SearchIcon />
  </InputGroup.Addon>
  <InputGroup.Addon align="inline-end">
    <InputGroup.Button>Search</InputGroup.Button>
  </InputGroup.Addon>
</InputGroup.Root>
```

## [Examples](#examples)

### [Icon](#icon)

### [Text](#text)

Display additional text information alongside inputs.

### [Button](#button)

Add buttons to perform actions within the input group.

### [Tooltip](#tooltip)

Add tooltips to provide additional context or help.

### [Textarea](#textarea)

Input groups also work with textarea components. Use `block-start` or `block-end` for alignment.

### [Spinner](#spinner)

Show loading indicators while processing input.

### [Label](#label)

Add labels within input groups to improve accessibility.

### [Dropdown](#dropdown)

Pair input groups with dropdown menus for complex interactions.

### [Button Group](#button-group)

Wrap input groups with button groups to create prefixes and suffixes.

### [Custom Input](#custom-input)

Add the `data-slot="input-group-control"` attribute to your custom input for automatic behavior and focus state handling.

No style is applied to the custom input. Apply your own styles using the `class` prop.
