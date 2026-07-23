<script lang="ts">
  import { ArrowDownUp, MoreHorizontal } from "@lucide/svelte";
  import { Badge } from "@stevejuma/ui/shadcn/badge";
  import { Button } from "@stevejuma/ui/shadcn/button";
  import * as Card from "@stevejuma/ui/shadcn/card";
  import { Switch } from "@stevejuma/ui/shadcn/switch";

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

  let {
    rule,
    ariaLabel = "Rules",
    recentRunsLabel = "Recent runs",
    emptyRecentRunsLabel = "No rule runs yet.",
    onOpenRule = () => {},
    onActiveChange = () => {},
    onMoreActions = () => {},
  }: {
    /** The rule content belongs to the host's rules adapter. */
    rule: AutomationRule;
    /** Accessible name for the controlled rules list. */
    ariaLabel?: string;
    /** Label above host-owned rule execution history. */
    recentRunsLabel?: string;
    /** Copy when the host reports no rule executions. */
    emptyRecentRunsLabel?: string;
    /** Request that the host opens the rule editor/details. */
    onOpenRule?: (rule: AutomationRule) => void;
    /** Request a host-owned active-state update. */
    onActiveChange?: (rule: AutomationRule, active: boolean) => void;
    /** Request host-owned actions such as edit or delete. */
    onMoreActions?: (rule: AutomationRule) => void;
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
        <Button
          class="bc-rule-list__more"
          variant="ghost"
          size="icon"
          aria-label={`More actions for ${rule.name}`}
          onclick={() => onMoreActions(rule)}
        >
          <MoreHorizontal aria-hidden="true" />
        </Button>
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
    <p>{emptyRecentRunsLabel}</p>
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
