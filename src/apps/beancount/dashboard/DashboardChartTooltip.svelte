<script lang="ts">
  let {
    detail = "",
    title = "",
    value = "",
    visible = false,
    x = 0,
    y = 0,
  }: {
    detail?: string;
    title?: string;
    value?: string;
    visible?: boolean;
    x?: number;
    y?: number;
  } = $props();
</script>

{#if visible}
  <div
    class="bc-dashboard-tooltip"
    style={`left: ${x}px; top: ${y}px`}
    data-dashboard-chart-tooltip
    role="status"
    aria-live="polite"
  >
    <p class="bc-dashboard-tooltip__title">{title}</p>
    <p class="bc-dashboard-tooltip__value-row">
      <span class="bc-dashboard-tooltip__value">{value}</span>
      {#if detail}
        <span class="bc-dashboard-tooltip__detail">{detail}</span>
      {/if}
    </p>
  </div>
{/if}

<style>
  .bc-dashboard-tooltip { position: absolute; min-width: 11rem; pointer-events: none; transform: translate(-50%, calc(-100% - .75rem)); border: 1px solid color-mix(in srgb, var(--ui-beancount-border) 80%, transparent); border-radius: var(--radius-lg); background: var(--popover); padding: var(--ui-beancount-space-2) var(--ui-beancount-space-3); color: var(--popover-foreground); box-shadow: var(--shadow-lg); }
  .bc-dashboard-tooltip__title, .bc-dashboard-tooltip__detail { color: var(--ui-beancount-muted-foreground); font-size: .75rem; }
  .bc-dashboard-tooltip__value-row { display:flex; align-items: baseline; justify-content:space-between; gap:var(--ui-beancount-space-3); margin-block-start:var(--ui-beancount-space-1); font-family:var(--font-mono); font-size:.875rem; font-variant-numeric:tabular-nums; }
  .bc-dashboard-tooltip__value { color:var(--ui-beancount-foreground); font-weight:500; }
</style>
