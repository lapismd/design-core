export const Basic = `<script lang="ts">
  import { ResponsiveTabs } from "@lapismd/design-core/shadcn/responsive-tabs";
  import * as Tabs from "@lapismd/design-core/shadcn/tabs";
  let value = $state("overview");
  const items = [{ value: "overview", label: "Overview" }, { value: "documents", label: "Documents" }];
</script>
<Tabs.Root bind:value>
  <ResponsiveTabs bind:value {items} inheritContext label="Project sections" />
  <Tabs.Content value="overview" aria-label="Overview">Overview content</Tabs.Content>
  <Tabs.Content value="documents" aria-label="Documents">Documents content</Tabs.Content>
</Tabs.Root>`;
