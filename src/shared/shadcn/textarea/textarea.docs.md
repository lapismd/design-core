<!-- Adapted from https://github.com/huntabyte/shadcn-svelte/blob/bf4f461d88526359d0e96e1950f637912bbeebe7/docs/content/components/textarea.md for the @stevejuma/ui native-CSS catalog. -->

# Textarea

Displays a form textarea or a component that looks like a textarea.

## Installation

```bash
pnpm ui:add textarea
```

## Usage

```html
<script lang="ts">
  import { Textarea } from "@stevejuma/ui/shadcn/textarea";
</script>
```

```html
<textarea />
```

## Examples

### Default

```html
<script lang="ts">
  import { Textarea } from "@stevejuma/ui/shadcn/textarea";
</script>

<textarea placeholder="Type your message here." />
```

### Disabled

```html
<script lang="ts">
  import { Textarea } from "@stevejuma/ui/shadcn/textarea";
</script>

<textarea disabled placeholder="Type your message here." />
```

### With Label

```html
<script lang="ts">
  import { Label } from "@stevejuma/ui/shadcn/label";
  import { Textarea } from "@stevejuma/ui/shadcn/textarea";
</script>

<div class="grid w-full gap-1.5">
  <label for="message">Your message</label>
  <textarea placeholder="Type your message here." id="message" />
</div>
```

### With Text

```html
<script lang="ts">
  import { Label } from "@stevejuma/ui/shadcn/label";
  import { Textarea } from "@stevejuma/ui/shadcn/textarea";
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
  import { Button } from "@stevejuma/ui/shadcn/button";
  import { Textarea } from "@stevejuma/ui/shadcn/textarea";
</script>

<div class="grid w-full gap-2">
  <textarea placeholder="Type your message here." />
  <button>Send message</button>
</div>
```
