## Installation

```bash
pnpm ui:add empty
```

## Usage

```html
<script lang="ts">
  import * as Empty from "@lapismd/design-core/shadcn/empty";
  import FolderCodeIcon from "@lucide/svelte/icons/folder-code";
</script>
```

```html
<Empty.Root>
  <Empty.Header>
    <Empty.Media variant="icon">
      <FolderCodeIcon />
    </Empty.Media>
    <Empty.Title>No data</Empty.Title>
    <Empty.Description>No data found</Empty.Description>
  </Empty.Header>
  <Empty.Content>
    <button>Add data</button>
  </Empty.Content>
</Empty.Root>
```

## Examples

### Outline

Use the `border` utility class to create an outline empty state.

```html
<script lang="ts">
  import * as Empty from "@lapismd/design-core/shadcn/empty";
  import { Button } from "@lapismd/design-core/shadcn/button";
  import CloudIcon from "@lucide/svelte/icons/cloud";
</script>

<Empty.Root class="border border-dashed">
  <Empty.Header>
    <Empty.Media variant="icon">
      <CloudIcon />
    </Empty.Media>
    <Empty.Title>Cloud Storage Empty</Empty.Title>
    <Empty.Description>
      Upload files to your cloud storage to access them anywhere.
    </Empty.Description>
  </Empty.Header>
  <Empty.Content>
    <button variant="outline" size="sm">Upload Files</button>
  </Empty.Content>
</Empty.Root>
```

### Background

Use the `bg-*` and `bg-gradient-*` utilities to add a background to the empty state.

```html
<script lang="ts">
  import * as Empty from "@lapismd/design-core/shadcn/empty";
  import { Button } from "@lapismd/design-core/shadcn/button";
  import BellIcon from "@lucide/svelte/icons/bell";
  import RefreshCcwIcon from "@lucide/svelte/icons/refresh-ccw";
</script>

<Empty.Root
  class="from-muted/50 to-background h-full bg-gradient-to-b from-30%"
>
  <Empty.Header>
    <Empty.Media variant="icon">
      <BellIcon />
    </Empty.Media>
    <Empty.Title>No Notifications</Empty.Title>
    <Empty.Description>
      You're all caught up. New notifications will appear here.
    </Empty.Description>
  </Empty.Header>
  <Empty.Content>
    <button variant="outline" size="sm">
      <RefreshCcwIcon />
      Refresh
    </button>
  </Empty.Content>
</Empty.Root>
```

### Avatar

Use the `EmptyMedia` component to display an avatar in the empty state.

### Avatar Group

Use the `EmptyMedia` component to display an avatar group in the empty state.

### InputGroup

You can add an `InputGroup` component to the `EmptyContent` component.
