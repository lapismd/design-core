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
<Textarea />
```

## Examples

### Default


```html
<script lang="ts">
	import { Textarea } from "@stevejuma/ui/shadcn/textarea";
</script>

<Textarea placeholder="Type your message here." />
```

### Disabled


```html
<script lang="ts">
	import { Textarea } from "@stevejuma/ui/shadcn/textarea";
</script>

<Textarea disabled placeholder="Type your message here." />
```

### With Label


```html
<script lang="ts">
	import { Label } from "@stevejuma/ui/shadcn/label";
	import { Textarea } from "@stevejuma/ui/shadcn/textarea";
</script>

<div class="grid w-full gap-1.5">
	<Label for="message">Your message</Label>
	<Textarea placeholder="Type your message here." id="message" />
</div>
```

### With Text


```html
<script lang="ts">
	import { Label } from "@stevejuma/ui/shadcn/label";
	import { Textarea } from "@stevejuma/ui/shadcn/textarea";
</script>

<div class="grid w-full gap-1.5">
	<Label for="message-2">Your Message</Label>
	<Textarea placeholder="Type your message here." id="message-2" />
	<p class="text-muted-foreground text-sm">Your message will be copied to the support team.</p>
</div>
```

### With Button


```html
<script lang="ts">
	import { Button } from "@stevejuma/ui/shadcn/button";
	import { Textarea } from "@stevejuma/ui/shadcn/textarea";
</script>

<div class="grid w-full gap-2">
	<Textarea placeholder="Type your message here." />
	<Button>Send message</Button>
</div>
```
