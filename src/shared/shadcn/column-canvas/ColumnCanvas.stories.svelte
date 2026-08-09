<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor } from "storybook/test";
  import * as ColumnCanvas from "./index.js";
  import { createColumnCanvasController } from "./column-canvas-controller.svelte.js";
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
      categories: { defaultWidth: 260, collapsible: true },
      items: { defaultWidth: 300, collapsible: true },
    },
  });

  const threeLevelCanvas = createColumnCanvasController({
    columns: {
      groups: { defaultWidth: 240, collapsible: true },
      items: { defaultWidth: 280, collapsible: true },
      detail: { defaultWidth: 320 },
    },
  });

  const collapseCanvas = createColumnCanvasController({
    columns: {
      refs: { defaultWidth: 280, collapsible: true },
    },
  });

  const resizeCanvas = createColumnCanvasController({
    columns: {
      workspace: {
        defaultWidth: 280,
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
      workspace: {
        defaultWidth: 280,
        minWidth: 240,
        maxWidth: 480,
        resizable: true,
        collapsible: true,
      },
    },
    saveDebounceMs: 0,
    onLayoutChange: (layout) => {
      lastSavedWidth = layout.columns.workspace?.width ?? null;
      lastSavedCollapsed = layout.columns.workspace?.collapsed ?? null;
    },
  });

  const categories = [
    { id: "design", label: "Design" },
    { id: "engineering", label: "Engineering" },
  ] as const;

  const itemsByCategory = {
    design: [
      { id: "tokens", label: "Tokens" },
      { id: "components", label: "Components" },
    ],
    engineering: [
      { id: "api", label: "API" },
      { id: "ci", label: "CI" },
    ],
  } as const;

  const groups = [
    {
      id: "product",
      label: "Product",
      items: [
        {
          id: "roadmap",
          label: "Roadmap",
          detail: "Q3 milestones and owners.",
        },
        {
          id: "launch",
          label: "Launch",
          detail: "Go-to-market checklist.",
        },
      ],
    },
    {
      id: "platform",
      label: "Platform",
      items: [
        { id: "auth", label: "Auth", detail: "Session and SSO work." },
        {
          id: "billing",
          label: "Billing",
          detail: "Invoice pipeline status.",
        },
      ],
    },
  ] as const;

  const selectedGroup = $derived(
    groups.find((group) => group.id === threeLevelCanvas.path[0]),
  );
  const selectedItem = $derived(
    selectedGroup?.items.find((item) => item.id === threeLevelCanvas.path[1]),
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
  name="Basic cascade"
  play={async ({ canvas }) => {
    basicCanvas.clear();
    await expect(canvas.getByText("Categories")).toBeVisible();
    await expect(canvas.queryByText("Items")).toBeNull();
    await userEvent.click(canvas.getByRole("button", { name: "Design" }));
    await expect(canvas.getByText("Items")).toBeVisible();
    await expect(canvas.getByText("Tokens")).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: "Design" }),
    ).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(canvas.getByRole("button", { name: "Design" }));
    await expect(canvas.queryByText("Items")).toBeNull();
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
    <div class="h-[360px] w-full">
      <ColumnCanvas.Root controller={basicCanvas}>
        <ColumnCanvas.Column
          id="categories"
          title="Categories"
          count={categories.length}
        >
          <ColumnCanvas.Body>
            {#each categories as category (category.id)}
              <ColumnCanvas.Item
                selected={basicCanvas.isSelected(0, category.id)}
                onclick={() => basicCanvas.select(0, category.id)}
              >
                {category.label}
              </ColumnCanvas.Item>
            {/each}
          </ColumnCanvas.Body>
        </ColumnCanvas.Column>

        {#if basicCanvas.path[0]}
          {@const categoryKey = basicCanvas
            .path[0] as keyof typeof itemsByCategory}
          <ColumnCanvas.Column
            id="items"
            title="Items"
            count={itemsByCategory[categoryKey].length}
          >
            <ColumnCanvas.Body>
              {#each itemsByCategory[categoryKey] as item (item.id)}
                <ColumnCanvas.Item>{item.label}</ColumnCanvas.Item>
              {/each}
            </ColumnCanvas.Body>
          </ColumnCanvas.Column>
        {/if}
      </ColumnCanvas.Root>
    </div>
  {/snippet}
</Story>

<Story
  name="Three-level cascade"
  play={async ({ canvas }) => {
    threeLevelCanvas.clear();
    await userEvent.click(canvas.getByRole("button", { name: "Product" }));
    await expect(canvas.getByText("Roadmap")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Roadmap" }));
    await expect(canvas.getByText("Q3 milestones and owners.")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Roadmap" }));
    await expect(canvas.queryByText("Q3 milestones and owners.")).toBeNull();
    await expect(canvas.getByText("Launch")).toBeVisible();
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
    <div class="h-[400px] w-full">
      <ColumnCanvas.Root controller={threeLevelCanvas}>
        <ColumnCanvas.Column id="groups" title="Groups" count={groups.length}>
          <ColumnCanvas.Body>
            {#each groups as group (group.id)}
              <ColumnCanvas.Item
                selected={threeLevelCanvas.isSelected(0, group.id)}
                onclick={() => threeLevelCanvas.select(0, group.id)}
              >
                {group.label}
              </ColumnCanvas.Item>
            {/each}
          </ColumnCanvas.Body>
        </ColumnCanvas.Column>

        {#if selectedGroup}
          <ColumnCanvas.Column
            id="items"
            title={selectedGroup.label}
            count={selectedGroup.items.length}
          >
            <ColumnCanvas.Body>
              {#each selectedGroup.items as item (item.id)}
                <ColumnCanvas.Item
                  selected={threeLevelCanvas.isSelected(1, item.id)}
                  onclick={() => threeLevelCanvas.select(1, item.id)}
                >
                  {item.label}
                </ColumnCanvas.Item>
              {/each}
            </ColumnCanvas.Body>
          </ColumnCanvas.Column>
        {/if}

        {#if selectedItem}
          <ColumnCanvas.Column id="detail" title={selectedItem.label}>
            <ColumnCanvas.Body>
              <p class="text-muted-foreground p-3 text-sm">
                {selectedItem.detail}
              </p>
            </ColumnCanvas.Body>
          </ColumnCanvas.Column>
        {/if}
      </ColumnCanvas.Root>
    </div>
  {/snippet}
</Story>

<Story
  name="Collapse and expand"
  play={async ({ canvas }) => {
    collapseCanvas.expand("refs");
    await expect(canvas.getByText("Branches")).toBeVisible();
    await userEvent.click(
      canvas.getByRole("button", { name: "Collapse Branches column" }),
    );
    await expect(
      canvas.getByRole("button", { name: "Expand Branches column" }),
    ).toBeVisible();
    await expect(canvas.queryByText("main")).toBeNull();
    await userEvent.click(
      canvas.getByRole("button", { name: "Expand Branches column" }),
    );
    await expect(canvas.getByText("main")).toBeVisible();
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
    <div class="h-[320px] w-full">
      <ColumnCanvas.Root controller={collapseCanvas}>
        <ColumnCanvas.Column id="refs" title="Branches" count={2}>
          <ColumnCanvas.Body>
            <ColumnCanvas.Item>main</ColumnCanvas.Item>
            <ColumnCanvas.Item>feature/canvas</ColumnCanvas.Item>
          </ColumnCanvas.Body>
        </ColumnCanvas.Column>
      </ColumnCanvas.Root>
    </div>
  {/snippet}
</Story>

<Story
  name="Resizable columns"
  play={async ({ canvasElement, canvas }) => {
    resizeCanvas.resetWidth("workspace");
    const handle = canvas.getByRole("separator", {
      name: "Resize Workspace column",
    });
    await expect(handle).toHaveAttribute("aria-orientation", "vertical");
    const column = canvasElement.querySelector(
      '[data-ui-part="column"][data-column-id="workspace"]',
    );
    await expect(column).not.toBeNull();
    await dragResizeHandle(handle, 40);
    await waitFor(() => {
      expect(resizeCanvas.getWidth("workspace")).toBeGreaterThan(280);
    });
    await expect(column).toHaveStyle({
      width: `${resizeCanvas.getWidth("workspace")}px`,
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
    <div class="h-[320px] w-full">
      <ColumnCanvas.Root controller={resizeCanvas}>
        <ColumnCanvas.Column id="workspace" title="Workspace">
          <ColumnCanvas.Body>
            <p class="p-3 text-sm">
              Drag the trailing edge to resize. Width:
              <output>{resizeCanvas.getWidth("workspace")}px</output>
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
    persistCanvas.resetWidth("workspace");
    persistCanvas.expand("workspace");
    await persistCanvas.flushSave();

    const handle = canvas.getByRole("separator", {
      name: "Resize Workspace column",
    });
    await dragResizeHandle(handle, 50);
    await persistCanvas.flushSave();
    await waitFor(() => {
      expect(lastSavedWidth).not.toBeNull();
      expect(lastSavedWidth!).toBeGreaterThan(280);
    });

    await userEvent.click(
      canvas.getByRole("button", { name: "Collapse Workspace column" }),
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
    <div class="h-[320px] w-full">
      <ColumnCanvas.Root controller={persistCanvas}>
        <ColumnCanvas.Column id="workspace" title="Workspace">
          <ColumnCanvas.Body>
            <p class="p-3 text-sm">
              Layout saves through the injected persistence adapter.
            </p>
          </ColumnCanvas.Body>
        </ColumnCanvas.Column>
      </ColumnCanvas.Root>
    </div>
  {/snippet}
</Story>
