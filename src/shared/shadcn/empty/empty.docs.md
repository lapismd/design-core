<!-- Adapted from https://shadcn-svelte.com/docs/components/empty.md for the @stevejuma/ui native-CSS catalog. -->

# Empty

Use the Empty component to display an empty state.

## [Usage](#usage)

```svelte
<script lang="ts">
  import * as Empty from "@stevejuma/ui/shadcn/empty";
  import FolderCodeIcon from "@lucide/svelte/icons/folder-code";
</script>
```

```svelte
<Empty.Root>
  <Empty.Header>
    <Empty.Media variant="icon">
      <FolderCodeIcon />
    </Empty.Media>
    <Empty.Title>No data</Empty.Title>
    <Empty.Description>No data found</Empty.Description>
  </Empty.Header>
  <Empty.Content>
    <Button>Add data</Button>
  </Empty.Content>
</Empty.Root>
```

## [Examples](#examples)

### [Outline](#outline)

Use the `border` utility class to create an outline empty state.

### [Background](#background)

Use the `bg-*` and `bg-gradient-*` utilities to add a background to the empty state.

### [Avatar](#avatar)

Use the `EmptyMedia` component to display an avatar in the empty state.

### [Avatar Group](#avatar-group)

Use the `EmptyMedia` component to display an avatar group in the empty state.

### [InputGroup](#inputgroup)

You can add an `InputGroup` component to the `EmptyContent` component.
