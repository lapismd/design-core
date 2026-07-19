<!-- Adapted from https://shadcn-svelte.com/docs/components/card.md for the @stevejuma/ui native-CSS catalog. -->

# Card

Displays a card with header, content, and footer.

## [Usage](#usage)

```svelte
<script lang="ts">
  import * as Card from "@stevejuma/ui/shadcn/card";
</script>
```

```svelte
<Card.Root>
  <Card.Header>
    <Card.Title>Card Title</Card.Title>
    <Card.Description>Card Description</Card.Description>
  </Card.Header>
  <Card.Content>
    <p>Card Content</p>
  </Card.Content>
  <Card.Footer>
    <p>Card Footer</p>
  </Card.Footer>
</Card.Root>
```

## [Examples](#examples)

### [Spacing](#spacing)

In addition to the `size` prop, you can use the `--card-spacing` CSS variable to control the spacing between sections and the inset of card parts.

Use negative margins with `-mx-(--card-spacing)` to make content go edge to edge while keeping it aligned with the card inset. When the edge-to-edge content sits above a footer, use `-mb-(--card-spacing)` on `CardContent` to remove the section gap.

### [Image](#image)

Add an image before the card header to create a card with an image.
