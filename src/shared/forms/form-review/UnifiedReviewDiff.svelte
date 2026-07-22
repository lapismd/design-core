<script lang="ts">
  import { unifiedDiff, type UnifiedDiffLine } from "../core/review-diff";

  let {
    before,
    after,
    testId = "unified-review-diff",
  }: {
    /** Prior value(s) being replaced. A string is split into lines. */
    before: string | readonly string[];
    /** Proposed value(s) replacing `before`. A string is split into lines. */
    after: string | readonly string[];
    /** Overrides the root `data-testid` for test targeting. */
    testId?: string;
  } = $props();

  const lines = $derived(
    unifiedDiff(before, after).flatMap((part) => part.lines),
  );

  function lineKey(line: UnifiedDiffLine, index: number) {
    return `${index}-${line.type}-${line.text}`;
  }
</script>

<div
  class="unified-review-diff"
  data-ui-part="unified-review-diff"
  data-testid={testId}
  role="group"
  aria-label="Changes"
>
  {#each lines as line, index (lineKey(line, index))}
    <div class="unified-review-diff__line" data-line-type={line.type}>
      <span class="unified-review-diff__marker" aria-hidden="true"
        >{line.type === "removed"
          ? "\u2212"
          : line.type === "added"
            ? "+"
            : " "}</span
      >
      <span class="unified-review-diff__text">
        {#each line.segments as segment, segmentIndex (`${segmentIndex}-${segment.type}-${segment.text}`)}
          {#if segment.type === "removed"}
            <del class="unified-review-diff__removed">{segment.text}</del>
          {:else if segment.type === "added"}
            <ins class="unified-review-diff__added">{segment.text}</ins>
          {:else}
            {segment.text}
          {/if}
        {/each}
      </span>
    </div>
  {/each}
</div>

<style>
  .unified-review-diff {
    display: flex;
    flex-direction: column;
    border-radius: calc(var(--ui-form-radius, 0.625rem) * 0.5);
    background: var(--ui-form-background);
    font: inherit;
    font-size: 0.875rem;
    line-height: 1.25rem;
    overflow-x: auto;
    /* Match FormField input padding so the first
       diff line lines up with the row label. */
    padding-block: 0;
  }

  .unified-review-diff__line {
    display: flex;
    gap: 0.4rem;
    padding: 0.05rem 0.4rem;
    overflow-wrap: anywhere;
    white-space: pre-wrap;
  }

  .unified-review-diff__line[data-line-type="removed"] {
    background: color-mix(
      in oklab,
      var(--destructive, #b91c1c) 8%,
      var(--ui-form-background, #fff)
    );
    color: color-mix(
      in oklab,
      var(--destructive, #b91c1c) 92%,
      var(--ui-form-foreground, #111)
    );
  }

  .unified-review-diff__line[data-line-type="added"] {
    background: color-mix(
      in oklab,
      #166534 8%,
      var(--ui-form-background, #fff)
    );
    color: color-mix(in oklab, #166534 88%, var(--ui-form-foreground, #111));
  }

  .unified-review-diff__line[data-line-type="equal"] {
    color: var(--ui-form-muted);
  }

  .unified-review-diff__marker {
    flex: 0 0 auto;
    width: 0.75rem;
    text-align: center;
    font-weight: 600;
  }

  .unified-review-diff__text {
    min-width: 0;
  }

  .unified-review-diff__removed {
    color: color-mix(
      in oklab,
      var(--destructive, #b91c1c) 95%,
      var(--ui-form-foreground, #111)
    );
    font-weight: 600;
    text-decoration: line-through;
  }

  .unified-review-diff__added {
    color: color-mix(in oklab, #14532d 90%, var(--ui-form-foreground, #111));
    font-weight: 600;
    text-decoration: none;
  }
</style>
