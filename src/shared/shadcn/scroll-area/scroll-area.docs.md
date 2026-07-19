<!-- Adapted from https://shadcn-svelte.com/docs/components/scroll-area.md for the @stevejuma/ui native-CSS catalog. -->

# Scroll Area

Augments native scroll functionality for custom, cross-browser styling.

## [Usage](#usage)

```svelte
<script lang="ts">
  import { ScrollArea } from "@stevejuma/ui/shadcn/scroll-area";
</script>
```

```svelte
<ScrollArea class="h-[200px] w-[350px] rounded-md border p-4">
  Jokester began sneaking into the castle in the middle of the night and
  leaving jokes all over the place: under the king's pillow, in his soup, even
  in the royal toilet. The king was furious, but he couldn't seem to stop
  Jokester. And then, one day, the people of the kingdom discovered that the
  jokes left by Jokester were so funny that they couldn't help but laugh. And
  once they started laughing, they couldn't stop.
</ScrollArea>
```

## [Examples](#examples)

### [Horizontal Scrolling](#horizontal-scrolling)

Set the `orientation` prop to `"horizontal"` to enable horizontal scrolling.
