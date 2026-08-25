<script lang="ts">
  import * as ScrollArea from "./index.js";
  import type { ScrollAreaVisibility } from "./scroll-area-model.js";

  const modes: ScrollAreaVisibility[] = ["scroll", "hover", "always"];
  let inheritedMode = $state<ScrollAreaVisibility>("scroll");
  let dynamicCount = $state(12);
</script>

<div class="scroll-area-behavior" data-ui-scrollbar-visibility={inheritedMode}>
  <div class="scroll-area-behavior__controls" aria-label="Scrollbar preference">
    {#each modes as mode (mode)}
      <button
        type="button"
        aria-pressed={inheritedMode === mode}
        onclick={() => (inheritedMode = mode)}
      >
        {mode}
      </button>
    {/each}
    <button type="button" onclick={() => (dynamicCount += 6)}
      >Add content</button
    >
    <button
      type="button"
      onclick={() => (dynamicCount = Math.max(2, dynamicCount - 6))}
    >
      Remove content
    </button>
  </div>

  <section>
    <h2>Inherited preference</h2>
    <ScrollArea.Root aria-label="Inherited vertical area">
      <ol>
        {#each Array.from({ length: dynamicCount }, (_, index) => index + 1) as item (item)}
          <li>Dynamic item {item}</li>
        {/each}
      </ol>
    </ScrollArea.Root>
  </section>

  <div class="scroll-area-behavior__mode-grid">
    {#each modes as mode (mode)}
      <section>
        <h2>{mode}</h2>
        <ScrollArea.Root type={mode} aria-label={`${mode} vertical area`}>
          <ol>
            {#each Array.from({ length: 12 }, (_, index) => index + 1) as item (item)}
              <li>{mode} item {item}</li>
            {/each}
          </ol>
        </ScrollArea.Root>
      </section>
    {/each}
  </div>

  <section>
    <h2>Horizontal</h2>
    <ScrollArea.Root
      type="always"
      orientation="horizontal"
      aria-label="Horizontal area"
    >
      <div class="scroll-area-behavior__wide-content">
        Horizontal content remains natively scrollable.
      </div>
    </ScrollArea.Root>
  </section>

  <section>
    <h2>Both axes</h2>
    <ScrollArea.Root
      type="always"
      orientation="both"
      aria-label="Dual axis area"
    >
      <div
        class="scroll-area-behavior__wide-content scroll-area-behavior__tall-content"
      >
        Horizontal and vertical content remains natively scrollable.
      </div>
    </ScrollArea.Root>
  </section>

  <section>
    <h2>No overflow</h2>
    <ScrollArea.Root type="always" aria-label="No overflow area">
      <p>Short content</p>
    </ScrollArea.Root>
  </section>
</div>

<style>
  .scroll-area-behavior {
    display: grid;
    max-width: 52rem;
    gap: 1rem;
  }

  .scroll-area-behavior__controls,
  .scroll-area-behavior__mode-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .scroll-area-behavior__controls button {
    padding: 0.35rem 0.65rem;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    background: var(--background);
    color: var(--foreground);
  }

  .scroll-area-behavior__controls button[aria-pressed="true"] {
    background: var(--accent);
    color: var(--accent-foreground);
  }

  .scroll-area-behavior section {
    min-width: 0;
  }

  .scroll-area-behavior h2 {
    margin: 0 0 0.35rem;
    font-size: 0.875rem;
  }

  .scroll-area-behavior :global([data-ui-part="scroll-area"]) {
    width: 14rem;
    height: 8rem;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
  }

  .scroll-area-behavior ol,
  .scroll-area-behavior p {
    margin: 0;
    padding: 0.75rem 1.25rem;
  }

  .scroll-area-behavior__wide-content {
    width: 44rem;
    padding: 1rem;
    white-space: nowrap;
  }

  .scroll-area-behavior__tall-content {
    height: 18rem;
  }
</style>
