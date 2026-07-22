<!-- Adapted from https://github.com/huntabyte/shadcn-svelte/blob/bf4f461d88526359d0e96e1950f637912bbeebe7/docs/content/components/spinner.md for the @stevejuma/ui native-CSS catalog. -->

# Spinner

An indicator that can be used to show a loading state.

## Installation

```bash
pnpm ui:add spinner
```

## Usage

```html
<script lang="ts">
  import { Spinner } from "@stevejuma/ui/shadcn/spinner";
</script>
```

```html
<Spinner />
```

## Customization

You can replace the default spinner icon with any other icon by editing the `Spinner` component.

```html
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

## Examples

### Size

Use the `size-*` utility class to change the size of the spinner.

```html
<script lang="ts">
  import { Spinner } from "@stevejuma/ui/shadcn/spinner";
</script>

<div class="flex items-center gap-6">
  <Spinner class="size-3" />
  <Spinner class="size-4" />
  <Spinner class="size-6" />
  <Spinner class="size-8" />
</div>
```

### Color

Use the `text-*` utility class to change the color of the spinner.

```html
<script lang="ts">
  import { Spinner } from "@stevejuma/ui/shadcn/spinner";
</script>

<div class="flex items-center gap-6">
  <Spinner class="size-6 text-red-500" />
  <Spinner class="size-6 text-green-500" />
  <Spinner class="size-6 text-blue-500" />
  <Spinner class="size-6 text-yellow-500" />
  <Spinner class="size-6 text-purple-500" />
</div>
```

### Button

Add a spinner to a button to indicate a loading state. The `<Button />` will handle the spacing between the spinner and the text.

```html
<script lang="ts">
  import { Button } from "@stevejuma/ui/shadcn/button";
  import { Spinner } from "@stevejuma/ui/shadcn/spinner";
</script>

<div class="flex flex-col items-center gap-4">
  <button disabled size="sm">
    <Spinner />
    Loading...
  </button>
  <button variant="outline" disabled size="sm">
    <Spinner />
    Please wait
  </button>
  <button variant="secondary" disabled size="sm">
    <Spinner />
    Processing
  </button>
</div>
```

### Badge

You can also use a spinner inside a badge.

```html
<script lang="ts">
  import { Badge } from "@stevejuma/ui/shadcn/badge";
  import { Spinner } from "@stevejuma/ui/shadcn/spinner";
</script>

<div class="flex items-center gap-2">
  <Badge>
    <Spinner />
    Syncing
  </Badge>
  <Badge variant="secondary">
    <Spinner />
    Updating
  </Badge>
  <Badge variant="outline">
    <Spinner />
    Loading
  </Badge>
</div>
```

### Input Group

Input Group can have spinners inside `<InputGroup.Addon>`.

```html
<script lang="ts">
  import * as InputGroup from "@stevejuma/ui/shadcn/input-group";
  import { Spinner } from "@stevejuma/ui/shadcn/spinner";
  import ArrowUpIcon from "@lucide/svelte/icons/arrow-up";
</script>

<div class="flex w-full max-w-md flex-col gap-4">
  <InputGroup.Root>
    <InputGroup.Input placeholder="Send a message..." disabled />
    <InputGroup.Addon align="inline-end">
      <Spinner />
    </InputGroup.Addon>
  </InputGroup.Root>
  <InputGroup.Root>
    <InputGroup.Textarea placeholder="Send a message..." disabled />
    <InputGroup.Addon align="block-end">
      <Spinner /> Validating...
      <InputGroup.Button class="ms-auto" variant="default">
        <ArrowUpIcon />
        <span class="sr-only">Send</span>
      </InputGroup.Button>
    </InputGroup.Addon>
  </InputGroup.Root>
</div>
```

### Empty

```html
<script lang="ts">
  import * as Empty from "@stevejuma/ui/shadcn/empty";
  import { Spinner } from "@stevejuma/ui/shadcn/spinner";
  import { Button } from "@stevejuma/ui/shadcn/button";
</script>

<Empty.Root class="w-full border md:p-6">
  <Empty.Header>
    <Empty.Media variant="icon">
      <Spinner />
    </Empty.Media>
    <Empty.Title>Processing your request</Empty.Title>
    <Empty.Description>
      Please wait while we process your request. Do not refresh the page.
    </Empty.Description>
  </Empty.Header>
  <Empty.Content>
    <button variant="outline" size="sm">Cancel</button>
  </Empty.Content>
</Empty.Root>
```

### Item

Use the spinner inside `<Item.Media>` to indicate a loading state.
