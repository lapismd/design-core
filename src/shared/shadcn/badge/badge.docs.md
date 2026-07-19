<!-- Adapted from https://shadcn-svelte.com/docs/components/badge.md for the @stevejuma/ui native-CSS catalog. -->

# Badge

Displays a badge or a component that looks like a badge.

## [Usage](#usage)

```svelte
<script lang="ts">
  import { Badge } from "@stevejuma/ui/shadcn/badge";
</script>
```

```svelte
<Badge variant="outline">Badge</Badge>
```

### [Link](#link)

You can use the `badgeVariants` helper to create a link that looks like a badge.

```svelte
<script lang="ts">
  import { badgeVariants } from "@stevejuma/ui/shadcn/badge";
</script>
<a href="/dashboard" class={badgeVariants({ variant: "outline" })}>Badge</a>
```
