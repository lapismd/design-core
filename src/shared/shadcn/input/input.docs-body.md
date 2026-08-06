## Installation

```bash
pnpm ui:add input
```

## Usage

```html
<script lang="ts">
  import { Input } from "@lapismd/design-core/shadcn/input";
</script>
```

```html
<input />
```

## Examples

### Default

```html
<script lang="ts">
  import { Input } from "@lapismd/design-core/shadcn/input";
</script>

<input type="email" placeholder="Email" class="max-w-xs" />
```

### File

```html
<script lang="ts">
  import { Input } from "@lapismd/design-core/shadcn/input";
  import { Label } from "@lapismd/design-core/shadcn/label";
</script>

<div class="grid w-full max-w-sm items-center gap-1.5">
  <label for="picture">Picture</label>
  <input id="picture" type="file" />
</div>
```

### Disabled

```html
<script lang="ts">
  import { Input } from "@lapismd/design-core/shadcn/input";
</script>

<input disabled type="email" placeholder="Email" class="max-w-sm" />
```

### With Label

```html
<script lang="ts">
  import { Input } from "@lapismd/design-core/shadcn/input";
  import { Label } from "@lapismd/design-core/shadcn/label";

  const id = $props.id();
</script>

<div class="flex w-full max-w-sm flex-col gap-1.5">
  <label for="email-{id}">Email</label>
  <input type="email" id="email-{id}" placeholder="Email" />
</div>
```

### With Button

```html
<script lang="ts">
  import { Button } from "@lapismd/design-core/shadcn/button";
  import { Input } from "@lapismd/design-core/shadcn/input";
</script>

<div class="flex w-full max-w-sm items-center gap-2">
  <input type="email" placeholder="Email" />
  <button type="submit" variant="outline">Subscribe</button>
</div>
```
