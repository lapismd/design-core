<script lang="ts">
  import type { Parser } from "@lezer/common";
  import { highlightCode } from "@lezer/highlight";
  import * as ScrollArea from "@stevejuma/ui/shadcn/scroll-area";

  import { codeHighlighter } from "./code-highlighter";

  type HighlightSegment = {
    text: string;
    className: string;
  };

  let {
    code,
    parser,
    ariaLabel = "Highlighted source",
  }: {
    /** The display-ready source text. This component does not edit it. */
    code: string;
    /** A Lezer parser for the language represented by `code`. */
    parser: Parser;
    /** Labels the read-only source region. The enclosing scroll area is keyboard-reachable. */
    ariaLabel?: string;
  } = $props();

  const segments = $derived.by(() => {
    const next: HighlightSegment[] = [];

    highlightCode(
      code,
      parser.parse(code),
      codeHighlighter,
      (text, classes) => {
        next.push({ text, className: classes });
      },
      () => {
        next.push({ text: "\n", className: "" });
      },
    );

    return next;
  });
</script>

<ScrollArea.Root orientation="horizontal" class="w-full">
  <pre
    class="ui-code-highlighter min-w-full rounded-lg border border-[color:var(--ui-form-border)] bg-[color:var(--ui-form-code-background)] p-3 font-mono text-xs leading-relaxed text-[color:var(--ui-form-foreground)]"
    role="region"
    aria-label={ariaLabel}>{#each segments as segment, index (index)}{#if segment.className}<span
          class={segment.className}>{segment.text}</span
        >{:else}{segment.text}{/if}{/each}</pre>
</ScrollArea.Root>

<style>
  :global(.ui-code-highlighter .ui-form-code-comment) {
    color: var(--ui-form-muted);
  }

  :global(.ui-code-highlighter .ui-form-code-keyword) {
    color: var(--ui-form-code-keyword, #5b21b6);
  }

  :global(.ui-code-highlighter .ui-form-code-string) {
    color: var(--ui-form-code-string, #92400e);
  }

  :global(.ui-code-highlighter .ui-form-code-value) {
    color: var(--ui-form-code-value, #0f766e);
  }

  :global(.ui-code-highlighter .ui-form-code-function) {
    color: var(--ui-form-code-function, #075985);
  }

  :global(.ui-code-highlighter .ui-form-code-property) {
    color: var(--ui-form-code-property, #1d4ed8);
  }

  :global(.ui-code-highlighter .ui-form-code-operator) {
    color: var(--ui-form-code-operator, var(--ui-form-foreground));
  }

  :global(.ui-code-highlighter .ui-form-code-punctuation) {
    color: var(--ui-form-code-punctuation, var(--ui-form-muted));
  }

  :global(.ui-code-highlighter .ui-form-code-invalid) {
    color: var(--destructive);
  }
</style>
