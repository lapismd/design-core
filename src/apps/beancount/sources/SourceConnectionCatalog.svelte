<script lang="ts">
  import ArrowRight from "@lucide/svelte/icons/arrow-right";
  import ChevronRight from "@lucide/svelte/icons/chevron-right";
  import { Badge } from "@stevejuma/ui/shadcn/badge";
  import { Button } from "@stevejuma/ui/shadcn/button";
  import * as Card from "@stevejuma/ui/shadcn/card";

  export type SourceBrandTone = "primary" | "positive" | "negative";

  export type ConnectedSource = {
    id: string;
    name: string;
    initials: string;
    sourceCount: number;
    syncLabel: string;
    statusLabel: string;
    tone?: SourceBrandTone;
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
    ariaLabel = "Source connections",
    onOpenConnection,
    onConnect = () => {},
  }: {
    connectedSources?: readonly ConnectedSource[];
    availableSources?: readonly AvailableSource[];
    ariaLabel?: string;
    /** Requests that the host open the selected connected source. */
    onOpenConnection?: (source: ConnectedSource) => void;
    /** Requests that the host start setup for an available source. */
    onConnect?: (source: AvailableSource) => void;
  } = $props();
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
            onclick={() => onOpenConnection?.(source)}
          >
            <ChevronRight
              class="bc-source-catalog__connected-chevron"
              aria-hidden="true"
            />
            <span
              class="bc-source-catalog__brand"
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
              class="bc-source-catalog__brand"
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
    gap: calc(var(--ui-beancount-space-5) * 2);
  }

  .bc-source-catalog__section {
    gap: var(--ui-beancount-space-3);
  }

  .bc-source-catalog__heading {
    margin: 0;
    color: var(--ui-beancount-muted-foreground);
    font-size: var(--text-sm);
    font-weight: var(--font-weight-medium);
    letter-spacing: 0.04em;
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
    grid-template-columns: auto auto minmax(0, 1fr) auto;
    align-items: center;
    gap: var(--ui-beancount-space-3);
    padding: calc(var(--ui-beancount-space-4) * 1.25);
    color: var(--ui-beancount-foreground);
    text-align: left;
  }

  .bc-source-catalog__connected-action:focus-visible,
  :global(.bc-source-catalog__connect):focus-visible {
    outline: 2px solid var(--ui-beancount-focus-ring);
    outline-offset: 2px;
  }

  :global(.bc-source-catalog__connected-chevron) {
    width: var(--ui-beancount-space-5);
    height: var(--ui-beancount-space-5);
    color: var(--ui-beancount-muted-foreground);
  }

  .bc-source-catalog__brand {
    display: inline-flex;
    width: calc(var(--ui-beancount-space-5) * 2.75);
    height: calc(var(--ui-beancount-space-5) * 2.75);
    flex: none;
    align-items: center;
    justify-content: center;
    border-radius: var(--ui-beancount-radius-panel);
    background: color-mix(in srgb, var(--primary) 85%, var(--background));
    color: var(--primary-foreground);
    font-size: var(--text-sm);
    font-weight: var(--font-weight-semibold);
  }

  .bc-source-catalog__brand[data-tone="positive"] {
    background: color-mix(
      in srgb,
      var(--ui-beancount-positive) 85%,
      var(--background)
    );
    color: var(--ui-beancount-surface);
  }

  .bc-source-catalog__brand[data-tone="negative"] {
    background: color-mix(
      in srgb,
      var(--ui-beancount-negative) 78%,
      var(--background)
    );
    color: var(--destructive-foreground);
  }

  .bc-source-catalog__connected-name,
  .bc-source-catalog__available-name-row h3 {
    color: var(--ui-beancount-foreground);
    font-size: var(--text-lg);
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

  .bc-source-catalog__available-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: var(--ui-beancount-space-3);
  }

  :global(.bc-source-catalog__available-card) {
    min-height: 17.75rem;
    justify-content: space-between;
    padding: calc(var(--ui-beancount-space-4) * 1.5);
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
    font-size: var(--text-sm);
  }

  .bc-source-catalog__available-identity p {
    margin-block-start: var(--ui-beancount-space-1);
  }

  .bc-source-catalog__available-description {
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
