<script lang="ts">
  import ListIcon from "@lucide/svelte/icons/list";
  import FolderTreeIcon from "@lucide/svelte/icons/folder-tree";
  import PackageIcon from "@lucide/svelte/icons/package";
  import * as ToggleGroup from "../../shadcn/toggle-group/index.js";
  import type { FileListingViewMode } from "./types.js";

  let {
    mode = $bindable("tree"),
    onModeChange,
  }: {
    mode?: FileListingViewMode;
    onModeChange?: (mode: FileListingViewMode) => void;
  } = $props();

  function setMode(next: string | undefined) {
    if (next !== "list" && next !== "tree" && next !== "package") return;
    mode = next;
    onModeChange?.(next);
  }
</script>

<ToggleGroup.Root
  type="single"
  value={mode}
  onValueChange={setMode}
  variant="outline"
  size="sm"
  data-ui-component="file-listing-view-mode-toggle"
  aria-label="File listing view mode"
>
  <ToggleGroup.Item value="list" aria-label="Show files as list" title="List">
    <ListIcon />
  </ToggleGroup.Item>
  <ToggleGroup.Item
    value="tree"
    aria-label="Show files as folders"
    title="Folder tree"
  >
    <FolderTreeIcon />
  </ToggleGroup.Item>
  <ToggleGroup.Item
    value="package"
    aria-label="Show files as packages"
    title="Package tree"
  >
    <PackageIcon />
  </ToggleGroup.Item>
</ToggleGroup.Root>

<style>
  :global([data-ui-component="file-listing-view-mode-toggle"] svg) {
    width: 0.875rem;
    height: 0.875rem;
  }
</style>
