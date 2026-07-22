<script lang="ts" module>
  export const TABS_LIST_VARIANTS = ["default", "line"] as const;
  export type TabsListVariant = (typeof TABS_LIST_VARIANTS)[number];

  /** @deprecated Prefer typed props; retained for API compatibility. */
  export function tabsListVariants(_opts?: {
    variant?: TabsListVariant;
    class?: string;
  }): string {
    return "";
  }
</script>

<script lang="ts">
  import { Tabs as TabsPrimitive } from "bits-ui";

  let {
    ref = $bindable(null),
    variant = "default",
    class: className,
    ...restProps
  }: TabsPrimitive.ListProps & {
    variant?: TabsListVariant;
  } = $props();
</script>

<TabsPrimitive.List
  bind:ref
  data-ui-component="tabs"
  data-ui-part="tabs-list"
  data-slot="tabs-list"
  data-variant={variant}
  class={className}
  {...restProps}
/>
