<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor, within } from "storybook/test";
  import KanbanBoard from "./KanbanBoard.svelte";
  import * as exampleSources from "./KanbanBoard.example-sources.js";
  const { Story } = defineMeta({
    title: "Workspace/Components/Kanban Board",
    component: KanbanBoard,
    parameters: {
      docs: {
        source: { code: exampleSources.Basic, language: "tsx", type: "code" },
      },
    },
  });
</script>

<script lang="ts">
  import type { KanbanColumnData } from "./kanban-types.js";
  import { Button } from "@lapismd/design-core/shadcn/button";
  let opened = $state("");
  function buildColumns(): KanbanColumnData[] {
    return [
      {
        id: "virtual-activity",
        label: "Activity",
        color: "#0e7490",
        primary: true,
        cards: Array.from({ length: 300 }, (_, index) => ({
          id: `virtual-${index + 1}`,
          title: `Long lane card ${index + 1}`,
          color: "#0e7490",
          tabLabel: "Fixture repository",
          metadata: [],
          summary: "A variable-height maintenance card. ".repeat(
            (index % 3) + 1,
          ),
          badge: { label: "Status", value: "Checks passed", color: "#15803d" },
        })),
      },
    ];
  }
  let columns = $state(buildColumns());
  let dragColumns = $state([
    ...buildColumns(),
    {
      id: "virtual-target",
      label: "Target",
      color: "#1d4ed8",
      cards: [],
    } as KanbanColumnData,
  ]);
  function prepend() {
    const column = columns[0]!;
    columns = [
      {
        ...column,
        cards: [
          { ...column.cards[0]!, id: "prepended", title: "Prepended card" },
          ...column.cards,
        ],
      },
    ];
  }
  function move(id: string, targetId: string) {
    const source = dragColumns.find((column) =>
      column.cards.some((card) => card.id === id),
    );
    const target = dragColumns.find((column) => column.id === targetId);
    if (!source || !target || source === target) return;
    const card = source.cards.find((card) => card.id === id)!;
    source.cards = source.cards.filter((card) => card.id !== id);
    target.cards = [...target.cards, { ...card, color: target.color }];
  }
</script>

<Story
  name="Virtualized long lane"
  tags={["visual-pending"]}
  play={async ({ canvasElement }) => {
    const c = within(canvasElement);
    await c.findByRole("heading", { name: "Activity" });
    await waitFor(() =>
      expect(
        canvasElement.querySelectorAll('[data-ui-component="kanban-card"]')
          .length,
      ).toBeLessThan(30),
    );
    const viewport = canvasElement.querySelector<HTMLElement>(
      '.column-stack-scroll > [data-slot="scroll-area-viewport"]',
    )!;
    viewport.scrollTop = viewport.scrollHeight;
    const last = await c.findByRole("button", {
      name: /^Open card: Long lane card 300\./,
    });
    await expect(last).toBeVisible();
    await userEvent.hover(last);
    await userEvent.click(last);
    await expect(c.getByRole("status")).toHaveTextContent("Opened virtual-300");
    await userEvent.click(c.getByRole("button", { name: "Prepend card" }));
    await waitFor(() =>
      expect(
        c.getByRole("button", { name: /^Open card: Long lane card 300\./ }),
      ).toBeVisible(),
    );
    last.focus();
    await userEvent.keyboard("{ArrowUp}");
    await waitFor(() =>
      expect(
        canvasElement.querySelector(".kanban-card.is-selected"),
      ).toHaveTextContent("Long lane card 299"),
    );
    await expect(
      c.getByRole("button", { name: /^Open card: Long lane card 299\./ }),
    ).toBeVisible();
    const extent = viewport.scrollHeight;
    await userEvent.click(c.getByRole("button", { name: "Expand last card" }));
    await waitFor(() =>
      expect(viewport.scrollHeight).toBeGreaterThan(extent + 100),
    );
    expect(
      canvasElement.querySelectorAll('[data-ui-component="kanban-card"]')
        .length,
    ).toBeLessThan(30);
  }}
>
  {#snippet template()}
    <div style="height:36rem;--kanban-board-height:100%">
      <KanbanBoard
        {columns}
        movesEnabled={false}
        onCardOpen={(id) => (opened = `Opened ${id}`)}
        onMoveCardToColumn={() => {}}
        onReorderColumns={() => {}}
        onEditColumn={() => {}}
      />
    </div>
    <output>{opened}</output>
    <Button onclick={prepend}>Prepend card</Button>
    <Button
      onclick={() => {
        columns[0]!.cards.at(-1)!.metadata = Array.from(
          { length: 20 },
          (_, index) => ({
            id: `detail-${index}`,
            label: `Detail ${index + 1}`,
            value: "Expanded variable-height content",
          }),
        );
      }}>Expand last card</Button
    >
  {/snippet}
</Story>

<Story
  name="Virtualized draggable lane"
  tags={["visual-pending"]}
  play={async ({ canvasElement }) => {
    const c = within(canvasElement);
    await c.findByRole("heading", { name: "Activity" });
    await waitFor(() =>
      expect(
        canvasElement.querySelectorAll('[data-ui-component="kanban-card"]')
          .length,
      ).toBeLessThan(30),
    );
  }}
>
  {#snippet template()}
    <div style="height:36rem;--kanban-board-height:100%">
      <KanbanBoard
        columns={dragColumns}
        onMoveCardToColumn={move}
        onReorderColumns={() => {}}
        onEditColumn={() => {}}
      />
    </div>
  {/snippet}
</Story>
