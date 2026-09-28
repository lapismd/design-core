<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor } from "storybook/test";
  import { Basic, LazyDirectories } from "./FileListing.example-sources.js";
  import FileListing from "./FileListing.svelte";
  import FileListingViewModeToggle from "./FileListingViewModeToggle.svelte";
  import type {
    FileListingDirectory,
    FileListingFile,
    FileListingViewMode,
  } from "./types.js";

  const { Story } = defineMeta({
    title: "Diff/File Listing",
    component: FileListing,
    parameters: {
      docs: {
        description: {
          component:
            "Controlled change-set list, folder tree, or compacted package tree. Hosts own paths and selection.",
        },
        source: { code: Basic, language: "tsx", type: "code" },
      },
    },
  });

  const demoFiles: FileListingFile[] = [
    { path: "src/index.ts", additions: 4, deletions: 1 },
    { path: "src/lib/tree.ts", additions: 12, deletions: 0 },
    { path: "packages/web-ui/src/file-tree.ts", additions: 8, deletions: 3 },
    { path: "README.md", additions: 2, deletions: 2 },
  ];
  const largeFiles: FileListingFile[] = Array.from(
    { length: 500 },
    (_, index) => ({
      path: `src/generated/file-${String(index).padStart(4, "0")}.ts`,
      additions: index % 7,
      deletions: index % 3,
    }),
  );
</script>

<script lang="ts">
  import { SvelteSet } from "svelte/reactivity";

  let mode = $state<FileListingViewMode>("tree");
  let selectedPath = $state<string | null>("src/index.ts");
  let listMode = $state<FileListingViewMode>("list");
  let packageMode = $state<FileListingViewMode>("package");
  let packageSelected = $state<string | null>(null);
  let virtualSelected = $state<string | null>(null);
  let continuationRequests = $state(0);
  let lazyFiles = $state<FileListingFile[]>([{ path: "README.md" }]);
  let lazyDirectories = $state<FileListingDirectory[]>([{ path: "src" }]);
  const lazyCollapsed = new SvelteSet<string>(["src"]);
  let lazyRequests = $state(0);

  function toggleLazyDirectory(path: string) {
    if (!lazyCollapsed.has(path)) {
      lazyCollapsed.add(path);
      return;
    }
    lazyRequests += 1;
    lazyFiles = [...lazyFiles, { path: `${path}/lib.rs` }];
    lazyCollapsed.delete(path);
  }
</script>

<Story
  name="Selects a file in the folder tree"
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "src/lib/tree.ts" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "src/lib/tree.ts",
    );
    const selected = canvas.getByRole("button", { name: "src/lib/tree.ts" });
    const idle = canvas.getByRole("button", { name: "README.md" });
    await expect(selected).toHaveAttribute("aria-current", "true");
    await expect(getComputedStyle(selected).backgroundColor).not.toBe(
      getComputedStyle(idle).backgroundColor,
    );
    await expect(getComputedStyle(selected).backgroundColor).not.toBe(
      "rgba(0, 0, 0, 0)",
    );
    const viewMode = canvas.getByRole("group", {
      name: "File listing view mode",
    });
    const viewModes = canvas.getAllByRole("radio");
    await expect(viewModes).toHaveLength(3);
    await expect(getComputedStyle(viewMode).display).toContain("flex");
    await expect(viewMode.getBoundingClientRect().height).toBeLessThan(26);
    await expect(getComputedStyle(viewModes[0]).borderRadius).toBe("0px");
    const activeToggle = canvas.getByRole("radio", {
      name: "Show files as folders",
    });
    const idleToggle = canvas.getByRole("radio", {
      name: "Show files as list",
    });
    await expect(activeToggle).toHaveAttribute("data-state", "on");
    await expect(getComputedStyle(activeToggle).backgroundColor).not.toBe(
      getComputedStyle(idleToggle).backgroundColor,
    );
    await expect(getComputedStyle(activeToggle).backgroundColor).toBe(
      getComputedStyle(selected).backgroundColor,
    );
    await expect(canvas.getByText("+12")).toBeVisible();
    await expect(canvas.getByText("-1")).toBeVisible();
  }}
  tags={["visual-pending"]}
>
  {#snippet template()}
    <div class="max-w-md p-4">
      <FileListingViewModeToggle bind:mode />
      <FileListing
        files={demoFiles}
        {mode}
        bind:selectedPath
        onSelectPath={(path) => {
          selectedPath = path;
        }}
      />
      <output class="sr-only">{selectedPath ?? ""}</output>
    </div>
  {/snippet}
</Story>

<Story
  name="Loads host-owned directory children"
  parameters={{
    docs: {
      source: { code: LazyDirectories, language: "tsx", type: "code" },
    },
  }}
  play={async ({ canvas }) => {
    const directory = canvas.getByRole("button", { name: "src" });
    await expect(directory).toHaveAttribute("aria-expanded", "false");
    await expect(
      canvas.queryByRole("button", { name: "src/lib.rs" }),
    ).toBeNull();
    await userEvent.click(directory);
    await expect(directory).toHaveAttribute("aria-expanded", "true");
    await expect(
      canvas.getByRole("button", { name: "src/lib.rs" }),
    ).toBeVisible();
    await expect(canvas.getByRole("status")).toHaveTextContent("1");
  }}
  tags={["visual-pending"]}
>
  {#snippet template()}
    <div class="max-w-md p-4">
      <FileListing
        files={lazyFiles}
        directories={lazyDirectories}
        collapsedDirectoryPaths={lazyCollapsed}
        onDirectoryToggle={toggleLazyDirectory}
      />
      <output class="sr-only">{lazyRequests}</output>
    </div>
  {/snippet}
</Story>

<Story
  name="Virtualizes a large host-owned list"
  play={async ({ canvas }) => {
    const viewport = canvas.getByRole("region", { name: "Large file listing" });
    const listing = viewport.querySelector<HTMLElement>(
      '[data-ui-component="file-listing"]',
    )!;
    await expect(listing).toHaveAttribute("data-virtualized", "true");
    await expect(
      listing.querySelectorAll('[data-ui-part="virtual-row"]').length,
    ).toBeLessThan(80);
    const first = canvas.getByRole("button", {
      name: "src/generated/file-0000.ts",
    });
    first.focus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(
      canvas.getByRole("button", { name: "src/generated/file-0001.ts" }),
    ).toHaveFocus();

    viewport.style.overflowY = "auto";
    viewport.scrollTop = viewport.scrollHeight;
    viewport.dispatchEvent(new Event("scroll"));
    await waitFor(() => expect(continuationRequests).toBe(1));
    await expect(
      listing.querySelectorAll('[data-ui-part="virtual-row"]').length,
    ).toBeLessThan(80);
  }}
  tags={["visual-pending"]}
>
  {#snippet template()}
    <div
      role="region"
      aria-label="Large file listing"
      data-ui-part="scroll-area-viewport"
      style="height: 16rem; max-width: 32rem; padding: 0.5rem;"
    >
      <FileListing
        files={largeFiles}
        mode="list"
        bind:selectedPath={virtualSelected}
        virtualize
        hasMore
        onLoadMore={() => (continuationRequests += 1)}
      />
    </div>
  {/snippet}
</Story>

<Story
  name="Shows files as a flat list"
  play={async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", { name: "README.md" }),
    ).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "README.md" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("README.md");
  }}
  tags={["visual-pending"]}
>
  {#snippet template()}
    <div class="max-w-md p-4">
      <FileListingViewModeToggle bind:mode={listMode} />
      <FileListing
        files={demoFiles}
        mode={listMode}
        bind:selectedPath
        onSelectPath={(path) => {
          selectedPath = path;
        }}
      />
      <output class="sr-only">{selectedPath ?? ""}</output>
    </div>
  {/snippet}
</Story>

<Story
  name="Compacts nested package folders"
  play={async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", { name: "packages/web-ui/src" }),
    ).toBeVisible();
    await userEvent.click(
      canvas.getByRole("button", { name: "packages/web-ui/src/file-tree.ts" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "packages/web-ui/src/file-tree.ts",
    );
  }}
  tags={["visual-pending"]}
>
  {#snippet template()}
    <div class="max-w-md p-4">
      <FileListingViewModeToggle bind:mode={packageMode} />
      <FileListing
        files={demoFiles}
        mode={packageMode}
        bind:selectedPath={packageSelected}
        onSelectPath={(path) => {
          packageSelected = path;
        }}
      />
      <output class="sr-only">{packageSelected ?? ""}</output>
    </div>
  {/snippet}
</Story>

<Story
  name="Collapses a directory"
  play={async ({ canvas }) => {
    const directory = canvas.getByRole("button", { name: "src" });
    await expect(directory).toHaveAttribute("aria-expanded", "true");
    await expect(
      canvas.getByRole("button", { name: "src/index.ts" }),
    ).toBeVisible();
    await userEvent.click(directory);
    await expect(directory).toHaveAttribute("aria-expanded", "false");
    await expect(
      canvas.queryByRole("button", { name: "src/index.ts" }),
    ).toBeNull();
  }}
  tags={["visual-pending"]}
>
  {#snippet template()}
    <div class="max-w-md p-4">
      <FileListing files={demoFiles} mode="tree" />
    </div>
  {/snippet}
</Story>

<Story
  name="Shows an empty change set"
  play={async ({ canvas }) => {
    await expect(canvas.getByText("No changed files")).toBeVisible();
  }}
  tags={["visual-pending"]}
>
  {#snippet template()}
    <div class="max-w-md p-4">
      <FileListing files={[]} />
    </div>
  {/snippet}
</Story>
