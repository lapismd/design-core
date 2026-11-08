<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import {
    expect,
    fireEvent,
    userEvent,
    waitFor,
    within,
  } from "storybook/test";
  import { MarkdownComposer } from "@lapismd/design-core/chat";
  import * as exampleSources from "./KanbanBoard.example-sources.js";
  import KanbanBoard from "./KanbanBoard.svelte";
  import KanbanActivityView from "./KanbanActivityView.svelte";
  import KanbanCardDetail from "./KanbanCardDetail.svelte";
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
  import {
    referenceNotes,
    type ReferenceCollection,
  } from "./reference.stories.fixture";
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

  function createStoryBoard(initialColumns = buildBoardColumns()) {
    const board = $state({
      columns: initialColumns,
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
  const previewBoard = createStoryBoard();
  const detailBoard = createStoryBoard();
  const columnViewBoard = createStoryBoard();
  const keyboardBoard = createStoryBoard();
  const openBoard = createStoryBoard();
  const readOnlyBoard = createStoryBoard();

  function referenceColumns(
    collection: ReferenceCollection,
  ): KanbanColumnData[] {
    const notes = referenceNotes.filter(
      (note) => note.collection === collection,
    );
    return [...new Set(notes.map((note) => note.phase))].map((phase, index) => {
      const color = index ? "#4d7c0f" : "#0e7490";
      return {
        id: phase,
        label: phase,
        color,
        primary: index === 0,
        cards: notes
          .filter((note) => note.phase === phase)
          .map((note) => ({
            id: note.path,
            title: note.title,
            color,
            tags: [...note.tags],
            createdAt: note.date,
            updatedAt: note.date,
            statusText: note.owner,
            priorityText: String(note.highlight),
            summary: note.body.split("\n\n")[0],
            metadata: [
              { id: "owner", label: "Owner", value: note.owner },
              { id: "source", label: "Source", value: note.path },
              { id: "date", label: "Recorded", value: note.date || "—" },
              { id: "phase", label: "Phase", value: note.phase },
            ],
            badge: { label: "Highlight", value: String(note.highlight) },
          })),
      };
    });
  }
  const rolesReference = createStoryBoard(referenceColumns("roles"));
  const notesReference = createStoryBoard(referenceColumns("notes"));
  const tasksReference = createStoryBoard(referenceColumns("tasks"));

  const tallBoard = createStoryBoard(
    Array.from({ length: 12 }, (_, columnIndex) => ({
      id: `group-${columnIndex}`,
      label: `Group ${columnIndex + 1}`,
      color: "#0e7490",
      cards: Array.from({ length: 16 }, (_, index) => ({
        id: `record-${columnIndex}-${index}`,
        title: `Record ${columnIndex + 1}.${index + 1}`,
        color: "#0e7490",
        metadata: [],
      })),
    })),
  );
  const anchorBoard = createStoryBoard(referenceColumns("notes"));
  let anchor = $state<string | null>("Reflect");
  let activityLog = $state("No card opened");
  let guardedOpen = $state(true);
  let guardAttempts = $state(0);
  let stageOpen = $state(true);
  let stageId = $state("Collect");
  let titleRetryOpen = $state(true);
  let titleAttempts = $state(0);
  let titleRetryCard = $state({
    id: "fieldwork.md",
    title: "Field observations",
    color: COLOR_BACKLOG,
    metadata: [],
  });
  const guardedColumns = referenceColumns("notes");
  let noteDraft = $state("Body preview text.");

  function handleOpenCard(cardId: string, columnId: string) {
    const column = openBoard.board.columns.find(
      (candidate) => candidate.id === columnId,
    );
    const card = column?.cards.find((candidate) => candidate.id === cardId);
    openBoard.board.log = `Opened ${card?.title ?? cardId} from ${columnId}`;
  }
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
  name="Card open callback"
  tags={["visual-pending"]}
  parameters={{
    docs: {
      source: {
        code: exampleSources.CardOpen,
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
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Opened Draft the release announcement from backlog",
    );
    // The activation override replaces the built-in detail dialog entirely.
    await expect(within(document.body).queryByRole("dialog")).toBeNull();
  }}
>
  {#snippet template()}
    <KanbanBoard
      columns={openBoard.board.columns}
      {...openBoard.handlers}
      onCardOpen={handleOpenCard}
      ariaLabel="Card open board"
    />
    <output class="sr-only">{openBoard.board.log}</output>
  {/snippet}
</Story>

<Story
  name="Read-only moves"
  tags={["visual-pending"]}
  play={async ({ canvas, canvasElement }) => {
    const selected = canvas.getByRole("button", {
      name: /Open card: Explore plugin telemetry/,
    });
    // A disabled draggable either drops its drag affordance attributes or
    // advertises aria-disabled; both mean the card cannot be lifted.
    const roledescription = selected.getAttribute("aria-roledescription");
    const ariaDisabled = selected.getAttribute("aria-disabled");
    expect(roledescription === null || ariaDisabled === "true").toBe(true);
    await expect(
      canvas.getByRole("button", {
        name: "Move Explore plugin telemetry left",
      }),
    ).toBeDisabled();

    // The Shift+arrow move shortcut is inert while navigation still works.
    await selected.focus();
    await userEvent.keyboard("{Shift>}{ArrowRight}{/Shift}");
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "No board action",
    );
    await userEvent.keyboard("{ArrowRight}");
    const selectedColumn = canvasElement.querySelector(
      ".kanban-column.is-selected",
    );
    await expect(
      within(selectedColumn as HTMLElement).getByRole("heading", {
        name: /Backlog/,
      }),
    ).toBeVisible();
  }}
>
  {#snippet template()}
    <KanbanBoard
      columns={readOnlyBoard.board.columns}
      {...readOnlyBoard.handlers}
      movesEnabled={false}
      ariaLabel="Read-only board"
    />
    <output class="sr-only">{readOnlyBoard.board.log}</output>
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

<Story
  name="Roles reference"
  tags={["visual-pending"]}
  parameters={{
    docs: {
      description: {
        story:
          "Portable Markdown reference data. Group names are consumer metadata; summaries, metadata and generic badges share the same presentation contract.",
      },
      source: { code: exampleSources.Reference, language: "tsx", type: "code" },
    },
  }}
  play={async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", {
        name: /Open card: Engineering Manager, Infrastructure/,
      }),
    ).toBeVisible();
  }}
>
  {#snippet template()}
    <KanbanBoard
      columns={rolesReference.board.columns}
      {...rolesReference.handlers}
      ariaLabel="Markdown reference board"
      {detailBody}
    />
  {/snippet}
</Story>

<Story
  name="Arbitrary Markdown reference"
  tags={["visual-pending"]}
  parameters={{
    docs: {
      description: {
        story:
          "Portable Markdown reference data. Group names are consumer metadata; summaries, metadata and generic badges share the same presentation contract.",
      },
      source: { code: exampleSources.Reference, language: "tsx", type: "code" },
    },
  }}
  play={async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", { name: /Open card: Field observations/ }),
    ).toBeVisible();
  }}
>
  {#snippet template()}
    <KanbanBoard
      columns={notesReference.board.columns}
      {...notesReference.handlers}
      ariaLabel="Markdown reference board"
      {detailBody}
    />
  {/snippet}
</Story>

<Story
  name="Tasks reference"
  tags={["visual-pending"]}
  parameters={{
    docs: {
      description: {
        story:
          "Portable Markdown reference data. Group names are consumer metadata; summaries, metadata and generic badges share the same presentation contract.",
      },
      source: { code: exampleSources.Reference, language: "tsx", type: "code" },
    },
  }}
  play={async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", {
        name: /Open card: Review the release notes/,
      }),
    ).toBeVisible();
  }}
>
  {#snippet template()}
    <KanbanBoard
      columns={tasksReference.board.columns}
      {...tasksReference.handlers}
      ariaLabel="Markdown reference board"
      {detailBody}
    />
  {/snippet}
</Story>

<Story
  name="Bounded tall columns"
  tags={["visual-pending"]}
  parameters={{
    docs: {
      description: {
        story:
          "A bounded pane keeps column headings and selection rings visible while only the card stacks scroll.",
      },
      source: { code: exampleSources.Bounded, language: "tsx", type: "code" },
    },
  }}
  play={async ({ canvasElement }) => {
    const frame = canvasElement.querySelector<HTMLElement>(
      ".kanban-bounded-story",
    )!;
    const shell = frame.querySelector<HTMLElement>(".column-shell")!;
    const header = shell.querySelector<HTMLElement>(".column-header")!;
    const viewport = shell.querySelector<HTMLElement>(
      '[data-ui-part="scroll-area-viewport"]',
    )!;
    expect(shell.getBoundingClientRect().bottom).toBeLessThanOrEqual(
      frame.getBoundingClientRect().bottom + 1,
    );
    expect(shell.getBoundingClientRect().top).toBeGreaterThanOrEqual(
      frame.getBoundingClientRect().top - 1,
    );
    expect(viewport.scrollHeight).toBeGreaterThan(viewport.clientHeight + 10);
    const centers = [...header.querySelectorAll("button")].map((button) => {
      const rect = button.getBoundingClientRect();
      return rect.top + rect.height / 2;
    });
    expect(Math.max(...centers) - Math.min(...centers)).toBeLessThan(1);
    const top = header.getBoundingClientRect().top;
    viewport.scrollTop = 250;
    expect(viewport.scrollTop).toBeGreaterThan(0);
    expect(header.getBoundingClientRect().top).toBeCloseTo(top, 1);
    const outer = frame.querySelector<HTMLElement>(
      '.board-scroll [data-ui-part="scroll-area-viewport"]',
    )!;
    expect(outer.scrollHeight).toBeLessThanOrEqual(outer.clientHeight + 1);
  }}
>
  {#snippet template()}
    <div class="kanban-bounded-story">
      <KanbanBoard columns={tallBoard.board.columns} {...tallBoard.handlers}>
        {#snippet columnActions(column)}<button
            aria-label={`Filter ${column.label}`}>Filter</button
          >{/snippet}
      </KanbanBoard>
    </div>
  {/snippet}
</Story>

<Story
  name="Column color preview"
  tags={["visual-pending"]}
  play={async ({ canvas, canvasElement }) => {
    const page = within(document.body);
    const column = canvas
      .getByRole("heading", { name: "Backlog" })
      .closest<HTMLElement>(".kanban-column")!;
    const paint = () => column.style.getPropertyValue("--column-color").trim();
    const original = paint();
    const openEditor = async () => {
      await userEvent.click(
        canvas.getByRole("button", { name: "Column options for Backlog" }),
      );
      await userEvent.click(
        page.getByRole("menuitem", { name: "Edit Column" }),
      );
    };
    await openEditor();
    const violet = page.getByRole("button", {
      name: "Choose column color #6d28d9",
    });
    await userEvent.hover(violet);
    await waitFor(() => expect(paint()).toBe("#6d28d9"));
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "No board action",
    );
    await userEvent.unhover(violet);
    await waitFor(() => expect(paint()).toBe(original));
    await violet.focus();
    await fireEvent.focusIn(violet);
    await waitFor(() => expect(paint()).toBe("#6d28d9"));
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(paint()).toBe(original));
    await openEditor();
    await userEvent.click(
      page.getByRole("button", { name: "Choose column color #4d7c0f" }),
    );
    await userEvent.unhover(
      page.getByRole("button", { name: "Choose column color #4d7c0f" }),
    );
    await waitFor(() => expect(paint()).toBe("#4d7c0f"));
    await userEvent.click(page.getByRole("button", { name: "Back" }));
    await waitFor(() => expect(paint()).toBe(original));
    await userEvent.keyboard("{Escape}");
    await openEditor();
    await userEvent.click(
      page.getByRole("button", { name: "Choose column color #6d28d9" }),
    );
    await userEvent.click(page.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(paint()).toBe("#6d28d9"));
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Edited column Backlog",
    );
    await openEditor();
    await userEvent.click(
      page.getByRole("button", { name: "Choose column color #a16207" }),
    );
    await userEvent.click(
      canvasElement.querySelector<HTMLElement>(".board-row")!,
    );
    await waitFor(() => expect(paint()).toBe("#6d28d9"));
    expect(canvasElement.querySelector(".column-popover__form")).toBeNull();
  }}
>
  {#snippet template()}
    <KanbanBoard
      columns={previewBoard.board.columns}
      {...previewBoard.handlers}
    />
    <output class="sr-only">{previewBoard.board.log}</output>
  {/snippet}
</Story>

<Story
  name="Generic card fields"
  tags={["visual-pending"]}
  parameters={{
    docs: {
      source: { code: exampleSources.Generic, language: "tsx", type: "code" },
    },
  }}
  play={async ({ canvas }) => {
    const card = canvas.getByRole("button", {
      name: /Open card: Field observations/,
    });
    await expect(
      within(card).getByText(
        "Capture observations from the riverside field visit.",
      ),
    ).toBeVisible();
    const cells = card.querySelectorAll<HTMLElement>(".kanban-metadata > div");
    expect(cells).toHaveLength(4);
    const [left, right, next] = [...cells].map((cell) =>
      cell.getBoundingClientRect(),
    );
    expect(left.top).toBeCloseTo(right.top, 0);
    expect(right.left).toBeGreaterThan(left.left);
    expect(next.top).toBeGreaterThan(left.top);
    expect(next.left).toBeCloseTo(left.left, 0);
    await expect(within(card).getByLabelText("Highlight: 0")).toBeVisible();
    await userEvent.click(card);
    const page = within(document.body);
    const badge = page
      .getByRole("dialog")
      .querySelector<HTMLElement>('[data-ui-part="card-badge"]')!;
    const frame = badge.closest<HTMLElement>(".detail-card-body")!;
    const rect = badge.getBoundingClientRect();
    expect(rect.width).toBeGreaterThan(150);
    expect(frame.getBoundingClientRect().right - rect.right).toBeLessThan(35);
    expect(frame.getBoundingClientRect().bottom - rect.bottom).toBeLessThan(35);
    await userEvent.click(page.getByRole("button", { name: /Back ESC/ }));
  }}
>
  {#snippet template()}
    <KanbanBoard
      columns={notesReference.board.columns}
      {...notesReference.handlers}
    />
  {/snippet}
</Story>

<Story
  name="Configurable anchor"
  tags={["visual-pending"]}
  parameters={{
    docs: {
      source: { code: exampleSources.Generic, language: "tsx", type: "code" },
    },
  }}
  play={async ({ canvas }) => {
    const anchorButton = canvas.getByRole("button", {
      name: /Reflect cards, locked column/,
    });
    await expect(anchorButton).toBeDisabled();
    await userEvent.click(
      canvas.getByRole("button", { name: "Disable anchoring" }),
    );
    const collapse = canvas.getByRole("button", { name: /Collapse .*Reflect/ });
    await expect(collapse).toBeEnabled();
    await userEvent.click(collapse);
    await expect(
      canvas.getByRole("button", { name: /Expand .*Reflect/ }),
    ).toBeVisible();
  }}
>
  {#snippet template()}
    <button onclick={() => (anchor = null)}>Disable anchoring</button>
    <KanbanBoard
      columns={anchorBoard.board.columns}
      {...anchorBoard.handlers}
      anchorColumnId={anchor}
    />
  {/snippet}
</Story>

<Story
  name="Activity timeline"
  tags={["visual-pending"]}
  parameters={{
    docs: {
      source: { code: exampleSources.Activity, language: "tsx", type: "code" },
    },
  }}
  play={async ({ canvas }) => {
    await expect(canvas.getByText("No entries for 1 days")).toBeVisible();
    await expect(
      canvas.getByRole("heading", { name: "Undated" }),
    ).toBeVisible();
    await userEvent.click(
      canvas.getByRole("button", { name: /Open card: Field observations/ }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Research/Fieldwork.md in Collect",
    );
  }}
>
  {#snippet template()}
    <div class="kanban-bounded-story">
      <KanbanActivityView
        columns={notesReference.board.columns}
        entries={[
          {
            card: notesReference.board.columns[0]!.cards[0]!,
            columnId: "Collect",
            date: "2026-06-25",
          },
          {
            card: notesReference.board.columns[1]!.cards[0]!,
            columnId: "Reflect",
            date: "2026-06-27",
          },
          {
            card: {
              id: "draft.md",
              title: "Interview questions",
              color: COLOR_BACKLOG,
              metadata: [],
            },
            columnId: "Collect",
            date: null,
          },
        ]}
        onCardOpen={(id, column) => (activityLog = id + " in " + column)}
      />
    </div>
    <output class="sr-only">{activityLog}</output>
  {/snippet}
</Story>

<Story
  name="Guarded detail retry"
  tags={["visual-pending"]}
  parameters={{
    docs: {
      source: {
        code: exampleSources.GuardedDetail,
        language: "tsx",
        type: "code",
      },
    },
  }}
  play={async () => {
    const page = within(document.body);
    await userEvent.click(page.getByRole("button", { name: /Back ESC/ }));
    await expect(page.getByRole("alert")).toHaveTextContent(
      "Source write failed",
    );
    await expect(page.getByRole("dialog")).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(page.queryByRole("dialog")).toBeNull());
  }}
>
  {#snippet template()}
    <KanbanCardDetail
      card={guardedColumns[0]!.cards[0]!}
      columns={guardedColumns}
      columnId="Collect"
      columnLabel="Collect"
      bind:open={guardedOpen}
      onClose={() => {}}
      onMoveToColumn={() => {}}
      beforeClose={async () => {
        guardAttempts += 1;
        if (guardAttempts === 1) throw Error("Source write failed");
        return true;
      }}
    />
  {/snippet}
</Story>

<Story
  name="Title save retry"
  tags={["visual-pending"]}
  parameters={{
    docs: {
      source: {
        code: exampleSources.GuardedDetail,
        language: "tsx",
        type: "code",
      },
    },
  }}
  play={async () => {
    const page = within(document.body);
    await userEvent.click(
      page.getByRole("button", { name: /Edit card title/ }),
    );
    const input = page.getByRole("textbox", { name: "Card title" });
    await userEvent.clear(input);
    await userEvent.type(input, "Reviewed field observations");
    await userEvent.keyboard("{Enter}");
    await expect(page.getByRole("alert")).toHaveTextContent(
      "Title write failed",
    );
    await expect(input).toHaveTextContent("Reviewed field observations");
    await userEvent.keyboard("{Enter}");
    await waitFor(() =>
      expect(
        page.getByRole("button", { name: /Edit card title/ }),
      ).toHaveTextContent("Reviewed field observations"),
    );
    await userEvent.click(page.getByRole("button", { name: /Back ESC/ }));
    await waitFor(() => expect(page.queryByRole("dialog")).toBeNull());
  }}
>
  {#snippet template()}
    <KanbanCardDetail
      card={titleRetryCard}
      columns={[]}
      bind:open={titleRetryOpen}
      onClose={() => {}}
      onMoveToColumn={() => {}}
      onSaveTitle={async (title) => {
        titleAttempts += 1;
        if (titleAttempts === 1) throw Error("Title write failed");
        titleRetryCard.title = title;
        return null;
      }}
    />
  {/snippet}
</Story>

<Story
  name="Persistent stage detail"
  tags={["visual-pending"]}
  parameters={{
    docs: {
      source: {
        code: exampleSources.GuardedDetail,
        language: "tsx",
        type: "code",
      },
    },
  }}
  play={async () => {
    const page = within(document.body);
    const dialog = page.getByRole("dialog");
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Reflect" }),
    );
    await waitFor(() =>
      expect(
        within(dialog).getByRole("button", { name: "Reflect" }),
      ).toBeDisabled(),
    );
    await expect(dialog).toBeVisible();
    const tint = dialog.querySelector<HTMLElement>(
      '[data-ui-component="kanban-card-detail"]',
    )!;
    expect(tint.style.getPropertyValue("--card-color")).toBe(COLOR_DONE);
    await userEvent.click(page.getByRole("button", { name: /Back ESC/ }));
    await waitFor(() => expect(page.queryByRole("dialog")).toBeNull());
  }}
>
  {#snippet template()}
    <KanbanCardDetail
      card={{
        ...guardedColumns[0]!.cards[0]!,
        color: stageId === "Collect" ? COLOR_BACKLOG : COLOR_DONE,
      }}
      columns={guardedColumns}
      columnId={stageId}
      columnLabel={stageId}
      bind:open={stageOpen}
      closeOnMove={false}
      onClose={() => {}}
      onMoveToColumn={(id) => {
        stageId = id;
      }}
    />
  {/snippet}
</Story>
