<script lang="ts">
  import * as Table from "@stevejuma/ui/shadcn/table";
  import * as Empty from "@stevejuma/ui/shadcn/empty";

  export type ValidationErrorRow = {
    id: string;
    line?: string | number;
    message: string;
    entity?: string;
    href?: string;
  };

  export type ValidationErrorEmptyVariant = "standard" | "compact";

  let {
    errors,
    ariaLabel = "Validation errors",
    emptyTitle = "No validation errors",
    emptyDescription = "This ledger has no errors to review.",
    emptyVariant = "standard",
    onNavigate,
  }: {
    errors: readonly ValidationErrorRow[];
    ariaLabel?: string;
    emptyTitle?: string;
    emptyDescription?: string;
    /** A compact route-level empty panel for Fava-derived record views. */
    emptyVariant?: ValidationErrorEmptyVariant;
    onNavigate?: (error: ValidationErrorRow) => void;
  } = $props();

  function navigate(error: ValidationErrorRow, event: MouseEvent) {
    if (onNavigate) event.preventDefault();
    onNavigate?.(error);
  }
</script>

{#if errors.length}
  <div class="bc-validation-error-table">
    <Table.Root aria-label={ariaLabel} class="bc-validation-error-table__table">
      <Table.Header>
        <Table.Row class="bc-validation-error-table__header-row">
          <Table.Head
            class="bc-validation-error-table__head bc-validation-error-table__head--line"
          >
            Line
          </Table.Head>
          <Table.Head
            class="bc-validation-error-table__head bc-validation-error-table__head--message"
          >
            Message
          </Table.Head>
          <Table.Head
            class="bc-validation-error-table__head bc-validation-error-table__head--context"
          >
            Source context
          </Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {#each errors as error (error.id)}
          <Table.Row>
            <Table.Cell
              class="bc-validation-error-table__cell bc-validation-error-table__cell--line"
            >
              {#if error.href}
                <a
                  href={error.href}
                  class="bc-validation-error-table__line-link"
                  onclick={(event) => navigate(error, event)}
                  >{error.line ?? "—"}</a
                >
              {:else}
                {error.line ?? "—"}
              {/if}
            </Table.Cell>
            <Table.Cell
              class="bc-validation-error-table__cell bc-validation-error-table__cell--message"
            >
              {error.message}
            </Table.Cell>
            <Table.Cell
              class="bc-validation-error-table__cell bc-validation-error-table__cell--context"
            >
              {#if error.entity}
                <code class="bc-validation-error-table__entity"
                  >{error.entity}</code
                >
              {:else}
                <span class="bc-validation-error-table__missing">—</span>
              {/if}
            </Table.Cell>
          </Table.Row>
        {/each}
      </Table.Body>
    </Table.Root>
  </div>
{:else if emptyVariant === "compact"}
  <div class="bc-validation-error-table__compact-empty" aria-label={ariaLabel}>
    <p>{emptyTitle}</p>
  </div>
{:else}
  <Empty.Root class="bc-validation-error-table__empty" aria-label={ariaLabel}>
    <Empty.Header>
      <Empty.Title>{emptyTitle}</Empty.Title>
      <Empty.Description>{emptyDescription}</Empty.Description>
    </Empty.Header>
  </Empty.Root>
{/if}

<style>
  .bc-validation-error-table {
    overflow-x: auto;
    border: 1px solid
      color-mix(in srgb, var(--ui-beancount-border) 80%, transparent);
    border-radius: var(--ui-beancount-radius-panel);
    background: var(--ui-beancount-surface-raised);
    box-shadow: var(--ui-beancount-shadow-panel);
  }

  :global(.bc-validation-error-table__table) {
    min-width: 42rem;
  }

  :global(.bc-validation-error-table__header-row) {
    background: color-mix(
      in srgb,
      var(--ui-beancount-surface-muted) 65%,
      transparent
    );
  }

  :global(.bc-validation-error-table__header-row:hover) {
    background: color-mix(
      in srgb,
      var(--ui-beancount-surface-muted) 65%,
      transparent
    );
  }

  :global(.bc-validation-error-table__head) {
    padding: var(--ui-beancount-space-2) var(--ui-beancount-space-4);
    font-size: var(--text-xs);
    font-weight: var(--font-weight-semibold);
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  :global(.bc-validation-error-table__head--line) {
    width: 5rem;
  }

  :global(.bc-validation-error-table__head--message) {
    min-width: 18rem;
  }

  :global(.bc-validation-error-table__head--context) {
    min-width: 20rem;
  }

  :global(.bc-validation-error-table__cell) {
    padding: var(--ui-beancount-space-3) var(--ui-beancount-space-4);
  }

  :global(.bc-validation-error-table__cell--line) {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    font-variant-numeric: tabular-nums;
  }

  :global(.bc-validation-error-table__cell--message) {
    vertical-align: top;
    color: var(--ui-beancount-negative);
    font-size: var(--text-sm);
  }

  :global(.bc-validation-error-table__cell--context) {
    vertical-align: top;
  }

  .bc-validation-error-table__line-link {
    color: var(--ui-beancount-accent);
    font-weight: var(--font-weight-medium);
    text-underline-offset: 4px;
  }

  .bc-validation-error-table__line-link:hover {
    text-decoration: underline;
  }

  .bc-validation-error-table__line-link:focus-visible {
    outline: 2px solid var(--ui-beancount-focus-ring);
    outline-offset: 2px;
  }

  .bc-validation-error-table__entity {
    display: block;
    overflow-wrap: anywhere;
    color: var(--ui-beancount-muted-foreground);
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    line-height: var(--leading-relaxed);
    white-space: pre-wrap;
  }

  .bc-validation-error-table__missing {
    color: var(--ui-beancount-muted-foreground);
    font-size: var(--text-sm);
  }

  :global(.bc-validation-error-table__empty) {
    border-color: color-mix(
      in srgb,
      var(--ui-beancount-border) 80%,
      transparent
    );
    background: var(--ui-beancount-surface-raised);
    box-shadow: var(--ui-beancount-shadow-panel);
  }

  .bc-validation-error-table__compact-empty {
    display: flex;
    min-height: calc(var(--ui-beancount-space-4) * 4);
    align-items: center;
    border: 1px solid var(--ui-beancount-border);
    border-radius: var(--ui-beancount-radius-panel);
    background: var(--ui-beancount-surface);
    padding-inline: calc(var(--ui-beancount-space-4) * 1.5);
    color: var(--ui-beancount-foreground);
    font-size: var(--text-base);
  }

  .bc-validation-error-table__compact-empty p {
    margin: 0;
  }
</style>
