export const Basic = `<script lang="ts">
  import {
    KanbanBoard,
    type KanbanColumnData,
  } from "@lapismd/design-core/workspace/kanban";

  let columns = $state<KanbanColumnData[]>([
    {
      id: "maybe",
      label: "Maybe",
      color: "#64748b",
      primary: true,
      locked: true,
      isFixedPosition: true,
      cards: [
        {
          id: "mb-1",
          title: "Explore plugin telemetry",
          color: "#64748b",
          tags: ["research"],
          pinned: true,
          createdAt: "2026-09-12T09:00:00Z",
          updatedAt: "2026-10-28T15:30:00Z",
          counters: { zap: 0, comments: 0 },
        },
      ],
    },
    {
      id: "backlog",
      label: "Backlog",
      color: "#1d4ed8",
      cards: [
        {
          id: "bl-1",
          title: "Draft the release announcement",
          color: "#1d4ed8",
          progress: { done: 2, total: 5 },
        },
      ],
    },
    {
      id: "done",
      label: "Done",
      color: "#4d7c0f",
      isCompleted: true,
      excludeFromAutoExpand: true,
      cards: [],
    },
  ]);

  function moveCardToColumn(cardId: string, columnId: string) {
    const source = columns.find((column) =>
      column.cards.some((card) => card.id === cardId),
    );
    const target = columns.find((column) => column.id === columnId);
    if (!source || !target) return;
    const card = source.cards.find((candidate) => candidate.id === cardId);
    source.cards = source.cards.filter((candidate) => candidate.id !== cardId);
    target.cards = [...target.cards, { ...card, color: target.color }];
  }
</script>

<KanbanBoard
  {columns}
  onMoveCardToColumn={moveCardToColumn}
  onReorderColumns={(orderedIds) => {
    const fixed = columns.filter((column) => column.isFixedPosition);
    const moved = orderedIds
      .map((id) => columns.find((column) => column.id === id))
      .filter(Boolean);
    columns = [...fixed, ...moved];
  }}
  onEditColumn={(columnId, meta) => {
    const column = columns.find((candidate) => candidate.id === columnId);
    if (meta.title) column.label = meta.title;
    if (meta.color) column.color = meta.color;
  }}
  onTogglePin={(cardId) => {
    for (const column of columns) {
      for (const card of column.cards) {
        if (card.id === cardId) card.pinned = !card.pinned;
      }
    }
  }}
  onPromoteGolden={(cardId) => {
    for (const column of columns) {
      for (const card of column.cards) {
        if (card.id === cardId) card.golden = true;
      }
    }
  }}
  onSaveTitle={(cardId, title) => {
    for (const column of columns) {
      for (const card of column.cards) {
        if (card.id === cardId) card.title = title;
      }
    }
    return null;
  }}
  brandLabel="Atlas"
/>`;

export const DetailBody = `<script lang="ts">
  import { MarkdownComposer } from "@lapismd/design-core/chat";
  import {
    KanbanBoard,
    type KanbanColumnData,
    type KanbanDetailBodyContext,
  } from "@lapismd/design-core/workspace/kanban";

  let columns = $state<KanbanColumnData[]>([
    /* …same shape as the Basic example… */
  ]);
  let draft = $state("");
</script>

<KanbanBoard
  {columns}
  onMoveCardToColumn={moveCardToColumn}
  onReorderColumns={reorderColumns}
  onEditColumn={editColumn}
  onTogglePin={togglePin}
  onPromoteGolden={promoteGolden}
  onSaveTitle={saveTitle}
>
  {#snippet detailBody(context: KanbanDetailBodyContext)}
    {#if context.editing}
      <!-- Compose the composer tokens on the note surface: no avatar gutter
           and an editor height that docks the toolbar above the surface
           bottom (14rem − 2px border − 0.5rem gap − 2rem footer row). -->
      <div
        class="detail-note-surface edit-mode"
        style="--ui-markdown-composer-avatar-width: 0rem;
               --ui-markdown-composer-avatar-gap: 0rem;
               --ui-markdown-composer-document-min-height: calc(11.5rem - 2px);"
      >
        <MarkdownComposer
          presentation="document"
          label="Card body editor"
          inputLabel="Card body"
          bind:value={draft}
          submitLabel="Save body"
          onSubmit={() => context.setEditing(false)}
        />
      </div>
    {:else}
      <div class="detail-note-surface">
        <MyMarkdownPreview card={context.card} />
      </div>
    {/if}
  {/snippet}
</KanbanBoard>`;
