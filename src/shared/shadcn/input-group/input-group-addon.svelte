<script lang="ts" module>
      export const INPUT_GROUP_ADDON_ALIGNS = [
    "inline-start",
    "inline-end",
    "block-start",
    "block-end",
  ] as const;
  export type InputGroupAddonAlign = (typeof INPUT_GROUP_ADDON_ALIGNS)[number];

  /** @deprecated Prefer typed props; retained for API compatibility. */
  export function inputGroupAddonVariants(_opts?: {
    align?: InputGroupAddonAlign;
    class?: string;
  }): string {
    return "";
  }
</script>

<script lang="ts">
  import { type WithElementRef } from "../../../lib/utils.js";
  import type { HTMLAttributes } from "svelte/elements";

  let {
    ref = $bindable(null),
    class: className,
    children,
    align = "inline-start",
    ...restProps
  }: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
    align?: InputGroupAddonAlign;
  } = $props();
</script>

<div
  bind:this={ref}
  role="group"
  data-ui-component="input-group"
  data-ui-part="input-group-addon"
    data-slot="input-group-addon"
  data-align={align}
  class={className}
  onclick={(e) => {
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }
    e.currentTarget.parentElement?.querySelector("input")?.focus();
  }}
  {...restProps}
>
  {@render children?.()}
</div>
