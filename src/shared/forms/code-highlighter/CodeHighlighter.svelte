<script lang="ts">
  import "./CodeHighlighter.css";
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

<div data-ui-component="code-highlighter" data-ui-part="code-highlighter">
  <ScrollArea.Root orientation="horizontal">
    <pre
      data-ui-component="code-highlighter"
      data-ui-part="code-highlighter-pre"
      class="ui-code-highlighter"
      role="region"
      aria-label={ariaLabel}>{#each segments as segment, index (index)}{#if segment.className}<span
            class={segment.className}>{segment.text}</span
          >{:else}{segment.text}{/if}{/each}</pre>
  </ScrollArea.Root>
</div>
