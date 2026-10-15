<script lang="ts" module>
  import type { SVGAttributes } from "svelte/elements";

  export type PanelToggleIconProps = Omit<
    SVGAttributes<SVGSVGElement>,
    "children"
  > & {
    /** Controlled panel state. The icon never changes it. */
    expanded: boolean;
    /** Edge represented by the filled indicator; the frame never rotates. */
    side?: "left" | "right" | "top" | "bottom";
    /** Standard Workspace geometry or the compact Column Canvas frame. */
    iconVariant?: "standard" | "compact";
  };
</script>

<script lang="ts">
  import "./panel-toggle-icon.css";

  let {
    expanded,
    side = "left",
    iconVariant = "compact",
    ...restProps
  }: PanelToggleIconProps = $props();

  const standard = $derived(iconVariant === "standard");
  const horizontal = $derived(side === "top" || side === "bottom");
</script>

<svg
  width={standard ? 16 : 18}
  height={standard ? 16 : 12}
  {...restProps}
  data-ui-component="panel-toggle"
  data-ui-part="icon"
  data-expanded={expanded}
  data-side={side}
  data-icon-variant={iconVariant}
  viewBox={standard ? "0 0 24 24" : "0 0 24 16"}
  fill="none"
  stroke={standard ? "currentColor" : undefined}
  stroke-width={standard ? 2 : undefined}
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
  focusable="false"
>
  <rect
    x="1"
    y={standard ? 2 : 1}
    width="22"
    height={standard ? 20 : 14}
    rx={standard ? 4 : 3}
    stroke="currentColor"
    stroke-width={standard ? 2 : 1.5}
  />
  <g transform={side === "right" ? "translate(24 0) scale(-1 1)" : undefined}>
    <rect
      data-ui-component="panel-toggle"
      data-ui-part="indicator"
      x={horizontal && standard ? 5 : 4}
      y={standard ? 5 : 4}
      width={horizontal ? (standard ? 14 : 16) : undefined}
      height={standard ? 14 : 8}
      rx={standard ? (horizontal && !expanded ? 1 : 2) : 1}
      fill="currentColor"
    />
  </g>
</svg>
