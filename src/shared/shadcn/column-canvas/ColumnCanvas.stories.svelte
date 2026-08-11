<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor } from "storybook/test";
  import ArrowLeft from "@lucide/svelte/icons/arrow-left";
  import CalendarDays from "@lucide/svelte/icons/calendar-days";
  import Check from "@lucide/svelte/icons/check";
  import Circle from "@lucide/svelte/icons/circle";
  import MessageSquare from "@lucide/svelte/icons/message-square";
  import PanelsTopLeft from "@lucide/svelte/icons/panels-top-left";
  import RotateCcw from "@lucide/svelte/icons/rotate-ccw";
  import * as ColumnCanvas from "./index.js";
  import { Badge, type BadgeVariant } from "../badge/index.js";
  import { Button } from "../button/index.js";
  import { Progress } from "../progress/index.js";
  import { Separator } from "../separator/index.js";
  import { createColumnCanvasController } from "./column-canvas-controller.svelte.js";
  import {
    aiDemoCategories,
    aiDemoComponentDetailFields,
    findAiDemoCategory,
    findAiDemoComponent,
  } from "./column-canvas.demo-data.js";
  import {
    findShowcaseBoard,
    findShowcaseProject,
    findShowcaseTask,
    findShowcaseWorkspace,
    showcaseWorkspaces,
    type ShowcaseProject,
    type ShowcaseTask,
  } from "./column-canvas.showcase-data.js";
  import * as exampleSources from "./ColumnCanvas.example-sources.js";

  const { Story } = defineMeta({
    title: "Shadcn/Layout/Column Canvas",
    component: ColumnCanvas.Root,
    parameters: {
      docs: {
        description: {
          component:
            "Controller-driven horizontal column cascade with compound header/toggle/body/item parts, optional collapse rails, and edge resize.",
        },
        source: {
          code: exampleSources.Basic,
          language: "html",
          type: "code",
        },
      },
    },
  });
</script>

<script lang="ts">
  const basicCanvas = createColumnCanvasController({
    columns: {
      categories: {
        defaultWidth: 260,
        minWidth: 220,
        maxWidth: 420,
        pathLevel: 0,
        collapsible: true,
        resizable: true,
      },
      components: {
        defaultWidth: 300,
        minWidth: 240,
        maxWidth: 480,
        pathLevel: 1,
        collapsible: true,
        resizable: true,
      },
      detail: {
        defaultWidth: 340,
        minWidth: 280,
        maxWidth: 520,
        pathLevel: 2,
        collapsible: true,
        resizable: true,
        closeable: true,
      },
    },
    initialPath: ["stable-chat", "composer"],
  });

  const threeLevelCanvas = createColumnCanvasController({
    columns: {
      categories: { defaultWidth: 260, pathLevel: 0, collapsible: true },
      components: { defaultWidth: 300, pathLevel: 1, collapsible: true },
      detail: { defaultWidth: 340, pathLevel: 2, closeable: true },
    },
  });

  const collapseCanvas = createColumnCanvasController({
    columns: {
      components: { defaultWidth: 320, collapsible: true },
    },
  });

  const closeableCanvas = createColumnCanvasController({
    columns: {
      components: { defaultWidth: 300, pathLevel: 0, collapsible: true },
      detail: {
        defaultWidth: 360,
        pathLevel: 1,
        closeable: true,
        collapsible: true,
      },
    },
  });

  const resizeCanvas = createColumnCanvasController({
    columns: {
      components: {
        defaultWidth: 300,
        minWidth: 240,
        maxWidth: 480,
        resizable: true,
      },
    },
  });

  let lastSavedWidth = $state<number | null>(null);
  let lastSavedCollapsed = $state<boolean | null>(null);

  const persistCanvas = createColumnCanvasController({
    columns: {
      components: {
        defaultWidth: 300,
        minWidth: 240,
        maxWidth: 480,
        resizable: true,
        collapsible: true,
      },
    },
    saveDebounceMs: 0,
    onLayoutChange: (layout) => {
      lastSavedWidth = layout.columns.components?.width ?? null;
      lastSavedCollapsed = layout.columns.components?.collapsed ?? null;
    },
  });

  const responsiveCanvas = createColumnCanvasController({
    columns: {
      categories: {
        defaultWidth: 260,
        pathLevel: 0,
        collapsible: true,
        resizable: true,
      },
      components: {
        defaultWidth: 340,
        pathLevel: 1,
        collapsible: true,
        resizable: true,
      },
      detail: {
        defaultWidth: 380,
        pathLevel: 2,
        collapsible: true,
        resizable: true,
        closeable: true,
      },
    },
    initialPath: ["stable-chat", "composer"],
  });

  const fixedCanvas = createColumnCanvasController({
    columns: {
      categories: { defaultWidth: 260, pathLevel: 0, resizable: true },
      components: { defaultWidth: 340, pathLevel: 1, resizable: true },
      detail: { defaultWidth: 380, pathLevel: 2, resizable: true },
    },
    initialPath: ["stable-chat", "composer"],
  });

  function createStickyStoryCanvas() {
    return createColumnCanvasController({
      columns: {
        primary: {
          defaultWidth: 420,
          minWidth: 300,
          maxWidth: 560,
          collapsible: true,
          resizable: true,
        },
        secondary: {
          defaultWidth: 360,
          minWidth: 280,
          maxWidth: 480,
          pathLevel: 1,
          collapsible: true,
          resizable: true,
          closeable: true,
        },
        list: { defaultWidth: 360 },
        detail: { defaultWidth: 420 },
        activity: { defaultWidth: 360 },
      },
      initialPath: ["workspace"],
    });
  }

  const stickyCanvas = createStickyStoryCanvas();
  const stickyFixedCanvas = createStickyStoryCanvas();
  let stickyFixedSecondary = $state(true);

  const showcaseCanvas = createColumnCanvasController({
    columns: {
      workspaces: {
        defaultWidth: 280,
        minWidth: 240,
        maxWidth: 380,
        pathLevel: 0,
        collapsible: true,
        resizable: true,
      },
      projects: {
        defaultWidth: 320,
        minWidth: 260,
        maxWidth: 440,
        pathLevel: 1,
        collapsible: true,
        resizable: true,
        closeable: true,
      },
      boards: {
        defaultWidth: 300,
        minWidth: 250,
        maxWidth: 420,
        pathLevel: 2,
        collapsible: true,
        resizable: true,
        closeable: true,
      },
      tasks: {
        defaultWidth: 380,
        minWidth: 320,
        maxWidth: 520,
        pathLevel: 3,
        collapsible: true,
        resizable: true,
        closeable: true,
      },
      detail: {
        defaultWidth: 440,
        minWidth: 360,
        maxWidth: 620,
        pathLevel: 4,
        collapsible: true,
        resizable: true,
        closeable: true,
      },
      activity: {
        defaultWidth: 340,
        minWidth: 280,
        maxWidth: 460,
        pathLevel: 4,
        collapsible: true,
        resizable: true,
        closeable: true,
      },
    },
    initialPath: ["lapis", "design-core", "column-canvas", "showcase"],
    trailingSpacerWidth: 260,
  });

  const showcaseColumnIds = [
    "workspaces",
    "projects",
    "boards",
    "tasks",
    "detail",
    "activity",
  ] as const;

  const stickyStoryColumns = [
    { id: "primary", title: "Workspace", sticky: true, rows: 36 },
    { id: "secondary", title: "Inbox", sticky: true, rows: 18 },
    { id: "list", title: "Tasks", sticky: false, rows: 12 },
    { id: "detail", title: "Task detail", sticky: false, rows: 9 },
    {
      id: "activity",
      title: "Activity",
      sticky: true,
      rows: 7,
    },
  ] as const;

  const responsiveRows = Array.from({ length: 32 }, (_, index) => ({
    id: `component-${index + 1}`,
    label: `Component ${index + 1}`,
  }));

  const basicSelectedCategory = $derived(
    findAiDemoCategory(basicCanvas.path[0]),
  );
  const basicSelectedComponent = $derived(
    findAiDemoComponent(basicCanvas.path[0], basicCanvas.path[1]),
  );
  const basicDetailFields = $derived(
    basicSelectedCategory && basicSelectedComponent
      ? aiDemoComponentDetailFields(
          basicSelectedComponent,
          basicSelectedCategory,
        )
      : [],
  );
  const threeLevelCategory = $derived(
    findAiDemoCategory(threeLevelCanvas.path[0]),
  );
  const threeLevelComponent = $derived(
    findAiDemoComponent(threeLevelCanvas.path[0], threeLevelCanvas.path[1]),
  );
  const closeableComponent = $derived(
    findAiDemoComponent("stable-chat", closeableCanvas.path[0]),
  );
  const stableChatComponents = $derived(
    findAiDemoCategory("stable-chat")?.components ?? [],
  );
  const showcaseWorkspace = $derived(
    findShowcaseWorkspace(showcaseCanvas.path[0]),
  );
  const showcaseProject = $derived(
    findShowcaseProject(showcaseCanvas.path[0], showcaseCanvas.path[1]),
  );
  const showcaseBoard = $derived(
    findShowcaseBoard(
      showcaseCanvas.path[0],
      showcaseCanvas.path[1],
      showcaseCanvas.path[2],
    ),
  );
  const showcaseTask = $derived(
    findShowcaseTask(
      showcaseCanvas.path[0],
      showcaseCanvas.path[1],
      showcaseCanvas.path[2],
      showcaseCanvas.path[3],
    ),
  );

  function projectStatusVariant(
    status: ShowcaseProject["status"],
  ): BadgeVariant {
    if (status === "At risk") return "destructive";
    if (status === "Complete") return "secondary";
    return "default";
  }

  function taskStatusVariant(status: ShowcaseTask["status"]): BadgeVariant {
    if (status === "Blocked") return "destructive";
    if (status === "Done") return "secondary";
    if (status === "Planned") return "outline";
    return "default";
  }

  function initials(name: string): string {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  function resetShowcaseCanvas(): void {
    for (const id of showcaseColumnIds) {
      showcaseCanvas.open(id);
      showcaseCanvas.expand(id);
      showcaseCanvas.resetWidth(id);
    }
    showcaseCanvas.clear();
    showcaseCanvas.select(0, "lapis");
    showcaseCanvas.select(1, "design-core");
    showcaseCanvas.select(2, "column-canvas");
    showcaseCanvas.select(3, "showcase");
  }

  async function dragResizeHandle(
    handle: HTMLElement,
    deltaX: number,
  ): Promise<void> {
    const bounds = handle.getBoundingClientRect();
    const startX = bounds.left + bounds.width / 2;
    const y = bounds.top + bounds.height / 2;
    await userEvent.pointer([
      {
        keys: "[MouseLeft>]",
        target: handle,
        coords: { clientX: startX, clientY: y },
      },
      {
        target: handle,
        coords: { clientX: startX + deltaX, clientY: y },
      },
      {
        keys: "[/MouseLeft]",
        target: handle,
        coords: { clientX: startX + deltaX, clientY: y },
      },
    ]);
  }
</script>

<Story
  name="Product workspace showcase"
  exportName="ProductWorkspaceShowcase"
  tags={["visual-pending"]}
  play={async ({ canvas }) => {
    resetShowcaseCanvas();

    const root = canvas.getByRole("region", {
      name: "Product delivery workspace",
    });
    await waitFor(() => {
      expect(root.getAttribute("data-display-mode")).toMatch(/wide|compact/);
      expect(showcaseCanvas.path).toEqual([
        "lapis",
        "design-core",
        "column-canvas",
        "showcase",
      ]);
    });
    await expect(
      canvas.getByRole("button", { name: "Lapis workspace" }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(
      canvas.getByRole("heading", {
        name: "Build the complete Column Canvas showcase",
      }),
    ).toBeVisible();
    await expect(canvas.getByText("68% complete")).toBeVisible();

    await userEvent.click(
      canvas.getByRole("button", { name: "Close Task details column" }),
    );
    await expect(
      canvas.queryByRole("button", { name: "Close Task details column" }),
    ).toBeNull();
    await userEvent.click(
      canvas.getByRole("button", {
        name: "Tune vertical wheel handoff",
      }),
    );
    await expect(
      canvas.getByRole("heading", { name: "Tune vertical wheel handoff" }),
    ).toBeVisible();

    await userEvent.click(
      canvas.getByRole("button", { name: "Collapse Tasks column" }),
    );
    await expect(
      canvas.getByRole("button", { name: "Expand Tasks column" }),
    ).toBeVisible();
    await userEvent.click(
      canvas.getByRole("button", { name: "Expand Tasks column" }),
    );

    if (root.getAttribute("data-display-mode") === "wide") {
      root.scrollTo({ left: root.scrollWidth, behavior: "auto" });
      await waitFor(() => {
        expect(
          root.querySelector('[data-column-id="workspaces"]'),
        ).toHaveAttribute("data-sticky-state", "stuck");
        expect(
          root.querySelector('[data-column-id="projects"]'),
        ).toHaveAttribute("data-sticky-state", "stuck");
      });
      await expect(
        canvas.getByRole("button", { name: "Return to Workspaces column" }),
      ).toBeVisible();
      await expect(
        canvas.getByRole("button", { name: "Return to Projects column" }),
      ).toBeVisible();
    } else {
      await expect(
        root.querySelector('[data-ui-part="sticky-rail"]'),
      ).toBeNull();
      expect(root.scrollLeft).toBeGreaterThan(0);
    }
  }}
  parameters={{
    docs: {
      description: {
        story:
          "A realistic six-column product workspace combining a four-level selection path, two leading sticky lanes, responsive presentation, closeable downstream panels, collapse, resize, independent body scrolling, task progress, and activity data.",
      },
      source: {
        code: exampleSources.FullShowcase,
        language: "html",
        type: "code",
      },
    },
  }}
>
  {#snippet template()}
    <div
      class="bg-background flex h-[650px] w-full max-w-[1200px] flex-col overflow-hidden rounded-xl border"
    >
      <header
        class="bg-muted/30 flex flex-wrap items-center justify-between gap-3 px-4 py-3"
      >
        <div class="flex min-w-0 flex-col gap-0.5">
          <div class="flex items-center gap-2">
            <PanelsTopLeft class="size-4" aria-hidden="true" />
            <h2 class="font-semibold">Product delivery workspace</h2>
          </div>
          <p class="text-muted-foreground text-xs">
            Workspaces → projects → boards → tasks → details and activity
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onclick={resetShowcaseCanvas}>
            <RotateCcw data-icon="inline-start" aria-hidden="true" />
            Reset view
          </Button>
          <Button
            size="sm"
            variant="outline"
            onclick={() => {
              for (const id of showcaseColumnIds) showcaseCanvas.open(id);
            }}
          >
            Restore all columns
          </Button>
        </div>
      </header>
      <div class="flex flex-wrap items-center gap-2 border-t px-4 py-2">
        <Badge variant="secondary">Auto responsive</Badge>
        <Badge variant="outline">2 sticky lanes</Badge>
        <Badge variant="outline">5 closeable lanes</Badge>
        <Badge variant="outline">Resizable + collapsible</Badge>
      </div>
      <div class="min-h-0 flex-1 border-t">
        <ColumnCanvas.Root
          controller={showcaseCanvas}
          aria-label="Product delivery workspace"
        >
          <ColumnCanvas.Column
            id="workspaces"
            title="Workspaces"
            count={showcaseWorkspaces.length}
            sticky
          >
            {#snippet stickyRail()}
              <ArrowLeft data-icon="inline-start" aria-hidden="true" />
            {/snippet}
            <ColumnCanvas.Body>
              {#each showcaseWorkspaces as workspace (workspace.id)}
                <ColumnCanvas.Item
                  aria-label={workspace.label}
                  selected={showcaseCanvas.isSelected(0, workspace.id)}
                  onclick={() => showcaseCanvas.select(0, workspace.id)}
                >
                  <span class="flex min-w-0 flex-col gap-1">
                    <span class="flex items-center justify-between gap-2">
                      <span class="truncate font-medium">{workspace.label}</span
                      >
                      <Badge variant="secondary">
                        {workspace.projects.length}
                      </Badge>
                    </span>
                    <span class="text-muted-foreground line-clamp-2 text-xs">
                      {workspace.description}
                    </span>
                  </span>
                </ColumnCanvas.Item>
              {/each}
            </ColumnCanvas.Body>
          </ColumnCanvas.Column>

          <ColumnCanvas.Column
            id="projects"
            title="Projects"
            count={showcaseWorkspace?.projects.length}
            sticky
          >
            {#snippet stickyRail()}
              <ArrowLeft data-icon="inline-start" aria-hidden="true" />
            {/snippet}
            <ColumnCanvas.Body>
              {#each showcaseWorkspace?.projects ?? [] as project (project.id)}
                <ColumnCanvas.Item
                  aria-label={project.label}
                  selected={showcaseCanvas.isSelected(1, project.id)}
                  onclick={() => showcaseCanvas.select(1, project.id)}
                >
                  <span class="flex min-w-0 flex-col gap-1.5">
                    <span class="flex items-center justify-between gap-2">
                      <span class="truncate font-medium">{project.label}</span>
                      <Badge variant={projectStatusVariant(project.status)}>
                        {project.status}
                      </Badge>
                    </span>
                    <span class="text-muted-foreground line-clamp-2 text-xs">
                      {project.summary}
                    </span>
                    <span
                      class="text-muted-foreground flex items-center gap-1 text-xs"
                    >
                      <CalendarDays class="size-3.5" aria-hidden="true" />
                      Due {project.due}
                    </span>
                  </span>
                </ColumnCanvas.Item>
              {/each}
            </ColumnCanvas.Body>
          </ColumnCanvas.Column>

          <ColumnCanvas.Column
            id="boards"
            title={showcaseProject?.label ?? "Boards"}
            count={showcaseProject?.boards.length}
          >
            <ColumnCanvas.Body>
              {#each showcaseProject?.boards ?? [] as board (board.id)}
                <ColumnCanvas.Item
                  aria-label={board.label}
                  selected={showcaseCanvas.isSelected(2, board.id)}
                  onclick={() => showcaseCanvas.select(2, board.id)}
                >
                  <span class="flex min-w-0 flex-col gap-1">
                    <span class="flex items-center justify-between gap-2">
                      <span class="truncate font-medium">{board.label}</span>
                      <Badge variant="outline">{board.tasks.length} tasks</Badge
                      >
                    </span>
                    <span class="text-muted-foreground line-clamp-2 text-xs">
                      {board.summary}
                    </span>
                  </span>
                </ColumnCanvas.Item>
              {/each}
            </ColumnCanvas.Body>
          </ColumnCanvas.Column>

          <ColumnCanvas.Column
            id="tasks"
            title="Tasks"
            count={showcaseBoard?.tasks.length}
          >
            <ColumnCanvas.Body>
              {#each showcaseBoard?.tasks ?? [] as task (task.id)}
                <ColumnCanvas.Item
                  aria-label={task.title}
                  selected={showcaseCanvas.isSelected(3, task.id)}
                  onclick={() => showcaseCanvas.select(3, task.id)}
                >
                  <span class="flex min-w-0 flex-col gap-1.5">
                    <span class="flex items-center justify-between gap-2">
                      <span class="text-muted-foreground text-xs font-medium">
                        {task.key}
                      </span>
                      <Badge variant={taskStatusVariant(task.status)}>
                        {task.status}
                      </Badge>
                    </span>
                    <span class="line-clamp-2 font-medium">{task.title}</span>
                    <span
                      class="text-muted-foreground flex items-center justify-between gap-2 text-xs"
                    >
                      <span>{task.assignee}</span>
                      <span>{task.due}</span>
                    </span>
                  </span>
                </ColumnCanvas.Item>
              {/each}
            </ColumnCanvas.Body>
          </ColumnCanvas.Column>

          <ColumnCanvas.Column
            id="detail"
            title="Task details"
            count={showcaseTask?.checklist.length}
          >
            <ColumnCanvas.Body>
              {#if showcaseTask}
                <article class="flex flex-col gap-4 p-4">
                  <div class="flex flex-col gap-2">
                    <div class="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{showcaseTask.key}</Badge>
                      <Badge variant={taskStatusVariant(showcaseTask.status)}>
                        {showcaseTask.status}
                      </Badge>
                      <Badge variant="secondary">
                        {showcaseTask.priority} priority
                      </Badge>
                    </div>
                    <h2 class="text-lg leading-snug font-semibold">
                      {showcaseTask.title}
                    </h2>
                    <p class="text-muted-foreground text-sm leading-relaxed">
                      {showcaseTask.summary}
                    </p>
                  </div>

                  <div class="flex flex-col gap-2">
                    <div class="flex items-center justify-between text-xs">
                      <span class="font-medium">Progress</span>
                      <span class="text-muted-foreground">
                        {showcaseTask.progress}% complete
                      </span>
                    </div>
                    <Progress
                      value={showcaseTask.progress}
                      aria-label="Task completion"
                    />
                  </div>

                  <div class="grid grid-cols-2 gap-3 text-sm">
                    <div class="bg-muted/50 flex flex-col gap-1 rounded-lg p-3">
                      <span class="text-muted-foreground text-xs">Owner</span>
                      <span class="font-medium">{showcaseTask.assignee}</span>
                    </div>
                    <div class="bg-muted/50 flex flex-col gap-1 rounded-lg p-3">
                      <span class="text-muted-foreground text-xs">Due date</span
                      >
                      <span class="font-medium">{showcaseTask.due}</span>
                    </div>
                  </div>

                  <div class="flex flex-wrap gap-1.5">
                    {#each showcaseTask.tags as tag (tag)}
                      <Badge variant="outline">{tag}</Badge>
                    {/each}
                  </div>

                  <Separator />

                  <section class="flex flex-col gap-2.5">
                    <h3 class="text-sm font-semibold">Checklist</h3>
                    {#each showcaseTask.checklist as item (item.id)}
                      <div class="flex items-start gap-2 text-sm">
                        {#if item.done}
                          <Check
                            class="text-primary mt-0.5 size-4"
                            aria-hidden="true"
                          />
                        {:else}
                          <Circle
                            class="text-muted-foreground mt-0.5 size-4"
                            aria-hidden="true"
                          />
                        {/if}
                        <span class:text-muted-foreground={item.done}>
                          {item.label}
                        </span>
                      </div>
                    {/each}
                  </section>
                </article>
              {/if}
            </ColumnCanvas.Body>
          </ColumnCanvas.Column>

          <ColumnCanvas.Column
            id="activity"
            title="Activity"
            count={showcaseTask?.activity.length}
          >
            <ColumnCanvas.Body>
              {#if showcaseTask}
                <div class="flex flex-col gap-4 p-4">
                  <div class="flex items-center gap-2">
                    <MessageSquare class="size-4" aria-hidden="true" />
                    <p class="text-sm font-semibold">Latest updates</p>
                  </div>
                  <ol class="flex flex-col gap-4">
                    {#each showcaseTask.activity as activity (activity.id)}
                      <li class="flex gap-3">
                        <Badge variant="outline">
                          {initials(activity.person)}
                        </Badge>
                        <span class="flex min-w-0 flex-1 flex-col gap-0.5">
                          <span class="text-sm">
                            <strong>{activity.person}</strong>
                            {activity.action}
                          </span>
                          <span class="text-muted-foreground text-xs">
                            {activity.time}
                          </span>
                        </span>
                      </li>
                    {/each}
                  </ol>
                </div>
              {/if}
            </ColumnCanvas.Body>
          </ColumnCanvas.Column>
        </ColumnCanvas.Root>
      </div>
    </div>
  {/snippet}
</Story>

<Story
  name="All features"
  play={async ({ canvasElement, canvas }) => {
    basicCanvas.open("detail");
    basicCanvas.expand("categories");
    basicCanvas.expand("components");
    basicCanvas.expand("detail");
    // `select` toggles — clear first so setup does not deselect the initial path.
    basicCanvas.clear();
    basicCanvas.select(0, "stable-chat");
    basicCanvas.select(1, "composer");
    basicCanvas.open("detail");

    await expect(canvas.getByText("Categories")).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: "Stable Chat" }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(
      canvas.getByRole("button", { name: "Composer" }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(canvas.getByRole("button", { name: "Name" })).toBeVisible();
    await expect(
      canvas.getByText("@lapismd/design-core/ai/chat"),
    ).toBeVisible();

    await userEvent.click(
      canvas.getByRole("button", { name: "Message Bubble" }),
    );
    await expect(canvas.getByText("message-bubble")).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: "Close Details column" }),
    ).toBeVisible();
    const root = canvas.getByRole("region", { name: "Column canvas" });
    if (root.getAttribute("data-display-mode") === "compact") {
      await expect(
        canvas.queryByRole("separator", { name: "Resize Details column" }),
      ).toBeNull();
    } else {
      await expect(
        canvas.getByRole("separator", { name: "Resize Details column" }),
      ).toBeVisible();
    }

    await userEvent.click(
      canvas.getByRole("button", { name: "Close Details column" }),
    );
    await expect(
      canvas.queryByRole("button", { name: "Close Details column" }),
    ).toBeNull();
    await userEvent.click(canvas.getByRole("button", { name: "Open detail" }));
    await expect(canvas.getByText("message-bubble")).toBeVisible();

    if (root.getAttribute("data-display-mode") !== "compact") {
      const handle = canvas.getByRole("separator", {
        name: "Resize Stable Chat column",
      });
      const before = basicCanvas.getWidth("components");
      await dragResizeHandle(handle, 40);
      await waitFor(() => {
        expect(basicCanvas.getWidth("components")).toBeGreaterThan(before);
      });
      const column = canvasElement.querySelector(
        '[data-ui-part="column"][data-column-id="components"]',
      );
      await expect(column).toHaveStyle({
        width: `${basicCanvas.getWidth("components")}px`,
      });
    }
  }}
  parameters={{
    docs: {
      source: {
        code: exampleSources.Basic,
        language: "html",
        type: "code",
      },
    },
  }}
>
  {#snippet template()}
    <div class="flex h-[460px] w-full flex-col gap-2">
      <div class="flex flex-wrap gap-2 px-1">
        <button
          type="button"
          class="hover:bg-muted rounded border px-2 py-1 text-sm"
          onclick={() => basicCanvas.open("detail")}
        >
          Open detail
        </button>
        <p class="text-muted-foreground self-center text-xs">
          Always-mounted columns; pathLevel + close/collapse own visibility.
          Details repeats fields from the selected component.
        </p>
      </div>
      <div class="min-h-0 flex-1">
        <ColumnCanvas.Root controller={basicCanvas}>
          <ColumnCanvas.Column
            id="categories"
            title="Categories"
            count={aiDemoCategories.length}
          >
            <ColumnCanvas.Body>
              {#each aiDemoCategories as category (category.id)}
                <ColumnCanvas.Item
                  aria-label={category.label}
                  selected={basicCanvas.isSelected(0, category.id)}
                  onclick={() => basicCanvas.select(0, category.id)}
                >
                  <span class="flex min-w-0 flex-col gap-0.5">
                    <span class="font-medium">{category.label}</span>
                    <span class="text-muted-foreground line-clamp-2 text-xs">
                      {category.description}
                    </span>
                  </span>
                </ColumnCanvas.Item>
              {/each}
            </ColumnCanvas.Body>
          </ColumnCanvas.Column>

          <ColumnCanvas.Column
            id="components"
            title={basicSelectedCategory?.label ?? "Components"}
            count={basicSelectedCategory?.components.length}
          >
            <ColumnCanvas.Body>
              {#each basicSelectedCategory?.components ?? [] as component (component.id)}
                <ColumnCanvas.Item
                  aria-label={component.label}
                  selected={basicCanvas.isSelected(1, component.id)}
                  onclick={() => basicCanvas.select(1, component.id)}
                >
                  <span class="flex min-w-0 flex-col gap-0.5">
                    <span class="font-medium">{component.label}</span>
                    <span class="text-muted-foreground line-clamp-2 text-xs">
                      {component.role}
                    </span>
                  </span>
                </ColumnCanvas.Item>
              {/each}
            </ColumnCanvas.Body>
          </ColumnCanvas.Column>

          <ColumnCanvas.Column
            id="detail"
            title="Details"
            count={basicDetailFields.length || undefined}
          >
            <ColumnCanvas.Body>
              {#each basicDetailFields as field (field.id)}
                <ColumnCanvas.Item aria-label={field.label} disabled>
                  <span class="flex min-w-0 flex-col gap-0.5">
                    <span class="text-muted-foreground text-xs">
                      {field.label}
                    </span>
                    <span class="font-medium break-all">{field.value}</span>
                  </span>
                </ColumnCanvas.Item>
              {/each}
            </ColumnCanvas.Body>
          </ColumnCanvas.Column>
        </ColumnCanvas.Root>
      </div>
    </div>
  {/snippet}
</Story>

<Story
  name="Three-level cascade"
  play={async ({ canvas }) => {
    threeLevelCanvas.clear();
    await userEvent.click(canvas.getByRole("button", { name: "Stable Chat" }));
    await expect(canvas.getByText("Composer")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Composer" }));
    await expect(
      canvas.getByText("@lapismd/design-core/ai/chat"),
    ).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: "Close Composer column" }),
    ).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Composer" }));
    await expect(canvas.queryByText("@lapismd/design-core/ai/chat")).toBeNull();
    await expect(canvas.getByText("Send Button")).toBeVisible();
  }}
  parameters={{
    docs: {
      source: {
        code: exampleSources.ThreeLevel,
        language: "html",
        type: "code",
      },
    },
  }}
>
  {#snippet template()}
    <div class="h-[440px] w-full">
      <ColumnCanvas.Root controller={threeLevelCanvas}>
        <ColumnCanvas.Column
          id="categories"
          title="Categories"
          count={aiDemoCategories.length}
        >
          <ColumnCanvas.Body>
            {#each aiDemoCategories as category (category.id)}
              <ColumnCanvas.Item
                aria-label={category.label}
                selected={threeLevelCanvas.isSelected(0, category.id)}
                onclick={() => threeLevelCanvas.select(0, category.id)}
              >
                <span class="flex min-w-0 flex-col gap-0.5">
                  <span class="font-medium">{category.label}</span>
                  <span class="text-muted-foreground line-clamp-2 text-xs">
                    {category.description}
                  </span>
                </span>
              </ColumnCanvas.Item>
            {/each}
          </ColumnCanvas.Body>
        </ColumnCanvas.Column>

        <ColumnCanvas.Column
          id="components"
          title={threeLevelCategory?.label ?? "Components"}
          count={threeLevelCategory?.components.length}
        >
          <ColumnCanvas.Body>
            {#each threeLevelCategory?.components ?? [] as component (component.id)}
              <ColumnCanvas.Item
                aria-label={component.label}
                selected={threeLevelCanvas.isSelected(1, component.id)}
                onclick={() => threeLevelCanvas.select(1, component.id)}
              >
                <span class="flex min-w-0 flex-col gap-0.5">
                  <span class="font-medium">{component.label}</span>
                  <span class="text-muted-foreground line-clamp-2 text-xs">
                    {component.role}
                  </span>
                </span>
              </ColumnCanvas.Item>
            {/each}
          </ColumnCanvas.Body>
        </ColumnCanvas.Column>

        <ColumnCanvas.Column
          id="detail"
          title={threeLevelComponent?.label ?? "Detail"}
        >
          <ColumnCanvas.Body>
            {#if threeLevelComponent}
              <div
                class="text-muted-foreground flex flex-col gap-3 p-3 text-sm"
              >
                <p>{threeLevelComponent.role}</p>
                <code class="bg-muted rounded px-2 py-1 text-xs break-all">
                  {threeLevelComponent.importPath}
                </code>
              </div>
            {/if}
          </ColumnCanvas.Body>
        </ColumnCanvas.Column>
      </ColumnCanvas.Root>
    </div>
  {/snippet}
</Story>

<Story
  name="Closeable columns"
  play={async ({ canvas }) => {
    closeableCanvas.clear();
    closeableCanvas.open("detail");
    await userEvent.click(
      canvas.getByRole("button", { name: "Message Bubble" }),
    );
    await expect(canvas.getByText("Detail")).toBeVisible();
    await expect(
      canvas.getByText("@lapismd/design-core/ai/chat"),
    ).toBeVisible();
    await userEvent.click(
      canvas.getByRole("button", { name: "Close Detail column" }),
    );
    await expect(canvas.queryByText("@lapismd/design-core/ai/chat")).toBeNull();
    await expect(
      canvas.queryByRole("button", { name: "Close Detail column" }),
    ).toBeNull();
    await userEvent.click(canvas.getByRole("button", { name: "Open detail" }));
    await expect(
      canvas.getByText("@lapismd/design-core/ai/chat"),
    ).toBeVisible();
  }}
  parameters={{
    docs: {
      source: {
        code: exampleSources.Closeable,
        language: "html",
        type: "code",
      },
    },
  }}
>
  {#snippet template()}
    <div class="flex h-[420px] w-full flex-col gap-2">
      <div class="flex gap-2 px-1">
        <button
          type="button"
          class="hover:bg-muted rounded border px-2 py-1 text-sm"
          onclick={() => closeableCanvas.open("detail")}
        >
          Open detail
        </button>
      </div>
      <div class="min-h-0 flex-1">
        <ColumnCanvas.Root controller={closeableCanvas}>
          <ColumnCanvas.Column
            id="components"
            title="Stable Chat"
            count={stableChatComponents.length}
          >
            <ColumnCanvas.Body>
              {#each stableChatComponents as component (component.id)}
                <ColumnCanvas.Item
                  aria-label={component.label}
                  selected={closeableCanvas.isSelected(0, component.id)}
                  onclick={() => closeableCanvas.select(0, component.id)}
                >
                  <span class="flex min-w-0 flex-col gap-0.5">
                    <span class="font-medium">{component.label}</span>
                    <span class="text-muted-foreground line-clamp-2 text-xs">
                      {component.role}
                    </span>
                  </span>
                </ColumnCanvas.Item>
              {/each}
            </ColumnCanvas.Body>
          </ColumnCanvas.Column>

          <ColumnCanvas.Column id="detail" title="Detail">
            <ColumnCanvas.Body>
              {#if closeableComponent}
                <div
                  class="text-muted-foreground flex flex-col gap-3 p-3 text-sm"
                >
                  <p class="text-foreground font-medium">
                    {closeableComponent.label}
                  </p>
                  <p>{closeableComponent.role}</p>
                  <code class="bg-muted rounded px-2 py-1 text-xs break-all">
                    {closeableComponent.importPath}
                  </code>
                </div>
              {/if}
            </ColumnCanvas.Body>
          </ColumnCanvas.Column>
        </ColumnCanvas.Root>
      </div>
    </div>
  {/snippet}
</Story>

<Story
  name="Collapse and expand"
  play={async ({ canvas }) => {
    collapseCanvas.expand("components");
    await expect(canvas.getByText("Components")).toBeVisible();
    await userEvent.click(
      canvas.getByRole("button", { name: "Collapse Components column" }),
    );
    await expect(
      canvas.getByRole("button", { name: "Expand Components column" }),
    ).toBeVisible();
    await expect(canvas.queryByText("Tool Calls")).toBeNull();
    await userEvent.click(
      canvas.getByRole("button", { name: "Expand Components column" }),
    );
    await expect(canvas.getByText("Tool Calls")).toBeVisible();
  }}
  parameters={{
    docs: {
      source: {
        code: exampleSources.CollapseAndExpand,
        language: "html",
        type: "code",
      },
    },
  }}
>
  {#snippet template()}
    <div class="h-[420px] w-full">
      <ColumnCanvas.Root controller={collapseCanvas}>
        <ColumnCanvas.Column
          id="components"
          title="Components"
          count={stableChatComponents.length}
        >
          <ColumnCanvas.Body>
            {#each stableChatComponents as component (component.id)}
              <ColumnCanvas.Item>
                <span class="flex min-w-0 flex-col gap-0.5">
                  <span class="font-medium">{component.label}</span>
                  <span class="text-muted-foreground line-clamp-2 text-xs">
                    {component.role}
                  </span>
                </span>
              </ColumnCanvas.Item>
            {/each}
          </ColumnCanvas.Body>
        </ColumnCanvas.Column>
      </ColumnCanvas.Root>
    </div>
  {/snippet}
</Story>

<Story
  name="Resizable columns"
  play={async ({ canvasElement, canvas }) => {
    resizeCanvas.resetWidth("components");
    const handle = canvas.getByRole("separator", {
      name: "Resize Components column",
    });
    await expect(handle).toHaveAttribute("aria-orientation", "vertical");
    const column = canvasElement.querySelector(
      '[data-ui-part="column"][data-column-id="components"]',
    );
    await expect(column).not.toBeNull();
    await dragResizeHandle(handle, 40);
    await waitFor(() => {
      expect(resizeCanvas.getWidth("components")).toBeGreaterThan(300);
    });
    await expect(column).toHaveStyle({
      width: `${resizeCanvas.getWidth("components")}px`,
    });
  }}
  parameters={{
    docs: {
      source: {
        code: exampleSources.Resizable,
        language: "html",
        type: "code",
      },
    },
  }}
>
  {#snippet template()}
    <div class="h-[420px] w-full">
      <ColumnCanvas.Root controller={resizeCanvas} displayMode="fixed">
        <ColumnCanvas.Column
          id="components"
          title="Components"
          count={stableChatComponents.length}
        >
          <ColumnCanvas.Body>
            {#each stableChatComponents as component (component.id)}
              <ColumnCanvas.Item>
                <span class="flex min-w-0 flex-col gap-0.5">
                  <span class="font-medium">{component.label}</span>
                  <span class="text-muted-foreground line-clamp-2 text-xs">
                    {component.role}
                  </span>
                </span>
              </ColumnCanvas.Item>
            {/each}
            <p class="text-muted-foreground px-3 py-2 text-xs">
              Drag the trailing edge to resize. Width:
              <output>{resizeCanvas.getWidth("components")}px</output>
            </p>
          </ColumnCanvas.Body>
        </ColumnCanvas.Column>
      </ColumnCanvas.Root>
    </div>
  {/snippet}
</Story>

<Story
  name="Persisted widths"
  play={async ({ canvas }) => {
    lastSavedWidth = null;
    lastSavedCollapsed = null;
    persistCanvas.resetWidth("components");
    persistCanvas.expand("components");
    await persistCanvas.flushSave();

    const handle = canvas.getByRole("separator", {
      name: "Resize Components column",
    });
    await dragResizeHandle(handle, 50);
    await persistCanvas.flushSave();
    await waitFor(() => {
      expect(lastSavedWidth).not.toBeNull();
      expect(lastSavedWidth!).toBeGreaterThan(300);
    });

    await userEvent.click(
      canvas.getByRole("button", { name: "Collapse Components column" }),
    );
    await persistCanvas.flushSave();
    await waitFor(() => {
      expect(lastSavedCollapsed).toBe(true);
    });
  }}
  parameters={{
    docs: {
      source: {
        code: exampleSources.PersistedWidths,
        language: "html",
        type: "code",
      },
    },
  }}
>
  {#snippet template()}
    <div class="h-[420px] w-full">
      <ColumnCanvas.Root controller={persistCanvas} displayMode="fixed">
        <ColumnCanvas.Column
          id="components"
          title="Components"
          count={stableChatComponents.length}
        >
          <ColumnCanvas.Body>
            {#each stableChatComponents as component (component.id)}
              <ColumnCanvas.Item>
                <span class="flex min-w-0 flex-col gap-0.5">
                  <span class="font-medium">{component.label}</span>
                  <span class="text-muted-foreground line-clamp-2 text-xs">
                    {component.role}
                  </span>
                </span>
              </ColumnCanvas.Item>
            {/each}
            <p class="text-muted-foreground px-3 py-2 text-xs">
              Layout saves through the injected persistence adapter.
            </p>
          </ColumnCanvas.Body>
        </ColumnCanvas.Column>
      </ColumnCanvas.Root>
    </div>
  {/snippet}
</Story>

<Story
  name="Responsive adaptive canvas"
  tags={["visual-pending"]}
  play={async ({ canvas, canvasElement }) => {
    responsiveCanvas.expand("categories");
    responsiveCanvas.expand("components");
    responsiveCanvas.expand("detail");
    responsiveCanvas.resetWidth("categories");
    responsiveCanvas.resetWidth("components");
    responsiveCanvas.resetWidth("detail");
    responsiveCanvas.open("detail");
    responsiveCanvas.clear();
    responsiveCanvas.select(0, "stable-chat");
    responsiveCanvas.select(1, "composer");

    const root = canvas.getByRole("region", { name: "Responsive canvas" });
    const pageHost = canvas.getByRole("region", {
      name: "Scrollable page host",
    });
    expect(pageHost.scrollHeight).toBeGreaterThan(pageHost.clientHeight);
    expect(getComputedStyle(pageHost).scrollbarWidth).toBe("none");
    await waitFor(() => {
      expect(root.getAttribute("data-display-mode")).toMatch(/wide|compact/);
      expect(root.scrollLeft).toBeGreaterThan(0);
    });
    if (root.getAttribute("data-display-mode") === "compact") {
      await expect(canvas.queryByRole("separator")).toBeNull();
    } else {
      await expect(canvas.getAllByRole("separator")).toHaveLength(3);
    }

    const detail = canvasElement.querySelector<HTMLElement>(
      '[data-ui-part="column"][data-column-id="detail"]',
    );
    await expect(detail).not.toBeNull();
    await waitFor(() => {
      const rootStyle = getComputedStyle(root);
      const contentEnd =
        root.getBoundingClientRect().right -
        Number.parseFloat(rootStyle.paddingInlineEnd);
      expect(
        Math.abs(detail!.getBoundingClientRect().right - contentEnd),
      ).toBeLessThan(2);
    });
    expect(responsiveCanvas.getWidth("detail")).toBe(380);
  }}
  parameters={{
    docs: {
      source: {
        code: exampleSources.ResponsiveAdaptive,
        language: "html",
        type: "code",
      },
    },
  }}
>
  {#snippet template()}
    <div
      role="region"
      aria-label="Scrollable page host"
      data-testid="responsive-scroll-host"
      class="h-[460px] w-full max-w-[1100px] [scrollbar-width:none] overflow-x-hidden overflow-y-auto [&::-webkit-scrollbar]:hidden"
    >
      <div data-testid="responsive-stage" class="h-[460px] w-full">
        <ColumnCanvas.Root
          controller={responsiveCanvas}
          aria-label="Responsive canvas"
        >
          <ColumnCanvas.Column id="categories" title="Categories">
            <ColumnCanvas.Body>
              <ColumnCanvas.Item
                selected={responsiveCanvas.isSelected(0, "stable-chat")}
                onclick={() => responsiveCanvas.select(0, "stable-chat")}
              >
                Stable Chat
              </ColumnCanvas.Item>
            </ColumnCanvas.Body>
          </ColumnCanvas.Column>

          <ColumnCanvas.Column id="components" title="Components">
            <ColumnCanvas.Body data-testid="responsive-scroll-body">
              {#each responsiveRows as row (row.id)}
                <ColumnCanvas.Item
                  selected={responsiveCanvas.isSelected(1, row.id)}
                  onclick={() => responsiveCanvas.select(1, row.id)}
                >
                  {row.label}
                </ColumnCanvas.Item>
              {/each}
            </ColumnCanvas.Body>
          </ColumnCanvas.Column>

          <ColumnCanvas.Column id="detail" title="Detail">
            <ColumnCanvas.Body>
              <div class="flex flex-col gap-2 p-3 text-sm">
                <strong>Composer</strong>
                <span class="text-muted-foreground">
                  The active column follows the deepest visible path.
                </span>
              </div>
            </ColumnCanvas.Body>
          </ColumnCanvas.Column>
        </ColumnCanvas.Root>
      </div>
      <div class="text-muted-foreground h-40 border-t px-3 py-4 text-xs">
        Surrounding page content receives vertical motion once neither the
        column body nor the horizontal canvas can move.
      </div>
    </div>
  {/snippet}
</Story>

<Story
  name="Fixed compatibility"
  tags={["visual-pending"]}
  play={async ({ canvas, canvasElement }) => {
    const root = canvas.getByRole("region", { name: "Fixed canvas" });
    await expect(root).toHaveAttribute("data-display-mode", "fixed");
    expect(root.scrollLeft).toBe(0);
    await expect(canvas.getAllByRole("separator")).toHaveLength(3);

    const widths = Array.from(
      canvasElement.querySelectorAll<HTMLElement>('[data-ui-part="column"]'),
      (column) => Math.round(column.getBoundingClientRect().width),
    );
    expect(widths).toEqual([260, 340, 380]);
  }}
  parameters={{
    docs: {
      source: {
        code: exampleSources.FixedCompatibility,
        language: "html",
        type: "code",
      },
    },
  }}
>
  {#snippet template()}
    <div class="h-[460px] w-[min(100%,700px)]">
      <ColumnCanvas.Root
        controller={fixedCanvas}
        displayMode="fixed"
        aria-label="Fixed canvas"
      >
        <ColumnCanvas.Column id="categories" title="Categories">
          <ColumnCanvas.Body><p class="p-3">Categories</p></ColumnCanvas.Body>
        </ColumnCanvas.Column>
        <ColumnCanvas.Column id="components" title="Components">
          <ColumnCanvas.Body><p class="p-3">Components</p></ColumnCanvas.Body>
        </ColumnCanvas.Column>
        <ColumnCanvas.Column id="detail" title="Detail">
          <ColumnCanvas.Body><p class="p-3">Detail</p></ColumnCanvas.Body>
        </ColumnCanvas.Column>
      </ColumnCanvas.Root>
    </div>
  {/snippet}
</Story>

<Story
  name="Sticky floating columns"
  tags={["visual-pending"]}
  play={async ({ canvas }) => {
    stickyCanvas.expand("primary");
    stickyCanvas.expand("secondary");
    stickyCanvas.resetWidth("primary");
    stickyCanvas.resetWidth("secondary");
    stickyCanvas.open("secondary");
    stickyCanvas.clear();
    stickyCanvas.select(0, "workspace");

    const root = canvas.getByRole("region", { name: "Sticky canvas" });
    await waitFor(() => {
      expect(root).toHaveAttribute("data-display-mode", "wide");
      expect(root.querySelector('[data-column-id="primary"]')).toHaveAttribute(
        "data-sticky-state",
      );
    });
    root.scrollTo({ left: root.scrollWidth, behavior: "auto" });
    await waitFor(() => {
      expect(root.querySelector('[data-column-id="primary"]')).toHaveAttribute(
        "data-sticky-state",
        "stuck",
      );
      expect(
        root.querySelector('[data-column-id="secondary"]'),
      ).toHaveAttribute("data-sticky-state", "stuck");
    });
    await expect(
      canvas.getByRole("button", { name: "Return to Workspace column" }),
    ).toBeVisible();
    await expect(canvas.getByTestId("sticky-rail-primary")).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: "Return to Workspace column" }),
    ).toHaveAttribute("data-variant", "outline");
    await expect(
      root.querySelector(
        '[data-sticky-for="primary"] [data-ui-part="sticky-rail-label"]',
      ),
    ).toHaveTextContent("Workspace");
    await expect(
      root.querySelector('[data-column-id="activity"]'),
    ).not.toHaveAttribute("data-sticky-state");
  }}
  parameters={{
    docs: {
      source: {
        code: exampleSources.StickyFloating,
        language: "html",
        type: "code",
      },
    },
  }}
>
  {#snippet template()}
    <div class="h-[460px] w-full max-w-[1100px]">
      <ColumnCanvas.Root controller={stickyCanvas} aria-label="Sticky canvas">
        {#each stickyStoryColumns as column (column.id)}
          <ColumnCanvas.Column
            id={column.id}
            title={column.title}
            sticky={column.sticky}
          >
            {#snippet stickyRail()}
              <ArrowLeft
                data-testid={`sticky-rail-${column.id}`}
                data-icon="inline-start"
                aria-hidden="true"
              />
            {/snippet}
            <ColumnCanvas.Body data-testid={`sticky-body-${column.id}`}>
              {#each Array.from({ length: column.rows }) as _, index}
                <ColumnCanvas.Item>
                  {column.title} item {index + 1}
                </ColumnCanvas.Item>
              {/each}
            </ColumnCanvas.Body>
          </ColumnCanvas.Column>
        {/each}
      </ColumnCanvas.Root>
    </div>
  {/snippet}
</Story>

<Story
  name="Sticky fixed columns"
  tags={["visual-pending"]}
  play={async ({ canvas }) => {
    stickyFixedCanvas.expand("primary");
    stickyFixedCanvas.expand("secondary");
    stickyFixedCanvas.resetWidth("primary");
    stickyFixedCanvas.resetWidth("secondary");
    stickyFixedSecondary = true;
    stickyFixedCanvas.open("secondary");
    stickyFixedCanvas.clear();
    stickyFixedCanvas.select(0, "workspace");

    const root = canvas.getByRole("region", {
      name: "Sticky fixed canvas",
    });
    await expect(root).toHaveAttribute("data-display-mode", "fixed");
    expect(root.scrollLeft).toBe(0);
    root.scrollTo({ left: root.scrollWidth, behavior: "auto" });
    await waitFor(() => {
      expect(root.querySelector('[data-column-id="primary"]')).toHaveAttribute(
        "data-sticky-state",
        "stuck",
      );
      expect(
        root.querySelector('[data-column-id="secondary"]'),
      ).toHaveAttribute("data-sticky-state", "stuck");
    });
    await expect(
      canvas.getByRole("button", { name: "Return to Inbox column" }),
    ).toBeVisible();
  }}
  parameters={{
    docs: {
      source: {
        code: exampleSources.StickyFixed,
        language: "html",
        type: "code",
      },
    },
  }}
>
  {#snippet template()}
    <div class="flex h-[500px] w-full max-w-[1100px] flex-col gap-2">
      <div class="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onclick={() => stickyFixedCanvas.clear()}
        >
          Hide Inbox
        </Button>
        <Button
          size="sm"
          variant="outline"
          onclick={() => {
            stickyFixedCanvas.clear();
            stickyFixedCanvas.select(0, "workspace");
            stickyFixedCanvas.open("secondary");
          }}
        >
          Restore Inbox
        </Button>
        <Button
          size="sm"
          variant="outline"
          onclick={() => (stickyFixedSecondary = !stickyFixedSecondary)}
        >
          {stickyFixedSecondary ? "Disable" : "Enable"} Inbox sticky
        </Button>
      </div>
      <div class="min-h-0 flex-1">
        <ColumnCanvas.Root
          controller={stickyFixedCanvas}
          displayMode="fixed"
          aria-label="Sticky fixed canvas"
        >
          {#each stickyStoryColumns as column (column.id)}
            <ColumnCanvas.Column
              id={column.id}
              title={column.title}
              sticky={column.id === "secondary"
                ? stickyFixedSecondary
                : column.sticky}
            >
              {#snippet stickyRail()}
                <ArrowLeft
                  data-testid={`sticky-fixed-rail-${column.id}`}
                  data-icon="inline-start"
                  aria-hidden="true"
                />
              {/snippet}
              <ColumnCanvas.Body>
                {#each Array.from({ length: column.rows }) as _, index}
                  <ColumnCanvas.Item>
                    {column.title} item {index + 1}
                  </ColumnCanvas.Item>
                {/each}
              </ColumnCanvas.Body>
            </ColumnCanvas.Column>
          {/each}
        </ColumnCanvas.Root>
      </div>
    </div>
  {/snippet}
</Story>
