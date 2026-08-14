<script lang="ts">
  import type { Snippet } from "svelte";
  import { truncatePathMiddle } from "../core/unified-diff.js";
  import FileDiff from "./FileDiff.svelte";
  import type {
    FileDiffFile,
    FileDiffLineContext,
    FileDiffScrollTarget,
    FileDiffViewMode,
  } from "./types.js";
  import "./FileDiff.css";

  let {
    files,
    viewMode = "unified",
    scrollTo,
    lineAccessory,
  }: {
    files: FileDiffFile[];
    viewMode?: FileDiffViewMode;
    scrollTo?: FileDiffScrollTarget | null;
    lineAccessory?: Snippet<[FileDiffLineContext]>;
  } = $props();
</script>

<div
  class="ui-diff-file-diff-composer"
  data-ui-component="file-diff-composer"
  data-ui-part="file-diff-composer"
>
  {#if files.length === 0}
    <p class="ui-diff-file-diff__empty">No file diffs</p>
  {:else}
    {#each files as file (file.path)}
      <section
        class="ui-diff-file-diff-composer__file"
        data-ui-part="file-section"
        data-diff-file-path={file.path}
      >
        <header class="ui-diff-file-diff-composer__header">
          <span title={file.path}>{truncatePathMiddle(file.path)}</span>
        </header>
        <FileDiff
          path={file.path}
          oldText={file.oldText}
          newText={file.newText}
          patch={file.patch}
          language={file.language}
          {viewMode}
          scrollTo={scrollTo?.path === file.path ||
          (scrollTo != null &&
            scrollTo.path == null &&
            files[0]?.path === file.path)
            ? scrollTo
            : null}
          {lineAccessory}
        />
      </section>
    {/each}
  {/if}
</div>
