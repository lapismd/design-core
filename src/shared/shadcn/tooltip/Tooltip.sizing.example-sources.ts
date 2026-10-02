export const CustomSizing = `<script lang="ts">
  import * as Tooltip from "@lapismd/design-core/shadcn/tooltip";
</script>

<Tooltip.Provider>
  <Tooltip.Root>
    <Tooltip.Trigger>Custom hint</Tooltip.Trigger>
    <Tooltip.Content style="--ui-tooltip-font-size: 0.875rem; --ui-tooltip-line-height: 1.25rem; --ui-tooltip-padding-inline: 1rem; --ui-tooltip-padding-block: 0.5rem;">
      Custom tooltip sizing
    </Tooltip.Content>
  </Tooltip.Root>
</Tooltip.Provider>`;
