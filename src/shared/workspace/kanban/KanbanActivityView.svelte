<script lang="ts">
  import { DragDropProvider } from "@dnd-kit/svelte";
  import { ScrollArea } from "@lapismd/design-core/shadcn/scroll-area";
  import KanbanCard from "./KanbanCard.svelte";
  import {
    buildKanbanActivityDays,
    kanbanDayGap,
  } from "./kanban-presentation.js";
  import type {
    KanbanActivityEntry,
    KanbanCardSnippets,
    KanbanDetailColumnOption,
  } from "./kanban-types.js";
  import "./KanbanBoard.css";
  import "./KanbanActivityView.css";

  let {
    entries,
    columns,
    cardSnippets = undefined,
    ariaLabel = "Activity",
    onCardOpen,
  }: {
    /** One dated entry per source record; the host chooses its date property. */
    entries: KanbanActivityEntry[];
    /** Consumer-derived grouping columns. An empty list produces one lane. */
    columns: KanbanDetailColumnOption[];
    cardSnippets?: KanbanCardSnippets;
    ariaLabel?: string;
    onCardOpen: (cardId: string, columnId: string) => void;
  } = $props();

  const days = $derived(buildKanbanActivityDays(entries));
  const lanes = $derived(
    columns.length ? columns : [{ id: "", label: "Entries" }],
  );
  let selectedCardId = $state<string | null>(null);
  const dateLabel = (date: Date) =>
    new Intl.DateTimeFormat(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
</script>

<DragDropProvider>
  <ScrollArea class="kanban-activity" orientation="both" aria-label={ariaLabel}>
    <div class="kanban-activity__timeline" data-ui-component="kanban-activity">
      {#each days as day, index (day.key)}
        {@const previous = days[index - 1]}
        {#if day.date && previous?.date && kanbanDayGap(previous.date, day.date) > 0}
          <p class="kanban-activity__gap">
            No entries for {kanbanDayGap(previous.date, day.date)} days
          </p>
        {/if}
        <section
          class="kanban-activity__day"
          aria-label={day.date ? dateLabel(day.date) : "Undated"}
        >
          <h2 class="kanban-activity__date">
            {#if day.date}<time datetime={day.key}>{dateLabel(day.date)}</time
              >{:else}Undated{/if}
          </h2>
          <div
            class="kanban-activity__columns"
            style:--activity-columns={lanes.length}
          >
            {#each lanes as column (column.id)}
              {@const items = day.entries.filter(
                (entry) => !columns.length || entry.columnId === column.id,
              )}
              <section
                class="kanban-activity__column"
                aria-label={`${column.label} — ${day.date ? dateLabel(day.date) : "Undated"}`}
              >
                <h3>{column.label} <span>({items.length})</span></h3>
                {#each items as entry (entry.card.id)}
                  <article class="kanban-activity__entry">
                    <KanbanCard
                      card={entry.card}
                      columnId={entry.columnId}
                      {cardSnippets}
                      tabIndex={0}
                      selected={selectedCardId === entry.card.id}
                      movesEnabled={false}
                      onSelect={() => (selectedCardId = entry.card.id)}
                      onOpen={() => onCardOpen(entry.card.id, entry.columnId)}
                      onMoveLeft={() => {}}
                      onMoveRight={() => {}}
                    />
                  </article>
                {:else}<p class="kanban-activity__empty">No entries</p>{/each}
              </section>
            {/each}
          </div>
        </section>
      {:else}<p role="status" class="kanban-activity__empty">
          No activity matches this view
        </p>{/each}
    </div>
  </ScrollArea>
</DragDropProvider>
