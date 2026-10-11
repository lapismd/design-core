<script lang="ts">
  import "./panel-toggle.css";

  let {
    expanded,
    side = "left",
  }: {
    /** Controlled panel state. The icon never changes it. */
    expanded: boolean;
    /** Mirror the indicator for a panel at the right edge. */
    side?: "left" | "right";
  } = $props();
</script>

<svg
  data-ui-component="panel-toggle"
  data-ui-part="icon"
  data-expanded={expanded}
  data-side={side}
  width="18"
  height="12"
  viewBox="0 0 24 16"
  fill="none"
  aria-hidden="true"
  focusable="false"
>
  <rect
    x="1"
    y="1"
    width="22"
    height="14"
    rx="3"
    stroke="currentColor"
    stroke-width="1.5"
  />
  <g transform={side === "right" ? "translate(24 0) scale(-1 1)" : undefined}>
    <rect
      data-ui-component="panel-toggle"
      data-ui-part="indicator"
      x="4"
      y="4"
      height="8"
      rx="1"
      fill="currentColor"
    />
  </g>
</svg>
