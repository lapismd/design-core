<script lang="ts">
  import { setContext, untrack } from "svelte";
  import MarkdownContent from "../markdown-content/MarkdownContent.svelte";
  import RichTableCell from "./RichTableCell.svelte";
  import RichCodeBlock from "./RichCodeBlock.svelte";
  import RichTable from "./RichTable.svelte";
  import {
    richSourceContext,
    richSourceExtension,
    type RichSourceContext,
  } from "./rich-source.js";
  import type { TranscriptProps } from "./model.js";
  let {
    text,
    offset,
    source,
    markdown,
  }: {
    text: string;
    offset: number;
    source: RichSourceContext;
    markdown?: TranscriptProps["markdown"];
  } = $props();
  setContext(
    richSourceContext,
    untrack(() => source),
  );
</script>

<MarkdownContent
  {...markdown}
  content={text}
  fullWidth
  extensions={[
    ...(markdown?.extensions ?? []),
    richSourceExtension(text, offset),
  ]}
  components={{
    ...markdown?.components,
    pre: "div",
    code: RichCodeBlock,
    table: RichTable,
    td: RichTableCell,
    th: RichTableCell,
  }}
/>
