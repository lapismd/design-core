<script lang="ts">
  import "./ReferencePreview.css";
  import type { ReferencePreviewItem } from "../core/reference-utils";

  let {
    title = "",
    meta = "",
    items = [],
  }: {
    title?: string;
    meta?: string;
    items?: ReferencePreviewItem[];
  } = $props();

  function isListHighlighted(
    highlightedIndexes: number[] | undefined,
    index: number,
  ) {
    return highlightedIndexes?.includes(index) ?? false;
  }
</script>

<section
  class="cv-reference-preview-group"
  data-ui-component="reference-preview"
  data-ui-part="reference-preview"
>
  {#if title || meta}
    <header>
      {#if title}
        <h4>{title}</h4>
      {/if}
      {#if meta}
        <p>{meta}</p>
      {/if}
    </header>
  {/if}
  <div class="cv-reference-preview-group-body">
    {#each items as item, itemIndex (`${item.kind}-${item.label}-${itemIndex}`)}
      {#if item.kind === "list"}
        <div class="cv-reference-preview-list">
          <span>{item.label}</span>
          <div>
            {#if (item.items?.length ?? 0) > 0}
              {#each item.items ?? [] as listItem, index (`${item.label}-${index}`)}
                <p
                  class:highlighted={isListHighlighted(
                    item.highlightedIndexes,
                    index,
                  )}
                >
                  {listItem || " "}
                </p>
              {/each}
            {:else}
              <p></p>
            {/if}
          </div>
        </div>
      {:else}
        <div
          class:highlighted={item.highlighted ?? false}
          class="cv-reference-preview-row"
        >
          <span>{item.label}</span>
          <p>{item.value || " "}</p>
        </div>
      {/if}
    {/each}
  </div>
</section>
