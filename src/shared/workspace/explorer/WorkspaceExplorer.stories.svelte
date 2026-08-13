<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import {
    expect,
    fireEvent,
    userEvent,
    waitFor,
    within,
  } from "storybook/test";
  import { ExplorerController } from "./explorer-controller.svelte.js";
  import { createMemoryExplorerAdapter } from "./memory-adapter.js";
  import type { ExplorerNode } from "./types.js";
  import * as exampleSources from "./WorkspaceExplorer.example-sources.js";
  import WorkspaceExplorer from "./WorkspaceExplorer.svelte";
  import { WorkspaceMenu } from "../core/workspace-menu.js";

  const seed: ExplorerNode[] = [
    {
      path: "notes",
      name: "notes",
      kind: "folder",
      children: [
        { path: "notes/alpha.md", name: "alpha.md", kind: "file" },
        { path: "notes/zeta.md", name: "zeta.md", kind: "file" },
        {
          path: "notes/deep",
          name: "deep",
          kind: "folder",
          children: [
            { path: "notes/deep/nested.md", name: "nested.md", kind: "file" },
          ],
        },
      ],
    },
    { path: "readme.md", name: "readme.md", kind: "file" },
    { path: "empty", name: "empty", kind: "folder", children: [] },
  ];

  const LONG_FILE_NAME =
    "a-very-long-filename-that-should-ellipsis-in-the-narrow-explorer-pane.md";

  function buildOverflowSeed(): ExplorerNode[] {
    const archiveFiles = Array.from({ length: 36 }, (_, i) => {
      const name = `file-${String(i + 1).padStart(2, "0")}.md`;
      return {
        path: `archive/${name}`,
        name,
        kind: "file" as const,
      };
    });
    const projectFiles = Array.from({ length: 20 }, (_, i) => {
      const name = `project-${i}-with-an-intentionally-long-descriptive-name.md`;
      return {
        path: `projects/${name}`,
        name,
        kind: "file" as const,
      };
    });
    return [
      {
        path: "archive",
        name: "archive",
        kind: "folder",
        children: [
          {
            path: `archive/${LONG_FILE_NAME}`,
            name: LONG_FILE_NAME,
            kind: "file",
          },
          ...archiveFiles,
        ],
      },
      {
        path: "projects",
        name: "projects",
        kind: "folder",
        children: projectFiles,
      },
    ];
  }

  function mountExplorer(
    options: {
      seed?: ExplorerNode[];
      loading?: boolean;
      autoReveal?: boolean;
      buildItemMenu?: (
        menu: WorkspaceMenu,
        node: ExplorerNode,
        source: "explorer",
      ) => void;
      extensionLog?: { value: string };
    } = {},
  ) {
    const memory = createMemoryExplorerAdapter(options.seed ?? seed, {
      autoReveal: options.autoReveal,
    });
    const extensionLog = options.extensionLog ?? { value: "" };
    const controller = new ExplorerController({
      tree: memory.tree,
      actions: memory.actions,
      selection: memory.selection,
      preferences: memory.preferences,
      loading: options.loading,
      buildItemMenu: (menu, node, source) => {
        options.buildItemMenu?.(menu, node, source);
        menu.addItem((item) =>
          item.setTitle("Custom host action").onClick(() => {
            extensionLog.value = `custom:${node.path}`;
          }),
        );
      },
    });
    return { controller, memory, extensionLog };
  }

  const { Story } = defineMeta({
    title: "Workspace/Panels/Explorer",
    component: WorkspaceExplorer,
    parameters: {
      layout: "fullscreen",
      docs: {
        description: {
          component:
            "Controller-driven hierarchical file explorer panel with injected tree/action adapters.",
        },
        source: {
          code: exampleSources.Basic,
          language: "ts",
          type: "code",
        },
      },
    },
    tags: ["visual-pending"],
  });
</script>

<script lang="ts">
  import "./WorkspaceExplorer.stories.css";

  const loaded = mountExplorer();
  const loadingFixture = mountExplorer({ loading: true });
  const autoRevealFixture = mountExplorer({ autoReveal: false });
  const createFileFixture = mountExplorer();
  const createFolderFixture = mountExplorer();
  const createAtRootFixture = mountExplorer();
  const copyPathFixture = mountExplorer();
  const sortFixture = mountExplorer();
  const renameFixture = mountExplorer();
  const collapseFixture = mountExplorer();
  const dragFixture = mountExplorer();
  const dragToRootFixture = mountExplorer();
  const menuExtFixture = mountExplorer({
    extensionLog: { value: "" },
  });
  const revealFixture = mountExplorer();
  const scrollFixture = mountExplorer({ autoReveal: false });
  const overflowFixture = mountExplorer({ seed: buildOverflowSeed() });
</script>

{#snippet Panel(controller: ExplorerController, hostClass = "")}
  <div
    class={["ui-workspace-explorer-story", hostClass].filter(Boolean).join(" ")}
  >
    <WorkspaceExplorer {controller} />
  </div>
{/snippet}

<Story
  name="Loading and empty tree"
  tags={["visual-pending"]}
  parameters={{
    docs: {
      source: {
        code: exampleSources.Loading,
        language: "ts",
        type: "code",
      },
    },
  }}
>
  {#snippet template()}
    {@render Panel(loadingFixture.controller)}
  {/snippet}
</Story>

<Story
  name="Loaded tree"
  tags={["visual-pending"]}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => {
      expect(canvas.getByText("readme.md")).toBeVisible();
    });
    await expect(canvas.getByText("notes")).toBeVisible();
    await expect(canvas.queryByText("Files", { exact: true })).toBeNull();
    await expect(canvas.getByRole("list", { name: "Files" })).toBeVisible();
    const host = canvasElement.querySelector<HTMLElement>(
      ".ui-workspace-explorer-story",
    );
    const explorer = canvasElement.querySelector<HTMLElement>(
      '[data-ui-component="workspace-explorer"]',
    );
    const toolbar = explorer?.querySelector<HTMLElement>(
      '[data-ui-part="toolbar"]',
    );
    await expect(host).not.toBeNull();
    await expect(explorer).not.toBeNull();
    await expect(toolbar).not.toBeNull();

    const previousBackground = host!.style.getPropertyValue(
      "--ui-workspace-view-background",
    );
    const previousForeground = host!.style.getPropertyValue(
      "--ui-workspace-view-foreground",
    );
    host!.style.setProperty("--ui-workspace-view-background", "rgb(17 31 47)");
    host!.style.setProperty(
      "--ui-workspace-view-foreground",
      "rgb(239 241 243)",
    );
    try {
      await waitFor(() => {
        expect(getComputedStyle(explorer!).backgroundColor).toBe(
          "rgb(17, 31, 47)",
        );
        expect(getComputedStyle(toolbar!).backgroundColor).toBe(
          "rgb(17, 31, 47)",
        );
        expect(getComputedStyle(explorer!).color).toBe("rgb(239, 241, 243)");
      });
    } finally {
      host!.style.setProperty(
        "--ui-workspace-view-background",
        previousBackground,
      );
      host!.style.setProperty(
        "--ui-workspace-view-foreground",
        previousForeground,
      );
    }

    const createFile = canvas.getByRole("button", { name: "Create File" });
    createFile.focus();
    await expect(createFile).toHaveFocus();
    await userEvent.hover(createFile);
    await waitFor(async () => {
      await expect(createFile).toHaveAttribute("data-state", "instant-open");
      await expect(
        within(document.body).getByText("Create File", {
          selector: '[data-slot="tooltip-content"]',
        }),
      ).toBeVisible();
    });
    await userEvent.unhover(createFile);
    await userEvent.keyboard("{Escape}");

    const file = canvas.getByRole("button", { name: "readme.md" });
    await fireEvent.click(file, { ctrlKey: true });
    await waitFor(() => {
      expect(loaded.memory.openRequests.at(-1)).toEqual({
        path: "readme.md",
        options: { disposition: "new-tab" },
      });
    });
    loaded.controller.selectRoot();
  }}
>
  {#snippet template()}
    {@render Panel(loaded.controller)}
  {/snippet}
</Story>

<Story
  name="Create folder selects and renames"
  tags={["visual-pending"]}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: "Create Folder" }),
    );
    await waitFor(() => {
      expect(
        canvasElement.querySelector('[data-path="Untitled"]'),
      ).not.toBeNull();
    });
    const row = canvasElement.querySelector(
      '[data-path="Untitled"]',
    ) as HTMLElement;
    await expect(row).toHaveAttribute("data-active", "true");
    const input = row.querySelector("input");
    await expect(input).toBeTruthy();
    await expect(input).toHaveValue("Untitled");
  }}
>
  {#snippet template()}
    {@render Panel(createFolderFixture.controller)}
  {/snippet}
</Story>

<Story
  name="Create file selects and opens"
  tags={["visual-pending"]}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Create File" }));
    await waitFor(() => {
      expect(
        canvasElement.querySelector('[data-path="Untitled.md"]'),
      ).not.toBeNull();
    });
    const row = canvasElement.querySelector(
      '[data-path="Untitled.md"]',
    ) as HTMLElement;
    await expect(row).toHaveAttribute("data-active", "true");
    await expect(createFileFixture.memory.openedPaths).toContain("Untitled.md");
  }}
>
  {#snippet template()}
    {@render Panel(createFileFixture.controller)}
  {/snippet}
</Story>

<Story
  name="Empty space selects root for create"
  tags={["visual-pending"]}
  play={async ({ canvasElement }) => {
    const { controller } = createAtRootFixture;
    controller.revealPath("notes/alpha.md");
    await waitFor(() => {
      expect(controller.selectedPath).toBe("notes/alpha.md");
    });
    const body = canvasElement.querySelector(
      ".ui-workspace-explorer__body",
    ) as HTMLElement;
    await fireEvent.pointerDown(body);
    expect(controller.selectedPath).toBe("");
    expect(controller.parentPathForCreate()).toBe("");
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Create File" }));
    await waitFor(() => {
      expect(
        canvasElement.querySelector('[data-path="Untitled.md"]'),
      ).not.toBeNull();
    });
    expect(
      canvasElement.querySelector('[data-path="notes/Untitled.md"]'),
    ).toBeNull();
  }}
>
  {#snippet template()}
    {@render Panel(createAtRootFixture.controller)}
  {/snippet}
</Story>

<Story
  name="Copy path submenu"
  tags={["visual-pending"]}
  play={async ({ canvasElement }) => {
    await waitFor(() => {
      expect(
        canvasElement.querySelector('[data-path="readme.md"]'),
      ).not.toBeNull();
    });
    const row = canvasElement.querySelector(
      '[data-path="readme.md"]',
    ) as HTMLElement;
    await fireEvent.contextMenu(row);
    const page = within(document.body);
    await expect(
      page.getByRole("menuitem", { name: "Copy Path" }),
    ).toBeVisible();
    await userEvent.hover(page.getByRole("menuitem", { name: "Copy Path" }));
    await waitFor(async () => {
      await expect(
        page.getByRole("menuitem", { name: "From vault folder" }),
      ).toBeVisible();
    });
    await userEvent.keyboard("{Escape}");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => {
      expect(
        document.body.querySelector('[data-ui-component="workspace-menu"]'),
      ).toBeNull();
    });
  }}
>
  {#snippet template()}
    {@render Panel(copyPathFixture.controller)}
  {/snippet}
</Story>

<Story
  name="Sort menu reorders rows"
  tags={["visual-pending"]}
  play={async ({ canvasElement }) => {
    await userEvent.keyboard("{Escape}");
    const canvas = within(canvasElement);
    await waitFor(() => {
      const sort = canvas.getByRole("button", { name: "Sort Files" });
      expect(sort).toBeVisible();
      expect(getComputedStyle(sort).pointerEvents).not.toBe("none");
    });
    const before = [
      ...canvasElement.querySelectorAll(
        ".ui-workspace-explorer__list > .ui-workspace-explorer__item [data-path]",
      ),
    ]
      .map((el) => el.getAttribute("data-path"))
      .filter(Boolean);
    await userEvent.click(canvas.getByRole("button", { name: "Sort Files" }));
    const page = within(document.body);
    await userEvent.click(
      page.getByRole("menuitem", { name: "Filename (Z to A)" }),
    );
    await waitFor(() => {
      const after = [
        ...canvasElement.querySelectorAll(
          ".ui-workspace-explorer__list > .ui-workspace-explorer__item [data-path]",
        ),
      ].map((el) => el.getAttribute("data-path"));
      expect(after[0]).toBe("notes");
      expect(after).not.toEqual(before);
    });
    await userEvent.keyboard("{Escape}");
  }}
>
  {#snippet template()}
    {@render Panel(sortFixture.controller)}
  {/snippet}
</Story>

<Story
  name="Auto-reveal syncs with preferences"
  tags={["visual-pending"]}
  play={async ({ canvasElement }) => {
    await userEvent.keyboard("{Escape}");
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole("button", {
      name: "Auto-reveal current file",
    });
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    const idleBox = toggle.getBoundingClientRect();
    const explorer = canvasElement.querySelector<HTMLElement>(
      '[data-ui-component="workspace-explorer"]',
    );
    await expect(explorer).not.toBeNull();
    const previousAccent = explorer!.style.getPropertyValue(
      "--ui-workspace-accent",
    );
    explorer!.style.setProperty("--ui-workspace-accent", "rgb(120 48 200)");
    await userEvent.click(toggle);
    await waitFor(() => {
      expect(toggle).toHaveAttribute("aria-pressed", "true");
      expect(autoRevealFixture.memory.preferences.getAutoReveal()).toBe(true);
    });
    const pressedBox = toggle.getBoundingClientRect();
    expect(pressedBox.width).toBe(idleBox.width);
    expect(pressedBox.height).toBe(idleBox.height);
    const icon = toggle.querySelector<HTMLElement>(
      '[data-ui-component="workspace-icon"]',
    );
    await expect(icon).not.toBeNull();
    expect(getComputedStyle(icon!).color).toBe("rgb(120, 48, 200)");
    explorer!.style.setProperty("--ui-workspace-accent", previousAccent);
  }}
>
  {#snippet template()}
    {@render Panel(autoRevealFixture.controller)}
  {/snippet}
</Story>

<Story
  name="Auto-reveal scrolls active into view"
  tags={["visual-pending"]}
  play={async ({ canvasElement }) => {
    const { controller, memory } = scrollFixture;
    controller.toggleCollapseAll();
    controller.toggleCollapseAll();
    // collapse all
    while (controller.expandedPaths.size > 0) {
      controller.toggleCollapseAll();
      break;
    }
    controller.expandedPaths.clear();
    await userEvent.click(
      within(canvasElement).getByRole("button", {
        name: "Auto-reveal current file",
      }),
    );
    memory.setActivePath("notes/deep/nested.md");
    await waitFor(() => {
      expect(controller.expandedPaths.has("notes")).toBe(true);
      expect(controller.expandedPaths.has("notes/deep")).toBe(true);
      expect(controller.selectedPath).toBe("notes/deep/nested.md");
    });
  }}
>
  {#snippet template()}
    {@render Panel(scrollFixture.controller)}
  {/snippet}
</Story>

<Story
  name="Enter starts inline rename"
  tags={["visual-pending"]}
  play={async ({ canvasElement }) => {
    await waitFor(() => {
      expect(
        canvasElement.querySelector('[data-path="readme.md"]'),
      ).not.toBeNull();
    });
    const row = canvasElement.querySelector(
      '[data-path="readme.md"]',
    ) as HTMLElement;
    const title = row.querySelector(
      ".ui-workspace-explorer__title",
    ) as HTMLElement;
    const titleLeft = title.getBoundingClientRect().left;
    row.focus();
    await userEvent.keyboard("{Enter}");
    await waitFor(() => {
      expect(renameFixture.controller.editingPath).toBe("readme.md");
      expect(
        canvasElement.querySelector('[data-path="readme.md"] input'),
      ).toBeTruthy();
    });
    const input = canvasElement.querySelector(
      ".ui-workspace-explorer__rename-input",
    ) as HTMLInputElement;
    const inputStyle = getComputedStyle(input);
    expect(inputStyle.paddingTop).toBe("0px");
    expect(inputStyle.paddingRight).toBe("0px");
    expect(inputStyle.paddingBottom).toBe("0px");
    expect(inputStyle.paddingLeft).toBe("0px");
    expect(
      Math.abs(input.getBoundingClientRect().left - titleLeft),
    ).toBeLessThan(1);
  }}
>
  {#snippet template()}
    {@render Panel(renameFixture.controller)}
  {/snippet}
</Story>

<Story
  name="Toggle collapse expands and collapses all"
  tags={["visual-pending"]}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole("button", { name: "Toggle collapse" });
    await userEvent.click(toggle);
    await waitFor(() => {
      expect(collapseFixture.controller.expandedPaths.size).toBeGreaterThan(0);
    });
    await userEvent.click(toggle);
    await waitFor(() => {
      expect(collapseFixture.controller.expandedPaths.size).toBe(0);
    });
  }}
>
  {#snippet template()}
    {@render Panel(collapseFixture.controller)}
  {/snippet}
</Story>

<Story
  name="Drag file onto folder moves"
  tags={["visual-pending"]}
  play={async ({ canvasElement }) => {
    await waitFor(() => {
      expect(
        canvasElement.querySelector('[data-path="readme.md"]'),
      ).not.toBeNull();
      expect(canvasElement.querySelector('[data-path="empty"]')).not.toBeNull();
    });
    const file = canvasElement.querySelector(
      '[data-path="readme.md"]',
    ) as HTMLElement;
    const folder = canvasElement.querySelector(
      '[data-path="empty"]',
    ) as HTMLElement;
    const dataTransfer = new DataTransfer();
    dataTransfer.setData("text/plain", "readme.md");
    await fireEvent.dragStart(file, { dataTransfer });
    await fireEvent.dragEnter(folder, { dataTransfer });
    await waitFor(() => {
      expect(dragFixture.controller.dropTargetPath).toBe("empty");
      const dropFolder = canvasElement.querySelector(
        '.ui-workspace-explorer__folder[data-drop="true"]',
      ) as HTMLElement;
      expect(dropFolder).not.toBeNull();
      const dropStyle = getComputedStyle(dropFolder);
      expect(Number.parseFloat(dropStyle.borderRadius)).toBeGreaterThan(0);
      expect(Number.parseFloat(dropStyle.paddingBottom)).toBeGreaterThan(0);
    });
    await fireEvent.dragOver(folder, { dataTransfer });
    await fireEvent.drop(folder, { dataTransfer });
    await waitFor(() => {
      expect(
        canvasElement.querySelector('[data-path="empty/readme.md"]'),
      ).not.toBeNull();
    });
  }}
>
  {#snippet template()}
    {@render Panel(dragFixture.controller)}
  {/snippet}
</Story>

<Story
  name="Drag file onto empty space moves to root"
  tags={["visual-pending"]}
  play={async ({ canvasElement }) => {
    const { controller } = dragToRootFixture;
    controller.setExpanded("notes", true);
    await controller.moveNode("readme.md", "notes");
    await waitFor(() => {
      expect(
        canvasElement.querySelector('[data-path="notes/readme.md"]'),
      ).not.toBeNull();
    });
    const file = canvasElement.querySelector(
      '[data-path="notes/readme.md"]',
    ) as HTMLElement;
    const body = canvasElement.querySelector(
      ".ui-workspace-explorer__body",
    ) as HTMLElement;
    const dataTransfer = new DataTransfer();
    dataTransfer.setData("text/plain", "notes/readme.md");
    await fireEvent.dragStart(file, { dataTransfer });
    await fireEvent.dragEnter(body, { dataTransfer });
    await waitFor(() => {
      expect(controller.dropTargetPath).toBe("");
      expect(body.getAttribute("data-drop")).toBe("true");
    });
    await fireEvent.dragOver(body, { dataTransfer });
    await fireEvent.drop(body, { dataTransfer });
    await waitFor(() => {
      expect(
        canvasElement.querySelector('[data-path="readme.md"]'),
      ).not.toBeNull();
      expect(
        canvasElement.querySelector('[data-path="notes/readme.md"]'),
      ).toBeNull();
    });
  }}
>
  {#snippet template()}
    {@render Panel(dragToRootFixture.controller)}
  {/snippet}
</Story>

<Story
  name="Menu extension hook"
  tags={["visual-pending"]}
  parameters={{
    docs: {
      source: {
        code: exampleSources.MenuExtension,
        language: "ts",
        type: "code",
      },
    },
  }}
  play={async ({ canvasElement }) => {
    await waitFor(() => {
      expect(
        canvasElement.querySelector('[data-path="readme.md"]'),
      ).not.toBeNull();
    });
    const row = canvasElement.querySelector(
      '[data-path="readme.md"]',
    ) as HTMLElement;
    await fireEvent.contextMenu(row);
    const page = within(document.body);
    const custom = page.getByRole("menuitem", { name: "Custom host action" });
    await expect(custom).toBeVisible();
    await userEvent.click(custom);
    await waitFor(() => {
      expect(menuExtFixture.extensionLog.value).toBe("custom:readme.md");
    });
    await userEvent.keyboard("{Escape}");
  }}
>
  {#snippet template()}
    {@render Panel(menuExtFixture.controller)}
    <output class="sr-only" data-testid="menu-extension-log">
      {menuExtFixture.extensionLog.value}
    </output>
  {/snippet}
</Story>

<Story
  name="Reveal path flashes and focuses"
  tags={["visual-pending"]}
  parameters={{
    docs: {
      source: {
        code: exampleSources.RevealPath,
        language: "ts",
        type: "code",
      },
    },
  }}
  play={async ({ canvasElement }) => {
    revealFixture.controller.revealPath("notes/zeta.md");
    await waitFor(() => {
      expect(revealFixture.controller.expandedPaths.has("notes")).toBe(true);
      expect(revealFixture.controller.revealState.isFlashing).toBe(true);
      const row = canvasElement.querySelector('[data-path="notes/zeta.md"]');
      expect(row?.classList.contains("is-flashing")).toBe(true);
    });
    const sublist = canvasElement.querySelector(
      ".ui-workspace-explorer__sublist",
    ) as HTMLElement | null;
    expect(sublist).not.toBeNull();
    const guide = getComputedStyle(sublist!);
    expect(Number.parseFloat(guide.borderInlineStartWidth)).toBeGreaterThan(0);
    expect(guide.borderInlineStartStyle).toBe("solid");
    const root = canvasElement.querySelector(
      ".ui-workspace-explorer",
    ) as HTMLElement;
    expect(getComputedStyle(root).fontSize).toBe("13px");
    expect(getComputedStyle(root).borderWidth).toBe("0px");
  }}
>
  {#snippet template()}
    {@render Panel(revealFixture.controller)}
  {/snippet}
</Story>

<Story
  name="Scroll area and long names"
  tags={["visual-pending"]}
  play={async ({ canvasElement }) => {
    const { controller, memory } = overflowFixture;
    controller.expandedPaths.add("archive");
    controller.expandedPaths.add("projects");
    memory.setActivePath(`archive/${LONG_FILE_NAME}`);

    await waitFor(() => {
      expect(
        canvasElement.querySelector(`[data-path="archive/${LONG_FILE_NAME}"]`),
      ).not.toBeNull();
    });

    const root = canvasElement.querySelector(
      ".ui-workspace-explorer",
    ) as HTMLElement;
    const rootStyle = getComputedStyle(root);
    expect(rootStyle.borderWidth).toBe("0px");
    expect(Number.parseFloat(rootStyle.paddingTop)).toBe(0);
    expect(Number.parseFloat(rootStyle.paddingRight)).toBe(0);
    expect(Number.parseFloat(rootStyle.paddingLeft)).toBe(0);

    const body = canvasElement.querySelector(
      ".ui-workspace-explorer__body",
    ) as HTMLElement;
    const bodyStyle = getComputedStyle(body);
    expect(Number.parseFloat(bodyStyle.paddingInlineStart)).toBeGreaterThan(0);
    expect(Number.parseFloat(bodyStyle.paddingInlineEnd)).toBeGreaterThan(0);

    const scrollRoot = canvasElement.querySelector(
      ".ui-workspace-explorer__scroll",
    ) as HTMLElement;
    expect(scrollRoot).not.toBeNull();
    expect(scrollRoot.getAttribute("data-ui-component")).toBe("scroll-area");

    const viewport = scrollRoot.querySelector(
      '[data-slot="scroll-area-viewport"]',
    ) as HTMLElement;
    expect(viewport).not.toBeNull();
    await waitFor(() => {
      expect(viewport.scrollHeight).toBeGreaterThan(viewport.clientHeight);
    });

    await fireEvent.pointerMove(scrollRoot, { clientX: 1, clientY: 1 });
    const scrollbar = scrollRoot.querySelector(
      '[data-slot="scroll-area-scrollbar"][data-orientation="vertical"]',
    ) as HTMLElement | null;
    if (scrollbar) {
      const rootRight = root.getBoundingClientRect().right;
      const barRight = scrollbar.getBoundingClientRect().right;
      expect(Math.abs(barRight - rootRight)).toBeLessThan(2);
    }

    const activeRow = canvasElement.querySelector(
      `[data-path="archive/${LONG_FILE_NAME}"]`,
    ) as HTMLElement;
    expect(activeRow).toHaveAttribute("data-active", "true");
    expect(
      Number.parseInt(getComputedStyle(activeRow).fontWeight, 10),
    ).toBeGreaterThanOrEqual(700);

    const title = activeRow.querySelector(
      ".ui-workspace-explorer__title",
    ) as HTMLElement;
    const titleStyle = getComputedStyle(title);
    expect(titleStyle.textOverflow).toBe("ellipsis");
    expect(titleStyle.whiteSpace).toBe("nowrap");
    expect(title.scrollWidth).toBeGreaterThan(title.clientWidth);

    // Nested sublists must not overflow horizontally (that clipped the right radius).
    const viewportEl = scrollRoot.querySelector(
      '[data-slot="scroll-area-viewport"]',
    ) as HTMLElement;
    expect(viewportEl.scrollWidth).toBeLessThanOrEqual(viewportEl.clientWidth);
    const rootRight = root.getBoundingClientRect().right;
    const rowRight = activeRow.getBoundingClientRect().right;
    expect(rootRight - rowRight).toBeGreaterThanOrEqual(12);
  }}
>
  {#snippet template()}
    {@render Panel(
      overflowFixture.controller,
      "ui-workspace-explorer-story--overflow",
    )}
  {/snippet}
</Story>
