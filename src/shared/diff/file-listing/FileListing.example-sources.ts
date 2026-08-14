export const Basic = `<script lang="ts">
  import {
    FileListing,
    FileListingViewModeToggle,
  } from "@lapismd/design-core/diff";

  let mode = $state("tree");
  let selectedPath = $state("src/index.ts");

  const files = [
    { path: "src/index.ts", additions: 4, deletions: 1 },
    { path: "src/lib/tree.ts", additions: 12, deletions: 0 },
    { path: "README.md", additions: 2, deletions: 2 },
  ];
</script>

<FileListingViewModeToggle bind:mode />
<FileListing {files} {mode} bind:selectedPath />`;
