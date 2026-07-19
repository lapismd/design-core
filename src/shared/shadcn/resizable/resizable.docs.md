<!-- Adapted from https://shadcn-svelte.com/docs/components/resizable.md for the @stevejuma/ui native-CSS catalog. -->

# Resizable

Accessible resizable panel groups and layouts with keyboard support.

## [Usage](#usage)

```svelte
<script lang="ts">
  import * as Resizable from "@stevejuma/ui/shadcn/resizable";
</script>
```

```svelte
<Resizable.PaneGroup direction="horizontal">
  <Resizable.Pane>One</Resizable.Pane>
  <Resizable.Handle />
  <Resizable.Pane>Two</Resizable.Pane>
</Resizable.PaneGroup>
```

## [Examples](#examples)

### [Vertical](#vertical)

Use the `direction` prop to set the direction of the resizable panels.

### [Handle](#handle)

You can set or hide the handle by using the `withHandle` prop on the `ResizableHandle` component.
