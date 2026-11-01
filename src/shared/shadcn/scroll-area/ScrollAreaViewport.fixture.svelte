<script lang="ts">
  import { ScrollArea, type ScrollAreaStrategy } from "./index.js";
  let { strategy = "styled" }: { strategy?: ScrollAreaStrategy } = $props();
  let presses = $state(0);
</script>

<ScrollArea
  orientation="both"
  scrollStrategy={strategy}
  style="height: 120px; width: 240px"
  viewportProps={{
    role: "region",
    "aria-label": "Named viewport",
    onpointerdown: () => {
      presses++;
    },
  }}
>
  <div style="width: 600px; height: 400px">Scrollable content</div>
</ScrollArea>
<output aria-label="Viewport presses">{presses}</output>
