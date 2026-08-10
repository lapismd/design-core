<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor } from "storybook/test";
  import * as ColumnCanvas from "./index.js";
  import { Button } from "../button/index.js";
  import { createColumnCanvasController } from "./column-canvas-controller.svelte.js";
  import {
    aiDemoCategories,
    aiDemoComponentDetailFields,
    findAiDemoCategory,
    findAiDemoComponent,
  } from "./column-canvas.demo-data.js";
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
      expect(root).toHaveAttribute("data-display-mode", "compact");
      expect(root.scrollLeft).toBeGreaterThan(0);
    });
    await expect(canvas.queryByRole("separator")).toBeNull();

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
      class="h-[460px] w-[min(100%,700px)] [scrollbar-width:none] overflow-x-hidden overflow-y-auto [&::-webkit-scrollbar]:hidden"
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
                  The active compact column follows the deepest visible path.
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
