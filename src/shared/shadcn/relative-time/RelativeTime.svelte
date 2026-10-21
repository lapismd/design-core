<script lang="ts">
  import { untrack } from "svelte";
  import * as Tooltip from "../tooltip/index.js";
  import { safeLink } from "../link-preview/safe-link.js";
  import { formatRelativeTime, type TimeValue } from "./relative-time.js";
  import "./relative-time.css";
  let {
    timestamp,
    now,
    locale,
    absoluteAfterDays,
    href,
    label,
    class: className,
  }: {
    timestamp: TimeValue;
    now?: number;
    locale?: string;
    absoluteAfterDays?: number;
    href?: string;
    label?: string;
    class?: string;
  } = $props();
  let liveNow = $state(Date.now());
  const formatted = $derived(
    formatRelativeTime(timestamp, {
      now: now ?? liveNow,
      ...(locale === undefined ? {} : { locale }),
      ...(absoluteAfterDays === undefined ? {} : { absoluteAfterDays }),
    }),
  );
  const destination = $derived(safeLink(href));
  const contextLabel = $derived(label ?? formatted.full);
  const accessibleName = $derived(
    formatted.text === contextLabel
      ? formatted.text
      : `${formatted.text} · ${contextLabel}`,
  );
  $effect(() => {
    if (now !== undefined) return;
    untrack(() => (liveNow = Date.now()));
    const timer = setInterval(() => (liveNow = Date.now()), 30000);
    return () => clearInterval(timer);
  });
</script>

<span data-ui-component="relative-time"
  ><Tooltip.Provider
    ><Tooltip.Root>
      {#if destination}<Tooltip.Trigger
          >{#snippet child({ props })}<a
              {...props}
              href={destination}
              class={["ui-relative-time", className]}
              aria-label={accessibleName}
              ><time datetime={formatted.datetime}>{formatted.text}</time></a
            >{/snippet}</Tooltip.Trigger
        >
      {:else}<Tooltip.Trigger
          class={["ui-relative-time", className]}
          aria-label={accessibleName}
          ><time datetime={formatted.datetime}>{formatted.text}</time
          ></Tooltip.Trigger
        >{/if}
      <Tooltip.Content role="tooltip">{formatted.full}</Tooltip.Content
      ></Tooltip.Root
    ></Tooltip.Provider
  >
</span>
