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

export const LazyDirectories = `<script lang="ts">
  import { FileListing } from "@lapismd/design-core/diff";
  import { SvelteSet } from "svelte/reactivity";

  let files = $state([{ path: "README.md" }]);
  let directories = $state([{ path: "src" }]);
  const collapsed = new SvelteSet(["src"]);

  async function toggleDirectory(path: string) {
    if (!collapsed.has(path)) return void collapsed.add(path);
    files = [...files, { path: "src/lib.rs" }];
    collapsed.delete(path);
  }
</script>

<FileListing
  {files}
  {directories}
  collapsedDirectoryPaths={collapsed}
  onDirectoryToggle={toggleDirectory}
/>`;

export const NativeRowDrags = `<script lang="ts">
  import { FileListing } from "@lapismd/design-core/diff";
  const files = [{ path: "src/index.ts" }, { path: "README.md" }];
</script>
<FileListing
  {files}
  fileDraggable={(context) => context.path !== "README.md"}
  onFileDragStart={(event, context) => { event.dataTransfer?.setData("text/plain", context.path); }}
  onDirectoryDragStart={(event, context) => { event.dataTransfer?.setData("text/plain", context.node.path); }}
/>`;
