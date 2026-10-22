<script lang="ts">
  import FileTypeIcon from "./FileTypeIcon.svelte";
  import { commonFilePaths } from "./FileTypeIcon.stories.data.js";
  import type { FileTypeIconSize } from "./file-type-icon.types.js";
  let { sizes = false }: { sizes?: boolean } = $props();
</script>

<div
  style="display:grid;gap:1rem;padding:1rem;background:var(--background);color:var(--foreground)"
>
  {#if sizes}
    {#each [{ variant: "xs", pixels: 12 }, { variant: "s", pixels: 14 }, { variant: "md", pixels: 16 }, { variant: "lg", pixels: 24 }] as { variant, pixels }}
      <div
        style="display:flex;align-items:center;gap:0.75rem"
        data-size={pixels}
      >
        <FileTypeIcon
          path="src/main.ts"
          size={variant as FileTypeIconSize}
        /><FileTypeIcon
          path="config/package.json"
          size={variant as FileTypeIconSize}
        /><FileTypeIcon
          path="unknown.zzz"
          size={variant as FileTypeIconSize}
        /><span>{variant} · {pixels}px</span>
      </div>
    {/each}
    <div
      data-size="20"
      style="display:flex;align-items:center;gap:0.75rem;--ui-file-type-icon-size:20px"
    >
      <FileTypeIcon path="src/main.ts" size="xs" /><FileTypeIcon
        path="package.json"
        size="s"
      /><FileTypeIcon path="unknown.zzz" size="lg" /><span
        >Custom CSS · 20px</span
      >
    </div>
  {:else}
    {#each commonFilePaths as path}
      <div style="display:flex;align-items:center;gap:0.75rem">
        <FileTypeIcon {path} /><span>{path}</span>
      </div>
    {/each}
  {/if}
</div>
