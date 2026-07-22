## Installation

```bash
pnpm ui:add toggle
```

## Usage

```html
<script lang="ts">
  import { Toggle } from "@stevejuma/ui/shadcn/toggle";
</script>
```

```html
<Toggle>Toggle</Toggle>
```

## Examples

### Default

```html
<script lang="ts">
  import BookmarkIcon from "@lucide/svelte/icons/bookmark";
  import { Toggle } from "@stevejuma/ui/shadcn/toggle";
</script>

<Toggle
  aria-label="Toggle bookmark"
  size="sm"
  variant="outline"
  class="data-[state=on]:bg-transparent data-[state=on]:*:[svg]:fill-blue-500 data-[state=on]:*:[svg]:stroke-blue-500"
>
  <BookmarkIcon />
  Bookmark
</Toggle>
```

### Outline

```html
<script lang="ts">
  import ItalicIcon from "@lucide/svelte/icons/italic";
  import { Toggle } from "@stevejuma/ui/shadcn/toggle";
</script>

<Toggle variant="outline" aria-label="Toggle italic">
  <ItalicIcon class="size-4" />
</Toggle>
```

### With Text

```html
<script lang="ts">
  import ItalicIcon from "@lucide/svelte/icons/italic";
  import { Toggle } from "@stevejuma/ui/shadcn/toggle";
</script>

<Toggle aria-label="Toggle italic">
  <ItalicIcon class="me-2 size-4" />
  Italic
</Toggle>
```

### Small

```html
<script lang="ts">
  import ItalicIcon from "@lucide/svelte/icons/italic";
  import { Toggle } from "@stevejuma/ui/shadcn/toggle";
</script>

<Toggle size="sm" aria-label="Toggle italic">
  <ItalicIcon class="size-4" />
</Toggle>
```

### Large

```html
<script lang="ts">
  import ItalicIcon from "@lucide/svelte/icons/italic";
  import { Toggle } from "@stevejuma/ui/shadcn/toggle";
</script>

<Toggle size="lg" aria-label="Toggle italic">
  <ItalicIcon class="size-4" />
</Toggle>
```

### Disabled

```html
<script lang="ts">
  import UnderlineIcon from "@lucide/svelte/icons/underline";
  import { Toggle } from "@stevejuma/ui/shadcn/toggle";
</script>

<Toggle aria-label="Toggle underline" disabled>
  <UnderlineIcon class="size-4" />
</Toggle>
```
