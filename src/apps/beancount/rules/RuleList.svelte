<script lang="ts">
  import { ArrowDownUp, MoreHorizontal } from "@lucide/svelte";
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
    rule,
    ariaLabel = "Rules",
    recentRunsLabel = "Recent runs",
    emptyRecentRunsLabel = "No rule runs yet.",
    actions = [],
    runs = [],
    onOpenRule = () => {},
    onActiveChange = () => {},
    onActionSelect = () => {},
  }: {
    /** The rule content belongs to the host's rules adapter. */
    rule: AutomationRule;
    /** Accessible name for the controlled rules list. */
    ariaLabel?: string;
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
  } = $props();
</script>

<section class="bc-rule-list" aria-label={ariaLabel}>
  <header class="bc-rule-list__header" aria-label="Rules columns">
    <span class="bc-rule-list__column-title">
      Rule
      <ArrowDownUp aria-hidden="true" />
    </span>
    <span class="bc-rule-list__column-title">
      Active
      <ArrowDownUp aria-hidden="true" />
    </span>
  </header>

  <Card.Root class="bc-rule-list__rule-card">
    <Card.Header class="bc-rule-list__rule-header">
      <h3 class="bc-rule-list__rule-heading">
        <Button
          class="bc-rule-list__open"
          variant="ghost"
          onclick={() => onOpenRule(rule)}
        >
          {rule.name}
        </Button>
      </h3>
      <Card.Action class="bc-rule-list__rule-actions">
        <Switch
          checked={rule.active}
          aria-label={`Set ${rule.name} active`}
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
                  size="icon"
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
      </Card.Action>
    </Card.Header>
    <Card.Content class="bc-rule-list__clauses">
      {#each rule.clauses as clause (clause.id)}
        <Badge class="bc-rule-list__clause" variant="secondary">
          <strong>{clause.kind}</strong>
          <span>{clause.text}</span>
        </Badge>
      {/each}
    </Card.Content>
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
    gap: var(--ui-beancount-space-7);
    width: min(100%, 96rem);
    margin-inline: auto;
  }

  .bc-rule-list__header {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: var(--ui-beancount-space-4);
    min-height: calc(var(--ui-beancount-space-8) * 1.75);
    padding: var(--ui-beancount-space-4) var(--ui-beancount-space-5);
    border-radius: var(--ui-beancount-radius-lg);
    background: color-mix(
      in srgb,
      var(--ui-beancount-review) 9%,
      var(--ui-beancount-surface)
    );
    color: var(--ui-beancount-muted-foreground);
  }

  .bc-rule-list__column-title {
    display: inline-flex;
    align-items: center;
    gap: var(--ui-beancount-space-2);
    font-size: var(--text-lg);
    font-weight: var(--font-weight-semibold);
  }

  .bc-rule-list__column-title:last-child {
    justify-self: end;
  }

  :global(.bc-rule-list__column-title svg) {
    width: var(--ui-beancount-space-5);
    height: var(--ui-beancount-space-5);
  }

  :global(.bc-rule-list__rule-card) {
    border: 1px solid var(--ui-beancount-border);
    box-shadow: var(--ui-beancount-shadow-panel);
  }

  :global(.bc-rule-list__rule-header) {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: var(--ui-beancount-space-4);
    padding: var(--ui-beancount-space-5) var(--ui-beancount-space-6) 0;
  }

  .bc-rule-list__rule-heading {
    margin: 0;
  }

  :global(.bc-rule-list__open) {
    height: auto;
    padding: 0;
    color: var(--ui-beancount-foreground);
    font-size: var(--text-2xl);
    font-weight: var(--font-weight-semibold);
    text-decoration: none;
  }

  :global(.bc-rule-list__open:hover) {
    background: transparent;
    color: var(--ui-beancount-primary);
  }

  :global(.bc-rule-list__rule-actions) {
    display: inline-flex;
    align-items: center;
    gap: var(--ui-beancount-space-4);
  }

  :global(.bc-rule-list__more) {
    color: var(--ui-beancount-foreground);
  }

  :global(.bc-rule-list__clauses) {
    display: flex;
    flex-wrap: wrap;
    gap: var(--ui-beancount-space-2);
    padding: var(--ui-beancount-space-4) var(--ui-beancount-space-6)
      var(--ui-beancount-space-5);
  }

  :global(.bc-rule-list__clause) {
    min-height: calc(var(--ui-beancount-space-7) * 0.9);
    max-width: 100%;
    padding-inline: var(--ui-beancount-space-3);
    color: var(--ui-beancount-muted-foreground);
    font-size: var(--text-base);
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
    background: var(--card);
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
    background: color-mix(in srgb, var(--destructive) 14%, transparent);
    color: var(--destructive);
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
