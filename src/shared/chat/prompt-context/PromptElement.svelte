<!-- Adapted from jj-store 2a479c74; Apache-2.0, LapisMD contributors. -->
<script lang="ts">
  import type { Snippet } from "svelte";
  import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
  import * as Collapsible from "../../shadcn/collapsible/index.js";
  import { Button } from "../../shadcn/button/index.js";
  import PromptTag from "./PromptTag.svelte";
  let {
    label,
    closing,
    compact = false,
    children,
    ref = $bindable(null),
  }: {
    label: string;
    closing?: string;
    compact?: boolean;
    children?: Snippet;
    ref?: HTMLDivElement | null;
  } = $props();
  let open = $state(false);
</script>

{#if compact}
  <div
    bind:this={ref}
    class="ui-prompt-context-element ui-prompt-context-element__compact"
    data-prompt-element={label}
  >
    <PromptTag {label} />{#if closing}<span
        class="ui-prompt-context-element__inline">{@render children?.()}</span
      ><PromptTag label={closing} />{/if}
  </div>
{:else}
  <Collapsible.Root
    bind:ref
    bind:open
    class="ui-prompt-context-element"
    data-prompt-element={label}
  >
    <Collapsible.Trigger>
      {#snippet child({ props })}
        <Button
          {...props}
          variant="ghost"
          aria-label={label}
          class="ui-prompt-context-element__trigger"
        >
          <ChevronRightIcon data-icon="inline-start" aria-hidden="true" />
          <PromptTag {label} />
        </Button>
      {/snippet}
    </Collapsible.Trigger>
    <Collapsible.Content class="ui-prompt-context-element__body">
      {@render children?.()}
    </Collapsible.Content>
  </Collapsible.Root>
{/if}

<style>
  :global(.ui-prompt-context-element) {
    min-width: 0;
    margin-block: 0.125rem;
  }
  :global(.ui-prompt-context-element__trigger) {
    width: 100%;
    height: auto;
    justify-content: flex-start;
    white-space: normal;
    text-align: start;
    overflow-wrap: anywhere;
    padding-block: 0.25rem;
    padding-inline: 0.625rem;
    gap: 0.375rem;
    border: 0;
  }
  :global(.ui-prompt-context-element__trigger svg) {
    width: 1rem;
    height: 1rem;
    flex-shrink: 0;
  }
  :global(.ui-prompt-context-element__trigger[data-state="open"] svg) {
    transform: rotate(90deg);
  }
  :global(.ui-prompt-context-element__body) {
    min-width: 0;
    padding-block: 0.125rem 0.375rem;
    /* The trigger label starts at 2rem, after its icon and gap. */
    padding-inline: 2.5rem 0.625rem;
  }
  .ui-prompt-context-element__compact {
    padding: 0.25rem 0.625rem;
    /* Reserve the same icon/gap column as disclosure labels. */
    padding-inline-start: 2rem;
    overflow-wrap: anywhere;
  }
  .ui-prompt-context-element__inline {
    margin-inline: 0.35rem;
  }
</style>
