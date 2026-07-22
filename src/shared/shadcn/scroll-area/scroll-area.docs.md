<!-- Adapted from https://github.com/huntabyte/shadcn-svelte/blob/bf4f461d88526359d0e96e1950f637912bbeebe7/docs/content/components/scroll-area.md for the @stevejuma/ui native-CSS catalog. -->

# Scroll Area

Augments native scroll functionality for custom, cross-browser styling.

## Installation

```bash
pnpm ui:add scroll-area
```

## Usage

```html
<script lang="ts">
  import { ScrollArea } from "@stevejuma/ui/shadcn/scroll-area";
</script>
```

```html
<ScrollArea class="h-[200px] w-[350px] rounded-md border p-4">
  Jokester began sneaking into the castle in the middle of the night and
  leaving jokes all over the place: under the king's pillow, in his soup, even
  in the royal toilet. The king was furious, but he couldn't seem to stop
  Jokester. And then, one day, the people of the kingdom discovered that the
  jokes left by Jokester were so funny that they couldn't help but laugh. And
  once they started laughing, they couldn't stop.
</ScrollArea>
```

## Examples

### Horizontal Scrolling

Set the `orientation` prop to `"horizontal"` to enable horizontal scrolling.

```html
<script lang="ts">
	import { ScrollArea } from "@stevejuma/ui/shadcn/scroll-area";

	type Artwork = {
		artist: string;
		art: string;
	};

	const works: Artwork[] = [
		{
			artist: "Ornella Binni",
			art: "https://images.unsplash.com/photo-1465869185982-5a1a7522cbcb?auto=format&fit=crop&w=300&q=80",
		},
		{
			artist: "Tom Byrom",
			art: "https://images.unsplash.com/photo-1548516173-3cabfa4607e9?auto=format&fit=crop&w=300&q=80",
		},
		{
			artist: "Vladimir Malyavko",
			art: "https://images.unsplash.com/photo-1494337480532-3725c85fd2ab?auto=format&fit=crop&w=300&q=80",
		},
	];
</script>

<ScrollArea class="w-96 rounded-md border whitespace-nowrap" orientation="horizontal">
	<div class="flex w-max space-x-4 p-4">
		{#each works as artwork (artwork.artist)}
			<figure class="shrink-0">
				<div class="overflow-hidden rounded-md">
					<img
						src={artwork.art}
						alt="Photo by {artwork.artist}"
						class="aspect-[3/4] h-fit w-fit object-cover"
						width={300}
						height={400}
					/>
				</div>
				<figcaption class="text-muted-foreground pt-2 text-xs">
					Photo by
					<span class="text-foreground font-semibold">
						{artwork.artist}
					</span>
				</figcaption>
			</figure>
		{/each}
	</div>
</ScrollArea>
```
