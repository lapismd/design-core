## Installation

```bash
pnpm ui:add skeleton
```

## Usage

```html
<script lang="ts">
  import { Skeleton } from "@stevejuma/ui/shadcn/skeleton";
</script>
```

```html
<Skeleton class="h-[20px] w-[100px] rounded-full" />
```

## Examples

## Card


```html
<script lang="ts">
	import { Skeleton } from "@stevejuma/ui/shadcn/skeleton";
</script>

<div class="flex flex-col space-y-3">
	<Skeleton class="h-[125px] w-[250px] rounded-xl" />
	<div class="space-y-2">
		<Skeleton class="h-4 w-[250px]" />
		<Skeleton class="h-4 w-[200px]" />
	</div>
</div>
```
