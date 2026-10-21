<script lang="ts">
  import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
  import { Button } from "@lapismd/design-core/shadcn/button";
  import "../chat.css";

  let {
    ref = $bindable(null),
    isVisible,
    hasNewMessages = false,
    isRunning = false,
    label,
    onClick,
  }: {
    ref?: HTMLDivElement | null;
    /** Whether the recovery control is visually and semantically available. */
    isVisible: boolean;
    /** Use the stronger new-message label instead of the generic scroll label. */
    hasNewMessages?: boolean;
    /** Actual host session activity; this remains a scroll action, not a menu. */
    isRunning?: boolean;
    label?: string;
    onClick: () => void;
  } = $props();

  const resolvedLabel = $derived(
    label ?? (hasNewMessages ? "New messages" : "Scroll to latest"),
  );
  const accessibleLabel = $derived(
    isRunning ? `${resolvedLabel} (session running)` : resolvedLabel,
  );
  const isExpanded = $derived(Boolean(label || hasNewMessages));
</script>

<div
  bind:this={ref}
  data-ui-component="ai-chat-layout-scroll-button"
  data-ui-part="root"
  data-visible={isVisible}
  aria-hidden={!isVisible}
  inert={!isVisible ? true : undefined}
>
  <Button
    type="button"
    size={isExpanded ? "sm" : "icon-sm"}
    variant="ghost"
    aria-label={accessibleLabel}
    onclick={onClick}
  >
    {#if isRunning}
      <span
        class="activity"
        aria-hidden="true"
        style:--activity-play-state={isVisible ? "running" : "paused"}
      >
        {#each [0, 1, 2] as dot}<span
            data-ui-part="activity-dot"
            style:--dot={dot}
          ></span>{/each}
      </span>
    {:else}<ChevronDownIcon aria-hidden="true" />{/if}
    {#if isExpanded}
      <span>{resolvedLabel}</span>
    {/if}
  </Button>
</div>

<style>
  .activity {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.2rem;
    width: 0.875rem;
    height: 0.875rem;
  }
  .activity span {
    width: 0.2rem;
    height: 0.2rem;
    border-radius: 50%;
    background: currentColor;
    animation: scroll-activity 900ms ease-in-out infinite;
    animation-delay: calc(var(--dot) * 120ms);
    animation-play-state: var(--activity-play-state);
  }
  @keyframes scroll-activity {
    0%,
    60%,
    100% {
      transform: translateY(0);
    }
    30% {
      transform: translateY(-0.2rem);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .activity span {
      animation: none;
    }
  }
</style>
