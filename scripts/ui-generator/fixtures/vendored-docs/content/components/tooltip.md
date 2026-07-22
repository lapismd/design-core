---
title: Tooltip
description: A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.
component: true
---

<script>
	import ComponentPreview from "$lib/components/component-preview.svelte";
</script>

<ComponentPreview name="tooltip-demo">

<div></div>

</ComponentPreview>

## Installation

Install stuff here.

## Usage

```svelte
<script lang="ts">
  import * as Tooltip from "$lib/components/ui/tooltip/index.js";
</script>
```

```svelte
<Tooltip.Provider>
  <Tooltip.Root>
    <Tooltip.Trigger>Hover</Tooltip.Trigger>
    <Tooltip.Content>
      <p>Add to library</p>
    </Tooltip.Content>
  </Tooltip.Root>
</Tooltip.Provider>
```

### Nested Providers

You can nest providers. This fence is prose-only (no ComponentPreview):

```svelte
<Tooltip.Provider delayDuration={0}></Tooltip.Provider>
```
