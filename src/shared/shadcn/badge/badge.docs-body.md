## Installation

```bash
pnpm ui:add badge
```

## Usage

```html
<script lang="ts">
  import { Badge } from "@stevejuma/ui/shadcn/badge";
</script>
```

```html
<Badge variant="outline">Badge</Badge>
```

### Link

You can use the `badgeVariants` helper to create a link that looks like a badge.

```html
<script lang="ts">
  import { badgeVariants } from "@stevejuma/ui/shadcn/badge";
</script>

<a href="/dashboard" class={badgeVariants({ variant: "outline" })}>Badge</a>
```
