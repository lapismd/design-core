export const StartIndicator = `<script lang="ts">
  import * as Accordion from "@lapismd/design-core/shadcn/accordion";
</script>

<Accordion.Root type="single">
  <Accordion.Item value="all-views">
    <Accordion.Trigger indicatorPosition="start" indicatorVariant="disclosure">
      All views
    </Accordion.Trigger>
    <Accordion.Content>Shared filters</Accordion.Content>
  </Accordion.Item>
</Accordion.Root>`;
