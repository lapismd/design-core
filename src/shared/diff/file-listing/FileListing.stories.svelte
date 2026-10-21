<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import {
    expect,
    fireEvent,
    userEvent,
    waitFor,
    within,
  } from "storybook/test";
  import {
    Basic,
    LazyDirectories,
    NativeRowDrags,
  } from "./FileListing.example-sources.js";
  import FileListing from "./FileListing.svelte";
  import FileListingViewModeToggle from "./FileListingViewModeToggle.svelte";
  import type { FileListingDirectory } from "../index.js";
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

  function expectRowSeparation(listing: Element) {
    const rows = [
      ...listing.querySelectorAll<HTMLElement>(".ui-diff-file-listing__row"),
    ];
    expect(rows.length).toBeGreaterThan(1);
    for (let index = 1; index < rows.length; index += 1) {
      expect(
        rows[index].getBoundingClientRect().top -
          rows[index - 1].getBoundingClientRect().bottom,
      ).toBeCloseTo(2, 1);
    }
  }

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
  let lastDrag = $state("");

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
  name="Host owned native row drags"
  parameters={{
    docs: { source: { code: NativeRowDrags, language: "tsx", type: "code" } },
  }}
  tags={["visual-pending"]}
  play={async ({ canvas }) => {
    const file = canvas.getByRole("button", {
      name: /^src\/index\.ts(?: [+-][0-9]+)*$/,
    });
    const disabled = canvas.getByRole("button", {
      name: /^README\.md(?: [+-][0-9]+)*$/,
    });
    expect(file).toHaveAttribute("draggable", "true");
    expect(disabled).toHaveAttribute("draggable", "false");
    const dataTransfer = new DataTransfer();
    await fireEvent(
      file,
      new DragEvent("dragstart", { bubbles: true, dataTransfer }),
    );
    expect(dataTransfer.getData("text/plain")).toBe("src/index.ts");
    expect(canvas.getByRole("status")).toHaveTextContent("file:src/index.ts");
    expect(file).not.toHaveAttribute("aria-current");
    await userEvent.click(file);
    expect(file).toHaveAttribute("aria-current", "true");
    const folder = canvas.getByRole("button", { name: "src" });
    expect(folder).toHaveAttribute("draggable", "true");
    await fireEvent(
      folder,
      new DragEvent("dragstart", { bubbles: true, dataTransfer }),
    );
    expect(dataTransfer.getData("text/plain")).toBe("src");
    expect(canvas.getByRole("status")).toHaveTextContent("directory:src");
    await userEvent.click(folder);
    expect(
      canvas.queryByRole("button", {
        name: /^src\/index\.ts(?: [+-][0-9]+)*$/,
      }),
    ).toBeNull();
  }}
>
  {#snippet template()}
    <FileListing
      files={demoFiles}
      fileDraggable={(context) => context.path !== "README.md"}
      onFileDragStart={(event, context) => {
        event.dataTransfer?.setData("text/plain", context.path);
        lastDrag = `file:${context.path}`;
      }}
      onDirectoryDragStart={(event, context) => {
        event.dataTransfer?.setData("text/plain", context.node.path);
        lastDrag = `directory:${context.node.path}`;
      }}
    />
    <p role="status">{lastDrag || "No drag"}</p>
  {/snippet}
</Story>

<Story
  name="Root file icons retain the normal inset in folder and package views"
  tags={["visual-pending"]}
  play={async ({ canvas }) => {
    for (const view of ["tree", "package"]) {
      for (const virtualized of [false, true]) {
        const region = canvas.getByRole("region", {
          name: `${view} ${virtualized ? "virtual" : "eager"} files`,
        });
        const rows = within(region);
        await waitFor(() => {
          const root = rows.getByRole("button", {
            name: /^README\.md(?: [+-][0-9]+)*$/,
          });
          const nested = rows.getByRole("button", {
            name: /^src\/index\.ts(?: [+-][0-9]+)*$/,
          });
          const iconInset = (row: HTMLElement) =>
            row
              .querySelector(".ui-diff-file-listing__icon")!
              .getBoundingClientRect().left - row.getBoundingClientRect().left;
          expect(iconInset(root)).toBeCloseTo(
            parseFloat(getComputedStyle(root).paddingInlineStart),
            1,
          );
          expect(iconInset(nested)).toBeCloseTo(
            parseFloat(getComputedStyle(nested).paddingInlineStart) + 20,
            1,
          );
        });
      }
    }
  }}
>
  {#snippet template()}
    {#each ["tree", "package"] as view}
      {#each [false, true] as virtualized}
        <section
          aria-label={`${view} ${virtualized ? "virtual" : "eager"} files`}
          style="height: 18rem; overflow: auto;"
        >
          <FileListing
            files={demoFiles}
            mode={view as FileListingViewMode}
            virtualize={virtualized}
          />
        </section>
      {/each}
    {/each}
  {/snippet}
</Story>

<Story
  name="Selects a file in the folder tree"
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", {
        name: /^src\/lib\/tree\.ts(?: [+-][0-9]+)*$/,
      }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "src/lib/tree.ts",
    );
    const selected = canvas.getByRole("button", {
      name: /^src\/lib\/tree\.ts(?: [+-][0-9]+)*$/,
    });
    expectRowSeparation(
      selected.closest('[data-ui-component="file-listing"]')!,
    );
    const idle = canvas.getByRole("button", {
      name: /^README\.md(?: [+-][0-9]+)*$/,
    });
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
      name: /^src\/generated\/file\-0000\.ts(?: [+-][0-9]+)*$/,
    });
    await waitFor(() => expectRowSeparation(listing));
    first.focus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(
      canvas.getByRole("button", {
        name: /^src\/generated\/file\-0001\.ts(?: [+-][0-9]+)*$/,
      }),
    ).toHaveFocus();

    viewport.style.overflowY = "auto";
    viewport.scrollTop = viewport.scrollHeight;
    viewport.dispatchEvent(new Event("scroll"));
    await waitFor(() => expect(continuationRequests).toBe(1));
    await waitFor(() => expectRowSeparation(listing));
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
      canvas.getByRole("button", { name: /^README\.md(?: [+-][0-9]+)*$/ }),
    ).toBeVisible();
    await userEvent.click(
      canvas.getByRole("button", { name: /^README\.md(?: [+-][0-9]+)*$/ }),
    );
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
      canvas.getByRole("button", {
        name: /^packages\/web\-ui\/src\/file\-tree\.ts(?: [+-][0-9]+)*$/,
      }),
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
      canvas.getByRole("button", { name: /^src\/index\.ts(?: [+-][0-9]+)*$/ }),
    ).toBeVisible();
    await userEvent.click(directory);
    await expect(directory).toHaveAttribute("aria-expanded", "false");
    await expect(
      canvas.queryByRole("button", {
        name: /^src\/index\.ts(?: [+-][0-9]+)*$/,
      }),
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

<Story
  name="Accessible visible change counts"
  tags={["visual-pending"]}
  play={async ({ canvas }) => {
    const file = canvas.getByRole("button", { name: "Welcome.md +2 -2" });
    await expect(file).toBeVisible();
    await expect(file).toHaveTextContent("+2");
    await expect(file).toHaveTextContent("-2");
  }}
>
  {#snippet template()}<FileListing
      files={[{ path: "Welcome.md", additions: 2, deletions: 2 }]}
    />{/snippet}
</Story>
