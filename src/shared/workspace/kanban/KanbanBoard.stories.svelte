<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor, within } from "storybook/test";
  import { MarkdownComposer } from "@lapismd/design-core/chat";
  import * as exampleSources from "./KanbanBoard.example-sources.js";
  import KanbanBoard from "./KanbanBoard.svelte";
  import "./KanbanBoard.stories.css";

  const { Story } = defineMeta({
    title: "Workspace/Components/Kanban Board",
    component: KanbanBoard,
    parameters: {
      docs: {
        description: {
          component:
            "Generic kanban board ported from the legacy Fizzy task board: collapsible columns, drag & drop, pinned-card corner, golden tickets, card detail and full-screen column view. Consumers own grouping, persistence, and card body content.",
        },
        source: {
          code: exampleSources.Basic,
          language: "ts",
          type: "code",
        },
      },
    },
  });
</script>

<script lang="ts">
  import type {
    KanbanCardData,
    KanbanColumnData,
    KanbanDetailBodyContext,
  } from "./kanban-types.js";

  const COLOR_NOT_NOW = "#475569";
  const COLOR_MAYBE = "#64748b";
  const COLOR_BACKLOG = "#1d4ed8";
  const COLOR_PROGRESS = "#b45309";
  const COLOR_DONE = "#4d7c0f";

  function card(
    id: string,
    title: string,
    color: string,
    extra: Partial<KanbanCardData> = {},
  ): KanbanCardData {
    return {
      id,
      title,
      color,
      createdAt: "Sep 12",
      updatedAt: "Oct 28",
      statusText: "open",
      priorityText: "medium",
      counters: { zap: 0, comments: 0 },
      ...extra,
    };
  }

  function buildBoardColumns(): KanbanColumnData[] {
    return [
      {
        id: "not-now",
        label: "Not Now",
        color: COLOR_NOT_NOW,
        isFixedPosition: true,
        excludeFromAutoExpand: true,
        cards: [
          card("nn-1", "Someday roadmap sketch", COLOR_NOT_NOW, {
            statusText: "not-now",
            priorityText: "low",
            stamp: {
              label: "Not Now",
              tone: "not-now",
              date: "Oct 2",
              caption: "by System",
            },
          }),
        ],
      },
      {
        id: "maybe",
        label: "Maybe",
        color: COLOR_MAYBE,
        primary: true,
        locked: true,
        isFixedPosition: true,
        cards: [
          card("mb-1", "Explore plugin telemetry", COLOR_MAYBE, {
            pinned: true,
            tags: ["research"],
          }),
          card("mb-2", "Evaluate offline sync", COLOR_MAYBE, {
            priorityText: "none",
          }),
        ],
      },
      {
        id: "backlog",
        label: "Backlog",
        color: COLOR_BACKLOG,
        cards: [
          card("bl-1", "Draft the release announcement", COLOR_BACKLOG, {
            tags: ["docs", "release"],
            progress: { done: 2, total: 5 },
          }),
          card("bl-2", "Audit plugin settings", COLOR_BACKLOG, {
            pinned: true,
            golden: true,
            closureMessage:
              'Moves to "Not Now" in 3 days if there\'s no activity.',
          }),
          card("bl-3", "Refresh onboarding copy", COLOR_BACKLOG),
        ],
      },
      {
        id: "in-progress",
        label: "In Progress",
        color: COLOR_PROGRESS,
        cards: [
          card("ip-1", "Port kanban board", COLOR_PROGRESS, {
            tags: ["design-core"],
            progress: { done: 3, total: 4 },
          }),
          card("ip-2", "Cold Storybook pass", COLOR_PROGRESS),
        ],
      },
      {
        id: "done",
        label: "Done",
        color: COLOR_DONE,
        isCompleted: true,
        excludeFromAutoExpand: true,
        cards: [
          card("dn-1", "Token audit", COLOR_DONE, {
            statusText: "done",
            stamp: {
              label: "Done",
              tone: "done",
              date: "Oct 21",
              caption: "Completed",
            },
          }),
        ],
      },
    ];
  }

  function createStoryBoard() {
    const board = $state({
      columns: buildBoardColumns(),
      log: "No board action",
    });

    function findCard(cardId: string): {
      column: KanbanColumnData;
      card: KanbanCardData;
      index: number;
    } | null {
      for (const column of board.columns) {
        const index = column.cards.findIndex(
          (candidate) => candidate.id === cardId,
        );
        if (index >= 0) {
          return { column, card: column.cards[index]!, index };
        }
      }
      return null;
    }

    return {
      board,
      handlers: {
        onMoveCardToColumn(cardId: string, columnId: string) {
          const found = findCard(cardId);
          const target = board.columns.find((column) => column.id === columnId);
          if (!found || !target || found.column.id === target.id) return;
          found.column.cards.splice(found.index, 1);
          target.cards.push({ ...found.card, color: target.color });
          board.log = `Moved ${found.card.title} to ${target.label}`;
        },
        onReorderColumns(orderedIds: string[]) {
          const fixed = board.columns.filter(
            (column) => column.isFixedPosition,
          );
          const reorderable = orderedIds
            .map((id) => board.columns.find((column) => column.id === id))
            .filter((column): column is KanbanColumnData => !!column);
          board.columns = [...fixed, ...reorderable];
          board.log = `Reordered columns: ${orderedIds.join(", ")}`;
        },
        onEditColumn(
          columnId: string,
          meta: { title?: string; color?: string },
        ) {
          const column = board.columns.find(
            (candidate) => candidate.id === columnId,
          );
          if (!column) return;
          if (meta.title) column.label = meta.title;
          if (meta.color) {
            column.color = meta.color;
            for (const item of column.cards) item.color = meta.color;
          }
          board.log = `Edited column ${column.label}`;
        },
        onTogglePin(cardId: string) {
          const found = findCard(cardId);
          if (!found) return;
          found.card.pinned = !found.card.pinned;
          board.log = found.card.pinned
            ? `Pinned ${found.card.title}`
            : `Unpinned ${found.card.title}`;
        },
        onPromoteGolden(cardId: string) {
          const found = findCard(cardId);
          if (!found) return;
          found.card.golden = true;
          board.log = `Promoted ${found.card.title}`;
        },
        onSaveTitle(cardId: string, title: string) {
          const found = findCard(cardId);
          if (!found) return null;
          found.card.title = title;
          board.log = `Renamed card to ${title}`;
          return null;
        },
      },
    };
  }

  type StoryBoard = ReturnType<typeof createStoryBoard>;

  const fullBoard = createStoryBoard();
  const collapseBoard = createStoryBoard();
  const optionsBoard = createStoryBoard();
  const detailBoard = createStoryBoard();
  const columnViewBoard = createStoryBoard();
  const keyboardBoard = createStoryBoard();

  let noteDraft = $state("Body preview text.");
</script>

{#snippet detailBody(context: KanbanDetailBodyContext)}
  {#if context.editing}
    <div class="detail-note-surface edit-mode">
      <MarkdownComposer
        presentation="document"
        label="Card body editor"
        inputLabel="Card body"
        bind:value={noteDraft}
        showHint={false}
        submitOnEnter={false}
        submitLabel="Save body"
        onSubmit={() => context.setEditing(false)}
      />
    </div>
  {:else}
    <div class="detail-note-surface">
      <div class="ui-kanban-story-note">
        {noteDraft} Press Edit or the E key to modify this surface.
      </div>
    </div>
  {/if}
{/snippet}

<Story
  name="Full board"
  tags={["visual-pending"]}
  play={async ({ canvas, canvasElement }) => {
    const backlogHeading = canvas.getByRole("heading", { name: "Backlog" });
    await expect(backlogHeading).toBeVisible();
    const backlog = backlogHeading.closest("[data-ui-part='root']");
    await expect(
      within(backlog as HTMLElement).getByText("3", {
        selector: ".column-count",
      }),
    ).toBeVisible();
    const pins = canvas.getByRole("region", { name: "Pinned cards" });
    await expect(pins).toBeVisible();
    await expect(
      within(pins).getByRole("button", {
        name: /Open pinned card Maybe Explore plugin telemetry/,
      }),
    ).toBeVisible();
    expect(
      canvasElement.querySelectorAll(".kanban-card.is-golden").length,
    ).toBeGreaterThan(0);
  }}
>
  {#snippet template()}
    <KanbanBoard
      columns={fullBoard.board.columns}
      {...fullBoard.handlers}
      ariaLabel="Release board"
      brandLabel="Atlas"
      {detailBody}
    />
    <output class="sr-only">{fullBoard.board.log}</output>
  {/snippet}
</Story>

<Story
  name="Collapse and expand columns"
  tags={["visual-pending"]}
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Collapse 3 Backlog" }),
    );
    const expand = canvas.getByRole("button", { name: /Expand 3 Backlog/ });
    await expect(expand).toBeVisible();
    await expect(expand).toHaveTextContent("3");
    await userEvent.click(expand);
    await expect(
      canvas.getByRole("button", { name: "Collapse 3 Backlog" }),
    ).toBeVisible();
  }}
>
  {#snippet template()}
    <KanbanBoard
      columns={collapseBoard.board.columns}
      {...collapseBoard.handlers}
      ariaLabel="Collapse demo board"
    />
    <output class="sr-only">{collapseBoard.board.log}</output>
  {/snippet}
</Story>

<Story
  name="Column options menu"
  tags={["visual-pending"]}
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Column options for Backlog" }),
    );
    const page = within(document.body);
    await userEvent.click(page.getByRole("menuitem", { name: "Edit Column" }));
    const nameInput = page.getByLabelText("Name");
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, "Queue");
    await userEvent.click(
      page.getByRole("button", { name: "Choose column color #6d28d9" }),
    );
    await userEvent.click(page.getByRole("button", { name: "Save" }));
    await expect(canvas.getByRole("heading", { name: "Queue" })).toBeVisible();
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Edited column Queue",
    );
  }}
>
  {#snippet template()}
    <KanbanBoard
      columns={optionsBoard.board.columns}
      {...optionsBoard.handlers}
      ariaLabel="Column options board"
    />
    <output class="sr-only">{optionsBoard.board.log}</output>
  {/snippet}
</Story>

<Story
  name="Card detail dialog"
  tags={["visual-pending"]}
  parameters={{
    docs: {
      source: {
        code: exampleSources.DetailBody,
        language: "ts",
        type: "code",
      },
    },
  }}
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", {
        name: /Open card: Draft the release announcement/,
      }),
    );
    const page = within(document.body);
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveTextContent("Backlog");

    await userEvent.click(
      page.getByRole("button", { name: /Edit card title/ }),
    );
    const titleInput = page.getByRole("textbox", { name: "Card title" });
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, "Draft the launch announcement");
    await userEvent.keyboard("{Enter}");
    await expect(
      page.getByRole("button", { name: /Edit card title/ }),
    ).toHaveTextContent("Draft the launch announcement");

    await userEvent.click(page.getByRole("button", { name: "In Progress" }));
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Moved Draft the launch announcement to In Progress",
    );
    const inProgress = canvas
      .getByRole("heading", { name: /In Progress/ })
      .closest("[data-ui-part='root']");
    await expect(
      within(inProgress as HTMLElement).getByRole("button", {
        name: /Open card: Draft the launch announcement/,
      }),
    ).toBeVisible();
  }}
>
  {#snippet template()}
    <KanbanBoard
      columns={detailBoard.board.columns}
      {...detailBoard.handlers}
      ariaLabel="Detail demo board"
      brandLabel="Atlas"
      {detailBody}
    />
    <output class="sr-only">{detailBoard.board.log}</output>
  {/snippet}
</Story>

<Story
  name="Column view"
  tags={["visual-pending"]}
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Maximize Backlog column" }),
    );
    const page = within(document.body);
    await expect(page.getByText("Full-screen column view")).toBeVisible();
    const dialog = page.getByRole("dialog");
    await expect(
      within(dialog).getByRole("button", {
        name: /Open card: Audit plugin settings/,
      }),
    ).toBeVisible();
    await userEvent.click(page.getByRole("button", { name: /Back to board/ }));
    await waitFor(() =>
      expect(page.queryByText("Full-screen column view")).toBeNull(),
    );
  }}
>
  {#snippet template()}
    <KanbanBoard
      columns={columnViewBoard.board.columns}
      {...columnViewBoard.handlers}
      ariaLabel="Column view board"
    />
    <output class="sr-only">{columnViewBoard.board.log}</output>
  {/snippet}
</Story>

<Story
  name="Keyboard navigation"
  tags={["visual-pending"]}
  play={async ({ canvas, canvasElement }) => {
    const selected = canvas.getByRole("button", {
      name: /Open card: Explore plugin telemetry/,
    });
    await selected.focus();
    await userEvent.keyboard("{ArrowRight}");
    const selectedColumn = canvasElement.querySelector(
      ".kanban-column.is-selected",
    );
    expect(selectedColumn).not.toBeNull();
    await expect(
      within(selectedColumn as HTMLElement).getByRole("heading", {
        name: /Backlog/,
      }),
    ).toBeVisible();

    await userEvent.keyboard("{Shift>}{ArrowRight}{/Shift}");
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Moved Draft the release announcement to In Progress",
    );

    // Enter on the focused card lifts it into a dnd-kit keyboard drag
    // (same behaviour as the legacy board) and re-selects its own column.
    await userEvent.keyboard("{Enter}");
    await waitFor(() =>
      expect(selected).toHaveAttribute("aria-grabbed", "true"),
    );
    const draggedColumn = canvasElement.querySelector(
      ".kanban-column.is-selected",
    );
    await expect(
      within(draggedColumn as HTMLElement).getByRole("heading", {
        name: /Maybe/,
      }),
    ).toBeVisible();

    // Escape cancels the keyboard drag without moving the lifted card.
    await userEvent.keyboard("{Escape}");
    await waitFor(() =>
      expect(selected).toHaveAttribute("aria-grabbed", "false"),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Moved Draft the release announcement to In Progress",
    );
  }}
>
  {#snippet template()}
    <KanbanBoard
      columns={keyboardBoard.board.columns}
      {...keyboardBoard.handlers}
      ariaLabel="Keyboard demo board"
      {detailBody}
    />
    <output class="sr-only">{keyboardBoard.board.log}</output>
  {/snippet}
</Story>

<Story
  name="Empty board"
  tags={["visual-pending"]}
  play={async ({ canvas }) => {
    await expect(canvas.getByText("No tasks match this board")).toBeVisible();
    await expect(
      canvas.getByText(
        "Change the active grouping or filters to surface tasks.",
      ),
    ).toBeVisible();
  }}
>
  {#snippet template()}
    <KanbanBoard
      columns={[]}
      onMoveCardToColumn={() => {}}
      onReorderColumns={() => {}}
      onEditColumn={() => {}}
      onTogglePin={() => {}}
      onPromoteGolden={() => {}}
      onSaveTitle={() => null}
      ariaLabel="Empty board"
      emptyTitle="No tasks match this board"
      emptyDescription="Change the active grouping or filters to surface tasks."
    />
  {/snippet}
</Story>
