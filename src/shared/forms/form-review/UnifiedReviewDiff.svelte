<script lang="ts">
  import "./UnifiedReviewDiff.css";
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
  data-ui-component="unified-review-diff"
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
