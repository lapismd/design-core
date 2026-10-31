<script lang="ts">
  import {
    ScrollArea,
    type ScrollAreaViewportProps,
  } from "@lapismd/design-core/shadcn/scroll-area";
  const viewportProps: ScrollAreaViewportProps = {
    role: "grid",
    "aria-label": "Typed viewport",
    onkeydown(event) {
      event.currentTarget.scrollTo({ top: 0 });
    },
  };
</script>

<ScrollArea orientation="both" {viewportProps}>Content</ScrollArea>
