<script lang="ts">
  import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
</script>

<span class="ui-transcript-disclosure-icon" aria-hidden="true">
  <ChevronRightIcon size={14} />
</span>

<style>
  .ui-transcript-disclosure-icon {
    --ui-button-icon-size: 14px;
    display: inline-flex;
    flex: none;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    margin-inline-start: -4px;
    border-radius: calc(var(--radius) * 0.5);
  }
  .ui-transcript-disclosure-icon:hover,
  :global(button:focus-visible) .ui-transcript-disclosure-icon {
    background: var(--muted);
  }
  :global(button[data-state="open"])
    .ui-transcript-disclosure-icon
    :global(svg) {
    rotate: 90deg;
  }
</style>
