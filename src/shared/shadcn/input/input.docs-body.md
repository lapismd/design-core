## Installation

```bash
pnpm ui:add input
```

## Usage

```html
<script lang="ts">
  import { Input } from "@stevejuma/ui/shadcn/input";
</script>
```

```html
<Input />
```

## Examples

### Default


```html
<script lang="ts">
	import { Input } from "@stevejuma/ui/shadcn/input";
</script>

<Input type="email" placeholder="Email" class="max-w-xs" />
```

### File


```html
<script lang="ts">
	import { Input } from "@stevejuma/ui/shadcn/input";
	import { Label } from "@stevejuma/ui/shadcn/label";
</script>

<div class="grid w-full max-w-sm items-center gap-1.5">
	<Label for="picture">Picture</Label>
	<Input id="picture" type="file" />
</div>
```

### Disabled


```html
<script lang="ts">
	import { Input } from "@stevejuma/ui/shadcn/input";
</script>

<Input disabled type="email" placeholder="Email" class="max-w-sm" />
```

### With Label


```html
<script lang="ts">
	import { Input } from "@stevejuma/ui/shadcn/input";
	import { Label } from "@stevejuma/ui/shadcn/label";

	const id = $props.id();
</script>

<div class="flex w-full max-w-sm flex-col gap-1.5">
	<Label for="email-{id}">Email</Label>
	<Input type="email" id="email-{id}" placeholder="Email" />
</div>
```

### With Button


```html
<script lang="ts">
	import { Button } from "@stevejuma/ui/shadcn/button";
	import { Input } from "@stevejuma/ui/shadcn/input";
</script>

<div class="flex w-full max-w-sm items-center gap-2">
	<Input type="email" placeholder="Email" />
	<Button type="submit" variant="outline">Subscribe</Button>
</div>
```
