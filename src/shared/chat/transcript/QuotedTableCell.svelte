<script lang="ts">
  import { MiraCodeEditor } from "@lapismd/mira";
  import { Decoration, EditorView } from "@codemirror/view";
  import { untrack } from "svelte";
  import { readingDecorations } from "./markdown-decorations.js";
  let { text, from, to }: { text: string; from: number; to: number } = $props();
  const extensions = untrack(() => {
    const reading = readingDecorations(text);
    return [
      EditorView.decorations.of(reading.decorations),
      EditorView.decorations.of(
        Decoration.set(
          to > from
            ? [
                Decoration.mark({
                  class: "ui-transcript-comment-highlight",
                }).range(from, to),
              ]
            : [],
        ),
      ),
      EditorView.editorAttributes.of({
        style:
          "--file-margins: 0; --file-margins-x: 0; --file-margins-y: 0; --file-line-width: 100%;",
      }),
    ];
  });
</script>

<div class="ui-transcript-rich-reader">
  <MiraCodeEditor
    value={text}
    {extensions}
    readonly
    lineNumbers={false}
    ariaLabel="Table row context"
    variant="document"
    surface="frameless"
    height="content"
    minHeight="0"
  />
</div>
