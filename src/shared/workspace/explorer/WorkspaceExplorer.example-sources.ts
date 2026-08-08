export const Basic = `<script lang="ts">
  import {
    WorkspaceExplorer,
    ExplorerController,
    createMemoryExplorerAdapter,
  } from "@lapismd/design-core/workspace/explorer";

  const memory = createMemoryExplorerAdapter([
    {
      path: "notes",
      name: "notes",
      kind: "folder",
      children: [
        { path: "notes/alpha.md", name: "alpha.md", kind: "file" },
      ],
    },
    { path: "readme.md", name: "readme.md", kind: "file" },
  ]);

  const controller = new ExplorerController({
    tree: memory.tree,
    actions: memory.actions,
    selection: memory.selection,
    preferences: memory.preferences,
  });
</script>

<WorkspaceExplorer {controller} />`;

export const Loading = `<script lang="ts">
  import {
    WorkspaceExplorer,
    ExplorerController,
    createMemoryExplorerAdapter,
  } from "@lapismd/design-core/workspace/explorer";

  const memory = createMemoryExplorerAdapter([]);
  const controller = new ExplorerController({
    tree: memory.tree,
    actions: memory.actions,
    selection: memory.selection,
    preferences: memory.preferences,
    loading: true,
  });
</script>

<WorkspaceExplorer {controller} />`;

export const MenuExtension = `<script lang="ts">
  import {
    WorkspaceExplorer,
    ExplorerController,
    createMemoryExplorerAdapter,
  } from "@lapismd/design-core/workspace/explorer";

  const memory = createMemoryExplorerAdapter([/* nodes */]);
  const controller = new ExplorerController({
    tree: memory.tree,
    actions: memory.actions,
    selection: memory.selection,
    preferences: memory.preferences,
    buildItemMenu(menu, node) {
      menu.addItem((item) =>
        item.setTitle("Custom host action").onClick(() => {
          console.log("custom", node.path);
        }),
      );
    },
  });
</script>

<WorkspaceExplorer {controller} />`;

export const RevealPath = `<script lang="ts">
  import {
    WorkspaceExplorer,
    ExplorerController,
    createMemoryExplorerAdapter,
  } from "@lapismd/design-core/workspace/explorer";

  const memory = createMemoryExplorerAdapter([/* nodes */]);
  const controller = new ExplorerController({
    tree: memory.tree,
    actions: memory.actions,
    selection: memory.selection,
    preferences: memory.preferences,
  });

  // Host command / active-file sync
  controller.revealPath("notes/zeta.md");
</script>

<WorkspaceExplorer {controller} />`;

export const ControllerApi = `new ExplorerController({
  tree,
  actions,
  selection?,      // optional active-path sync
  preferences?,    // optional auto-reveal persistence
  getIcon?,        // WorkspaceIcon name resolver
  buildItemMenu?,  // append after built-ins; source is always "explorer"
  onFileDragStart?,
  labels?,
  loading?,
});

controller.revealPath(path);
controller.setSelectedPath(path);
controller.refresh();
controller.setLoading(false);`;
