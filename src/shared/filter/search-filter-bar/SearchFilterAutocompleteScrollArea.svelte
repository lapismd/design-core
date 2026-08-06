<script lang="ts">
  import * as ScrollArea from "@lapismd/design-core/shadcn/scroll-area";

  let {
    list,
  }: {
    /** The CodeMirror-owned listbox that this component makes scrollable. */
    list: HTMLUListElement;
  } = $props();

  let content = $state<HTMLDivElement | null>(null);

  $effect(() => {
    if (content && list.parentElement !== content) {
      content.appendChild(list);
    }
  });
</script>

<ScrollArea.Root
  class="cv-search-filter-bar__autocomplete-scroll-area"
  data-testid="search-filter-autocomplete-values"
  scrollbarYClasses="cv-search-filter-bar__autocomplete-scrollbar"
>
  <div
    bind:this={content}
    class="cv-search-filter-bar__autocomplete-scroll-area-content"
  ></div>
</ScrollArea.Root>
