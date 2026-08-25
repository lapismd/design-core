export const Basic = `<script lang="ts">
  import * as ScrollArea from "@lapismd/design-core/shadcn/scroll-area";

  const items = Array.from({ length: 20 }, (_, index) => \`Item \${index + 1}\`);
</script>

<ScrollArea.Root aria-label="Catalog items">
  <ul>
    {#each items as item}
      <li>{item}</li>
    {/each}
  </ul>
</ScrollArea.Root>`;

export const VisibilityModes = `<script lang="ts">
  import * as ScrollArea from "@lapismd/design-core/shadcn/scroll-area";
  import type { ScrollAreaVisibility } from "@lapismd/design-core/shadcn/scroll-area";

  let visibility: ScrollAreaVisibility = "scroll";
</script>

<div data-ui-scrollbar-visibility={visibility}>
  <ScrollArea.Root aria-label="Inherited scroll area">
    <!-- Overflowing content -->
  </ScrollArea.Root>
</div>

<ScrollArea.Root type="always" aria-label="Explicit standalone scroll area">
  <!-- This local override remains authoritative. -->
</ScrollArea.Root>`;
