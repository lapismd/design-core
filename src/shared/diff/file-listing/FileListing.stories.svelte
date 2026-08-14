<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import { Basic } from "./FileListing.example-sources.js";
  import FileListing from "./FileListing.svelte";
  import FileListingViewModeToggle from "./FileListingViewModeToggle.svelte";
  import type { FileListingFile, FileListingViewMode } from "./types.js";

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
</script>

<script lang="ts">
  let mode = $state<FileListingViewMode>("tree");
  let selectedPath = $state<string | null>("src/index.ts");
  let listMode = $state<FileListingViewMode>("list");
  let packageMode = $state<FileListingViewMode>("package");
  let packageSelected = $state<string | null>(null);
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
    await expect(
      canvas.getByRole("button", { name: "src/lib/tree.ts" }),
    ).toHaveAttribute("aria-current", "true");
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
