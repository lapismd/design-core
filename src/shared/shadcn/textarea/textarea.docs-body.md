## Installation

```bash
pnpm ui:add textarea
```

## Usage

```html
<script lang="ts">
  import { Textarea } from "@lapismd/design-core/shadcn/textarea";
</script>
```

```html
<textarea />
```

## Examples

### Default

```html
<script lang="ts">
  import { Textarea } from "@lapismd/design-core/shadcn/textarea";
</script>

<textarea placeholder="Type your message here." />
```

### Disabled

```html
<script lang="ts">
  import { Textarea } from "@lapismd/design-core/shadcn/textarea";
</script>

<textarea disabled placeholder="Type your message here." />
```

### With Label

```html
<script lang="ts">
  import { Label } from "@lapismd/design-core/shadcn/label";
  import { Textarea } from "@lapismd/design-core/shadcn/textarea";
</script>

<div class="grid w-full gap-1.5">
  <label for="message">Your message</label>
  <textarea placeholder="Type your message here." id="message" />
</div>
```

### With Text

```html
<script lang="ts">
  import { Label } from "@lapismd/design-core/shadcn/label";
  import { Textarea } from "@lapismd/design-core/shadcn/textarea";
</script>

<div class="grid w-full gap-1.5">
  <label for="message-2">Your Message</label>
  <textarea placeholder="Type your message here." id="message-2" />
  <p class="text-muted-foreground text-sm">
    Your message will be copied to the support team.
  </p>
</div>
```

### With Button

```html
<script lang="ts">
  import { Button } from "@lapismd/design-core/shadcn/button";
  import { Textarea } from "@lapismd/design-core/shadcn/textarea";
</script>

<div class="grid w-full gap-2">
  <textarea placeholder="Type your message here." />
  <button>Send message</button>
</div>
```
