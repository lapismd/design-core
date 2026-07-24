<script lang="ts">
  import {
    ArrowDownUp,
    ArrowDownWideNarrow,
    ArrowUpNarrowWide,
    MoreHorizontal,
  } from "@lucide/svelte";
  import { Badge } from "@stevejuma/ui/shadcn/badge";
  import { Button } from "@stevejuma/ui/shadcn/button";
  import * as Card from "@stevejuma/ui/shadcn/card";
  import * as DropdownMenu from "@stevejuma/ui/shadcn/dropdown-menu";
  import { Switch } from "@stevejuma/ui/shadcn/switch";
  import * as Table from "@stevejuma/ui/shadcn/table";

  export type RuleClauseKind = "IF" | "THEN" | "FOR";

  export type RuleClause = {
    id: string;
    kind: RuleClauseKind;
    text: string;
  };

  export type AutomationRule = {
    id: string;
    name: string;
    clauses: readonly RuleClause[];
    active: boolean;
  };

  export type RuleSortKey = "name" | "active";

  export type RuleSortDirection = "asc" | "desc";

  /** The host-controlled sort state displayed in the Fava rule columns. */
  export type RuleSort = {
    key: RuleSortKey;
    direction: RuleSortDirection;
  };

  /** A host-owned action exposed from a rule's contextual menu. */
  export type RuleAction = {
    id: string;
    label: string;
    destructive?: boolean;
    disabled?: boolean;
  };

  export type RuleRunTone = "default" | "positive" | "negative";

  /** A fully formatted execution result supplied by the host rules adapter. */
  export type RuleRun = {
    id: string;
    dateTime: string;
    executionType: string;
    target: string;
    status: string;
    statusTone?: RuleRunTone;
    ruleName: string;
    queued: string;
    processed: string;
    modified: string;
    blocked: string;
  };

  let {
    rules,
    ariaLabel = "Rules",
    sort,
    recentRunsLabel = "Recent runs",
    emptyRecentRunsLabel = "No rule runs yet.",
    actions = [],
    runs = [],
    onOpenRule = () => {},
    onActiveChange = () => {},
    onActionSelect = () => {},
    onSortRequest = () => {},
  }: {
    /** Display-ready rules in the order supplied by the host adapter. */
    rules: readonly AutomationRule[];
    /** Accessible name for the controlled rules list. */
    ariaLabel?: string;
    /** Host-controlled visual sort state; the host owns the resulting order. */
    sort?: RuleSort;
    /** Label above host-owned rule execution history. */
    recentRunsLabel?: string;
    /** Copy when the host reports no rule executions. */
    emptyRecentRunsLabel?: string;
    /** Available host-owned contextual actions, such as edit, run, or delete. */
    actions?: readonly RuleAction[];
    /** Fully formatted rule execution history. The host owns paging and loading. */
    runs?: readonly RuleRun[];
    /** Request that the host opens the rule editor/details. */
    onOpenRule?: (rule: AutomationRule) => void;
    /** Request a host-owned active-state update. */
    onActiveChange?: (rule: AutomationRule, active: boolean) => void;
    /** Requests a host-owned contextual action for this rule. */
    onActionSelect?: (rule: AutomationRule, action: RuleAction) => void;
    /** Requests that the host cycle ordering for a Fava rule-list column. */
    onSortRequest?: (key: RuleSortKey) => void;
  } = $props();

  function ariaSortFor(key: RuleSortKey) {
    if (sort?.key !== key) {
      return "none";
    }

    return sort.direction === "asc" ? "ascending" : "descending";
  }
</script>

<section class="bc-rule-list" aria-label={ariaLabel}>
  <header class="bc-rule-list__header" aria-label="Rules columns">
    <button
      type="button"
      class="bc-rule-list__sort-button"
      aria-label="Sort by rule name"
      aria-pressed={sort?.key === "name"}
      data-sort={ariaSortFor("name")}
      onclick={() => onSortRequest("name")}
    >
      Rule
      {#if sort?.key === "name" && sort.direction === "asc"}
        <ArrowUpNarrowWide aria-hidden="true" />
      {:else if sort?.key === "name" && sort.direction === "desc"}
        <ArrowDownWideNarrow aria-hidden="true" />
      {:else}
        <ArrowDownUp aria-hidden="true" />
      {/if}
    </button>
    <button
      type="button"
      class="bc-rule-list__sort-button"
      aria-label="Sort by active status"
      aria-pressed={sort?.key === "active"}
      data-sort={ariaSortFor("active")}
      onclick={() => onSortRequest("active")}
    >
      Active
      {#if sort?.key === "active" && sort.direction === "asc"}
        <ArrowUpNarrowWide aria-hidden="true" />
      {:else if sort?.key === "active" && sort.direction === "desc"}
        <ArrowDownWideNarrow aria-hidden="true" />
      {:else}
        <ArrowDownUp aria-hidden="true" />
      {/if}
    </button>
  </header>

  <Card.Root class="bc-rule-list__rules-card">
    {#each rules as rule (rule.id)}
      <article class="bc-rule-list__rule-row">
        <button
          type="button"
          class="bc-rule-list__open"
          aria-label={`Edit rule ${rule.name}`}
          onclick={() => onOpenRule(rule)}
        >
          <span class="bc-rule-list__rule-name">{rule.name}</span>
          <span class="bc-rule-list__clauses">
            {#each rule.clauses as clause (clause.id)}
              <Badge class="bc-rule-list__clause" variant="secondary">
                <strong>{clause.kind}</strong>
                <span>{clause.text}</span>
              </Badge>
            {/each}
          </span>
        </button>
        <Switch
          checked={rule.active}
          aria-label={rule.active
            ? `Deactivate ${rule.name}`
            : `Activate ${rule.name}`}
          onCheckedChange={(active) => onActiveChange(rule, active)}
        />
        {#if actions.length}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              {#snippet child({ props })}
                <Button
                  {...props}
                  class="bc-rule-list__more"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`More actions for ${rule.name}`}
                >
                  <MoreHorizontal aria-hidden="true" />
                </Button>
              {/snippet}
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="end">
              <DropdownMenu.Group>
                {#each actions as action (action.id)}
                  <DropdownMenu.Item
                    disabled={action.disabled}
                    variant={action.destructive ? "destructive" : "default"}
                    onSelect={() => onActionSelect(rule, action)}
                  >
                    {action.label}
                  </DropdownMenu.Item>
                {/each}
              </DropdownMenu.Group>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        {/if}
      </article>
    {/each}
  </Card.Root>

  <div class="bc-rule-list__runs">
    <h3>{recentRunsLabel}</h3>
    {#if runs.length}
      <div class="bc-rule-list__runs-table-wrap">
        <Table.Root
          class="bc-rule-list__runs-table"
          aria-label={`${ariaLabel} execution history`}
        >
          <Table.Header>
            <Table.Row class="bc-rule-list__runs-header-row">
              <Table.Head class="bc-rule-list__runs-head">Date/time</Table.Head>
              <Table.Head class="bc-rule-list__runs-head">Type</Table.Head>
              <Table.Head class="bc-rule-list__runs-head">Target</Table.Head>
              <Table.Head class="bc-rule-list__runs-head">Status</Table.Head>
              <Table.Head class="bc-rule-list__runs-head">Rule</Table.Head>
              <Table.Head
                class="bc-rule-list__runs-head bc-rule-list__runs-head--number"
                >Queued</Table.Head
              >
              <Table.Head
                class="bc-rule-list__runs-head bc-rule-list__runs-head--number"
                >Processed</Table.Head
              >
              <Table.Head
                class="bc-rule-list__runs-head bc-rule-list__runs-head--number"
                >Modified</Table.Head
              >
              <Table.Head
                class="bc-rule-list__runs-head bc-rule-list__runs-head--number"
                >Blocked</Table.Head
              >
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {#each runs as run (run.id)}
              <Table.Row>
                <Table.Cell class="bc-rule-list__runs-cell"
                  >{run.dateTime}</Table.Cell
                >
                <Table.Cell class="bc-rule-list__runs-cell"
                  >{run.executionType}</Table.Cell
                >
                <Table.Cell class="bc-rule-list__runs-cell"
                  >{run.target}</Table.Cell
                >
                <Table.Cell class="bc-rule-list__runs-cell">
                  <Badge
                    class="bc-rule-list__run-status"
                    data-tone={run.statusTone ?? "default"}
                    variant="secondary">{run.status}</Badge
                  >
                </Table.Cell>
                <Table.Cell class="bc-rule-list__runs-cell"
                  >{run.ruleName}</Table.Cell
                >
                <Table.Cell
                  class="bc-rule-list__runs-cell bc-rule-list__runs-cell--number"
                  >{run.queued}</Table.Cell
                >
                <Table.Cell
                  class="bc-rule-list__runs-cell bc-rule-list__runs-cell--number"
                  >{run.processed}</Table.Cell
                >
                <Table.Cell
                  class="bc-rule-list__runs-cell bc-rule-list__runs-cell--number"
                  >{run.modified}</Table.Cell
                >
                <Table.Cell
                  class="bc-rule-list__runs-cell bc-rule-list__runs-cell--number"
                  >{run.blocked}</Table.Cell
                >
              </Table.Row>
            {/each}
          </Table.Body>
        </Table.Root>
      </div>
    {:else}
      <p>{emptyRecentRunsLabel}</p>
    {/if}
  </div>
</section>

<style>
  .bc-rule-list {
    display: grid;
    gap: var(--ui-beancount-space-6);
    width: min(100%, 56rem);
    margin-inline: auto;
  }

  .bc-rule-list__header {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: var(--ui-beancount-space-3);
    padding: var(--ui-beancount-space-4);
    border-radius: var(--ui-beancount-radius-panel);
    background: var(--ui-beancount-surface-muted);
    color: var(--ui-beancount-muted-foreground);
  }

  .bc-rule-list__sort-button {
    display: inline-flex;
    align-items: center;
    gap: calc(var(--ui-beancount-space-1) * 1.5);
    border-radius: var(--ui-beancount-radius-sm);
    color: inherit;
    font-size: var(--text-xs);
    line-height: var(--text-xs--line-height);
    font-weight: var(--font-weight-semibold);
  }

  .bc-rule-list__sort-button:last-child {
    justify-self: end;
  }

  .bc-rule-list__sort-button:hover {
    color: var(--ui-beancount-foreground);
  }

  .bc-rule-list__sort-button:focus-visible {
    outline: 2px solid var(--ui-beancount-focus-ring);
    outline-offset: 2px;
  }

  :global(.bc-rule-list__sort-button svg) {
    width: calc(var(--ui-beancount-space-1) * 3.5);
    height: calc(var(--ui-beancount-space-1) * 3.5);
  }

  :global(.bc-rule-list__rules-card) {
    overflow: hidden;
    border: 1px solid var(--ui-beancount-border);
    box-shadow: var(--ui-beancount-shadow-panel);
    padding: 0;
  }

  .bc-rule-list__rule-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto auto;
    align-items: center;
    gap: var(--ui-beancount-space-3);
    border-bottom: 1px solid var(--ui-beancount-border);
    background: var(--ui-beancount-surface);
  }

  .bc-rule-list__rule-row:last-child {
    border-bottom: 0;
  }

  .bc-rule-list__open {
    display: grid;
    width: 100%;
    min-width: 0;
    gap: calc(var(--ui-beancount-space-1) * 1.5);
    padding: var(--ui-beancount-space-3) 0 var(--ui-beancount-space-3)
      var(--ui-beancount-space-4);
    color: var(--ui-beancount-foreground);
    text-align: left;
  }

  .bc-rule-list__open:hover {
    background: color-mix(in srgb, var(--ui-beancount-muted) 70%, transparent);
  }

  .bc-rule-list__open:focus-visible {
    outline: 2px solid var(--ui-beancount-focus-ring);
    outline-offset: -2px;
  }

  .bc-rule-list__rule-name {
    overflow: hidden;
    color: var(--ui-beancount-foreground);
    font-size: var(--text-sm);
    line-height: var(--text-sm--line-height);
    font-weight: var(--font-weight-semibold);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .bc-rule-list__clauses {
    display: flex;
    flex-wrap: wrap;
    gap: var(--ui-beancount-space-2);
  }

  :global(.bc-rule-list__more) {
    margin-inline-end: var(--ui-beancount-space-4);
    color: var(--ui-beancount-foreground);
  }

  :global(.bc-rule-list__clause) {
    min-height: calc(var(--ui-beancount-space-6) - var(--ui-beancount-space-1));
    max-width: 100%;
    padding-inline: var(--ui-beancount-space-2);
    color: var(--ui-beancount-muted-foreground);
    font-size: var(--text-xs);
    line-height: var(--text-xs--line-height);
    font-weight: var(--font-weight-normal);
  }

  :global(.bc-rule-list__clause strong) {
    color: var(--ui-beancount-foreground);
    font-weight: var(--font-weight-semibold);
  }

  .bc-rule-list__runs {
    display: grid;
    gap: var(--ui-beancount-space-4);
    color: var(--ui-beancount-muted-foreground);
  }

  .bc-rule-list__runs h3,
  .bc-rule-list__runs p {
    margin: 0;
  }

  .bc-rule-list__runs h3 {
    color: var(--ui-beancount-muted-foreground);
    font-size: var(--text-xl);
    font-weight: var(--font-weight-semibold);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .bc-rule-list__runs p {
    font-size: var(--text-xl);
  }

  .bc-rule-list__runs-table-wrap {
    overflow-x: auto;
    border: 1px solid var(--ui-beancount-border);
    border-radius: var(--ui-beancount-radius-panel);
    background: var(--ui-beancount-surface-raised);
    box-shadow: var(--ui-beancount-shadow-panel);
  }

  :global(.bc-rule-list__runs-table) {
    min-width: 48rem;
  }

  :global(.bc-rule-list__runs-header-row) {
    background: color-mix(
      in srgb,
      var(--ui-beancount-surface-muted) 65%,
      transparent
    );
  }

  :global(.bc-rule-list__runs-header-row:hover) {
    background: color-mix(
      in srgb,
      var(--ui-beancount-surface-muted) 65%,
      transparent
    );
  }

  :global(.bc-rule-list__runs-head) {
    padding: var(--ui-beancount-space-2) var(--ui-beancount-space-4);
    font-size: var(--text-xs);
    font-weight: var(--font-weight-semibold);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  :global(.bc-rule-list__runs-head--number) {
    text-align: end;
  }

  :global(.bc-rule-list__runs-cell) {
    padding: var(--ui-beancount-space-3) var(--ui-beancount-space-4);
    color: var(--ui-beancount-muted-foreground);
    font-size: var(--text-sm);
  }

  :global(.bc-rule-list__runs-cell--number) {
    text-align: end;
    font-variant-numeric: tabular-nums;
  }

  :global(.bc-rule-list__run-status[data-tone="positive"]) {
    background: color-mix(
      in srgb,
      var(--ui-beancount-positive) 14%,
      transparent
    );
    color: var(--ui-beancount-positive);
  }

  :global(.bc-rule-list__run-status[data-tone="negative"]) {
    background: color-mix(
      in srgb,
      var(--ui-beancount-negative) 14%,
      transparent
    );
    color: var(--ui-beancount-negative);
  }

  @media (max-width: 640px) {
    .bc-rule-list__header {
      padding-inline: var(--ui-beancount-space-4);
    }

    :global(.bc-rule-list__rule-header) {
      padding-inline: var(--ui-beancount-space-4);
    }

    :global(.bc-rule-list__clauses) {
      padding-inline: var(--ui-beancount-space-4);
    }

    :global(.bc-rule-list__rule-actions) {
      gap: var(--ui-beancount-space-2);
    }
  }
</style>
