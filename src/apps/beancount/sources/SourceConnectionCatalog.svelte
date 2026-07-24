<script lang="ts">
  import ArrowRight from "@lucide/svelte/icons/arrow-right";
  import ChevronDown from "@lucide/svelte/icons/chevron-down";
  import { Badge } from "@stevejuma/ui/shadcn/badge";
  import { Button } from "@stevejuma/ui/shadcn/button";
  import * as Card from "@stevejuma/ui/shadcn/card";
  import * as Field from "@stevejuma/ui/shadcn/field";
  import { Input } from "@stevejuma/ui/shadcn/input";

  export type SourceBrandTone = "primary" | "positive" | "negative";

  /** A host-owned field value ready to display in a source connection form. */
  export type SourceConnectionField = {
    id: string;
    label: string;
    value: string;
    type?: "password" | "text" | "url";
    placeholder?: string;
    description?: string;
    disabled?: boolean;
  };

  /** A linked ledger account ready to open through a host callback. */
  export type SourceConnectionAccount = {
    id: string;
    name: string;
    account: string;
    currency?: string;
  };

  /**
   * Display-only detail model for the expanded Fava source-connection card.
   * The adapter owns all field values, validation, secret storage, and saves.
   */
  export type SourceConnectionDetails = {
    setupLabel?: string;
    setupSteps?: readonly string[];
    fields?: readonly SourceConnectionField[];
    linkedAccounts?: readonly SourceConnectionAccount[];
    updateLabel?: string;
    updateDisabled?: boolean;
  };

  export type ConnectedSource = {
    id: string;
    name: string;
    initials: string;
    sourceCount: number;
    syncLabel: string;
    statusLabel: string;
    tone?: SourceBrandTone;
    details?: SourceConnectionDetails;
  };

  export type AvailableSource = {
    id: string;
    name: string;
    initials: string;
    badgeLabel?: string;
    locationLabel: string;
    description: string;
    tone?: SourceBrandTone;
  };

  let {
    connectedSources = [],
    availableSources = [],
    expandedSourceId,
    ariaLabel = "Source connections",
    onOpenConnection,
    onExpandedSourceChange,
    onConnectionFieldChange,
    onOpenLinkedAccount,
    onUpdateConnection,
    onConnect = () => {},
  }: {
    connectedSources?: readonly ConnectedSource[];
    availableSources?: readonly AvailableSource[];
    /** The ID of the connected source whose display-ready details are visible. */
    expandedSourceId?: string;
    ariaLabel?: string;
    /** Requests that the host open the selected connected source. */
    onOpenConnection?: (source: ConnectedSource) => void;
    /** Requests the next controlled expanded source, or closes the current one. */
    onExpandedSourceChange?: (source: ConnectedSource | undefined) => void;
    /** Sends a display field edit back to the host without storing it locally. */
    onConnectionFieldChange?: (
      source: ConnectedSource,
      field: SourceConnectionField,
      value: string,
    ) => void;
    /** Requests navigation to a linked ledger account. */
    onOpenLinkedAccount?: (
      source: ConnectedSource,
      account: SourceConnectionAccount,
    ) => void;
    /** Requests that the host persist the displayed connection settings. */
    onUpdateConnection?: (source: ConnectedSource) => void;
    /** Requests that the host start setup for an available source. */
    onConnect?: (source: AvailableSource) => void;
  } = $props();

  function detailsId(source: ConnectedSource) {
    return `source-connection-details-${source.id}`;
  }

  function isExpanded(source: ConnectedSource) {
    return Boolean(source.details && source.id === expandedSourceId);
  }

  function toggleDetails(source: ConnectedSource) {
    onOpenConnection?.(source);
    onExpandedSourceChange?.(isExpanded(source) ? undefined : source);
  }
</script>

<section class="bc-source-catalog" aria-label={ariaLabel}>
  <div class="bc-source-catalog__section">
    <h2 class="bc-source-catalog__heading">
      Your connections · {connectedSources.length}
    </h2>
    <div class="bc-source-catalog__connected-list">
      {#each connectedSources as source (source.id)}
        <Card.Root class="bc-source-catalog__connected-card">
          <button
            type="button"
            class="bc-source-catalog__connected-action"
            aria-label={`Open ${source.name}`}
            aria-controls={source.details ? detailsId(source) : undefined}
            aria-expanded={source.details ? isExpanded(source) : undefined}
            onclick={() => toggleDetails(source)}
          >
            <ChevronDown
              class="bc-source-catalog__connected-chevron"
              data-expanded={isExpanded(source)}
              aria-hidden="true"
            />
            <span
              class="bc-source-catalog__brand bc-source-catalog__brand--connected"
              data-tone={source.tone ?? "primary"}
              aria-hidden="true"
            >
              {source.initials}
            </span>
            <span class="bc-source-catalog__connected-name">{source.name}</span>
            <span class="bc-source-catalog__connected-meta">
              <Badge variant="secondary">{source.sourceCount}</Badge>
              <span>{source.syncLabel}</span>
              <Badge variant="secondary">{source.statusLabel}</Badge>
            </span>
          </button>
          {#if isExpanded(source) && source.details}
            <section
              class="bc-source-catalog__connection-details"
              id={detailsId(source)}
              aria-label={`${source.name} connection details`}
            >
              {#if source.details.setupSteps?.length}
                <div class="bc-source-catalog__setup">
                  <h3>{source.details.setupLabel ?? "Setup"}</h3>
                  <ol>
                    {#each source.details.setupSteps as step (step)}
                      <li>{step}</li>
                    {/each}
                  </ol>
                </div>
              {/if}

              {#if source.details.fields?.length}
                <Field.Set class="bc-source-catalog__field-set">
                  <Field.Group>
                    {#each source.details.fields as field (`${source.id}-${field.id}`)}
                      {@const fieldId = `source-${source.id}-${field.id}`}
                      <Field.Field>
                        <Field.Label for={fieldId}>{field.label}</Field.Label>
                        {#if field.description}
                          <Field.Description
                            >{field.description}</Field.Description
                          >
                        {/if}
                        <Input
                          id={fieldId}
                          type={field.type ?? "text"}
                          value={field.value}
                          placeholder={field.placeholder}
                          disabled={field.disabled || !onConnectionFieldChange}
                          oninput={(event) =>
                            onConnectionFieldChange?.(
                              source,
                              field,
                              (event.currentTarget as HTMLInputElement).value,
                            )}
                        />
                      </Field.Field>
                    {/each}
                  </Field.Group>
                </Field.Set>
              {/if}

              {#if source.details.linkedAccounts?.length}
                <div class="bc-source-catalog__linked-accounts">
                  <h3>Linked accounts</h3>
                  <ul>
                    {#each source.details.linkedAccounts as account (account.id)}
                      <li>
                        <button
                          type="button"
                          aria-label={`Open ${account.account}`}
                          disabled={!onOpenLinkedAccount}
                          onclick={() => onOpenLinkedAccount?.(source, account)}
                        >
                          <span>
                            <strong>{account.name}</strong>
                            <span>{account.account}</span>
                          </span>
                          {#if account.currency}
                            <span>{account.currency}</span>
                          {/if}
                        </button>
                      </li>
                    {/each}
                  </ul>
                </div>
              {/if}

              {#if onUpdateConnection}
                <Button
                  class="bc-source-catalog__update"
                  disabled={source.details.updateDisabled}
                  onclick={() => onUpdateConnection(source)}
                >
                  {source.details.updateLabel ?? "Update connection"}
                </Button>
              {/if}
            </section>
          {/if}
        </Card.Root>
      {:else}
        <p class="bc-source-catalog__empty">No connections configured.</p>
      {/each}
    </div>
  </div>

  <div class="bc-source-catalog__section">
    <h2 class="bc-source-catalog__heading">
      Available · {availableSources.length}
    </h2>
    <div class="bc-source-catalog__available-grid">
      {#each availableSources as source (source.id)}
        <Card.Root class="bc-source-catalog__available-card">
          <div class="bc-source-catalog__available-header">
            <span
              class="bc-source-catalog__brand bc-source-catalog__brand--available"
              data-tone={source.tone ?? "primary"}
              aria-hidden="true"
            >
              {source.initials}
            </span>
            <div class="bc-source-catalog__available-identity">
              <div class="bc-source-catalog__available-name-row">
                <h3>{source.name}</h3>
                {#if source.badgeLabel}
                  <Badge variant="secondary">{source.badgeLabel}</Badge>
                {/if}
              </div>
              <p>{source.locationLabel}</p>
            </div>
          </div>
          <p class="bc-source-catalog__available-description">
            {source.description}
          </p>
          <Button
            variant="link"
            class="bc-source-catalog__connect"
            aria-label={`Connect ${source.name}`}
            onclick={() => onConnect(source)}
          >
            Connect
            <ArrowRight data-icon="inline-end" aria-hidden="true" />
          </Button>
        </Card.Root>
      {:else}
        <p class="bc-source-catalog__empty">No additional sources available.</p>
      {/each}
    </div>
  </div>
</section>

<style>
  .bc-source-catalog,
  .bc-source-catalog__section,
  .bc-source-catalog__connected-list {
    display: grid;
  }

  .bc-source-catalog {
    gap: calc(var(--ui-beancount-space-4) * 2);
  }

  .bc-source-catalog__section {
    gap: var(--ui-beancount-space-4);
  }

  .bc-source-catalog__heading {
    margin: 0;
    color: var(--ui-beancount-muted-foreground);
    font-size: var(--text-xs);
    font-weight: var(--font-weight-medium);
    letter-spacing: 0.025em;
    text-transform: uppercase;
  }

  :global(.bc-source-catalog__connected-card),
  :global(.bc-source-catalog__available-card) {
    border: 1px solid var(--ui-beancount-border);
    box-shadow: var(--ui-beancount-shadow-panel);
  }

  :global(.bc-source-catalog__connected-card) {
    padding: 0;
  }

  .bc-source-catalog__connected-action {
    display: grid;
    width: 100%;
    min-height: calc(var(--ui-beancount-space-4) * 4);
    grid-template-columns: auto auto minmax(0, 1fr) auto;
    align-items: center;
    gap: var(--ui-beancount-space-3);
    padding: var(--ui-beancount-space-3) var(--ui-beancount-space-4);
    color: var(--ui-beancount-foreground);
    text-align: left;
  }

  .bc-source-catalog__connected-action:focus-visible,
  :global(.bc-source-catalog__connect):focus-visible {
    outline: 2px solid var(--ui-beancount-focus-ring);
    outline-offset: 2px;
  }

  :global(.bc-source-catalog__connected-chevron) {
    width: var(--ui-beancount-space-4);
    height: var(--ui-beancount-space-4);
    color: var(--ui-beancount-muted-foreground);
    transition: transform 150ms ease;
    transform: rotate(-90deg);
  }

  :global(.bc-source-catalog__connected-chevron[data-expanded="true"]) {
    transform: rotate(0deg);
  }

  .bc-source-catalog__brand {
    display: inline-flex;
    width: calc(var(--ui-beancount-space-3) * 3);
    height: calc(var(--ui-beancount-space-3) * 3);
    flex: none;
    align-items: center;
    justify-content: center;
    background: color-mix(
      in srgb,
      var(--ui-beancount-accent) 85%,
      var(--ui-beancount-surface)
    );
    color: var(--ui-beancount-accent-foreground);
    font-size: var(--text-sm);
    font-weight: var(--font-weight-semibold);
  }

  .bc-source-catalog__brand--connected {
    border-radius: 999px;
  }

  .bc-source-catalog__brand.bc-source-catalog__brand--connected[data-tone="negative"] {
    background: color-mix(
      in srgb,
      var(--ui-beancount-negative) 24%,
      var(--ui-beancount-surface)
    );
    color: var(--ui-beancount-negative);
  }

  .bc-source-catalog__brand--available {
    border-radius: var(--ui-beancount-radius-panel);
  }

  .bc-source-catalog__brand[data-tone="positive"] {
    background: color-mix(
      in srgb,
      var(--ui-beancount-positive) 85%,
      var(--ui-beancount-surface)
    );
    color: var(--ui-beancount-surface);
  }

  .bc-source-catalog__brand[data-tone="negative"] {
    background: color-mix(
      in srgb,
      var(--ui-beancount-negative) 78%,
      var(--ui-beancount-surface)
    );
    color: var(--ui-beancount-negative-foreground);
  }

  .bc-source-catalog__connected-name,
  .bc-source-catalog__available-name-row h3 {
    color: var(--ui-beancount-foreground);
    font-size: var(--text-sm);
    font-weight: var(--font-weight-semibold);
  }

  .bc-source-catalog__connected-meta {
    display: flex;
    align-items: center;
    gap: var(--ui-beancount-space-3);
    color: var(--ui-beancount-muted-foreground);
    font-size: var(--text-sm);
    white-space: nowrap;
  }

  .bc-source-catalog__connection-details {
    display: grid;
    gap: var(--ui-beancount-space-4);
    border-top: 1px solid var(--ui-beancount-border);
    padding: var(--ui-beancount-space-4);
  }

  .bc-source-catalog__setup {
    border-radius: var(--ui-beancount-radius-panel);
    background: color-mix(
      in srgb,
      var(--ui-beancount-muted) 66%,
      var(--ui-beancount-surface)
    );
    padding: var(--ui-beancount-space-3);
    color: var(--ui-beancount-muted-foreground);
  }

  .bc-source-catalog__setup h3,
  .bc-source-catalog__linked-accounts h3 {
    margin: 0;
    color: var(--ui-beancount-foreground);
    font-size: var(--text-sm);
    font-weight: var(--font-weight-semibold);
  }

  .bc-source-catalog__setup ol {
    display: grid;
    gap: var(--ui-beancount-space-1);
    margin: var(--ui-beancount-space-2) 0 0;
    padding-inline-start: calc(var(--ui-beancount-space-4) * 1.5);
    font-size: var(--text-sm);
    line-height: var(--leading-relaxed);
  }

  :global(.bc-source-catalog__field-set) {
    gap: var(--ui-beancount-space-3);
  }

  .bc-source-catalog__linked-accounts,
  .bc-source-catalog__linked-accounts ul {
    display: grid;
    gap: var(--ui-beancount-space-2);
  }

  .bc-source-catalog__linked-accounts ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .bc-source-catalog__linked-accounts button {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    gap: var(--ui-beancount-space-3);
    border: 1px solid var(--ui-beancount-border);
    border-radius: var(--ui-beancount-radius-panel);
    padding: var(--ui-beancount-space-3);
    color: var(--ui-beancount-foreground);
    text-align: left;
  }

  .bc-source-catalog__linked-accounts button:hover:not(:disabled) {
    background: var(--ui-beancount-muted);
  }

  .bc-source-catalog__linked-accounts button:focus-visible {
    outline: 2px solid var(--ui-beancount-focus-ring);
    outline-offset: 2px;
  }

  .bc-source-catalog__linked-accounts button:disabled {
    cursor: default;
  }

  .bc-source-catalog__linked-accounts button > span:first-child {
    display: grid;
    min-width: 0;
    gap: var(--ui-beancount-space-1);
  }

  .bc-source-catalog__linked-accounts strong {
    font-size: var(--text-sm);
    font-weight: var(--font-weight-medium);
  }

  .bc-source-catalog__linked-accounts strong + span,
  .bc-source-catalog__linked-accounts button > span:last-child {
    color: var(--ui-beancount-muted-foreground);
    font-size: var(--text-xs);
  }

  :global(.bc-source-catalog__update) {
    width: 100%;
  }

  .bc-source-catalog__available-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: var(--ui-beancount-space-3);
  }

  :global(.bc-source-catalog__available-card) {
    min-height: calc(var(--ui-beancount-space-4) * 11);
    gap: var(--ui-beancount-space-3);
    justify-content: space-between;
    padding: var(--ui-beancount-space-4);
  }

  .bc-source-catalog__available-header {
    display: flex;
    align-items: center;
    gap: var(--ui-beancount-space-3);
  }

  .bc-source-catalog__available-identity,
  .bc-source-catalog__available-name-row {
    min-width: 0;
  }

  .bc-source-catalog__available-name-row {
    display: flex;
    align-items: center;
    gap: var(--ui-beancount-space-2);
  }

  .bc-source-catalog__available-name-row h3,
  .bc-source-catalog__available-identity p,
  .bc-source-catalog__available-description,
  .bc-source-catalog__empty {
    margin: 0;
  }

  .bc-source-catalog__available-name-row h3 {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .bc-source-catalog__available-identity p,
  .bc-source-catalog__available-description,
  .bc-source-catalog__empty {
    color: var(--ui-beancount-muted-foreground);
    font-size: var(--text-xs);
  }

  .bc-source-catalog__available-identity p {
    margin-block-start: calc(var(--ui-beancount-space-1) / 2);
  }

  .bc-source-catalog__available-description {
    font-size: var(--text-sm);
    line-height: var(--leading-relaxed);
  }

  :global(.bc-source-catalog__connect) {
    align-self: flex-end;
    margin-inline-start: auto;
  }

  @media (max-width: 760px) {
    .bc-source-catalog__available-grid {
      grid-template-columns: 1fr;
    }

    .bc-source-catalog__connected-action {
      grid-template-columns: auto auto minmax(0, 1fr);
    }

    .bc-source-catalog__connected-meta {
      grid-column: 3;
      grid-row: 2;
      flex-wrap: wrap;
    }
  }
</style>
