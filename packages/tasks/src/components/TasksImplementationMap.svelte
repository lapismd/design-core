<script lang="ts">
  import { Badge } from "@stevejuma/ui/shadcn/badge";
  import * as Card from "@stevejuma/ui/shadcn/card";
  import "../lib/tasks-theme.css";
  import type { TasksImplementationBrief } from "../lib/story-data.js";

  let {
    pages,
    components,
  }: {
    pages: readonly TasksImplementationBrief[];
    components: readonly TasksImplementationBrief[];
  } = $props();
</script>

<section
  class="tasks-theme tasks-implementation-map"
  aria-labelledby="tasks-map-heading"
>
  <div class="tasks-implementation-map__intro">
    <p class="tasks-implementation-map__eyebrow">Implementation planning</p>
    <h2 id="tasks-map-heading">Tasks component breakdown</h2>
    <p>
      Build the shell and row/list contracts first, then page compositions and
      detail editing. Every entry has a dedicated placeholder story and spec.
    </p>
  </div>

  <div class="tasks-implementation-map__columns">
    <section aria-labelledby="tasks-map-pages">
      <h3 id="tasks-map-pages">Page compositions</h3>
      <div class="tasks-implementation-map__cards">
        {#each pages as brief (brief.id)}
          <Card.Root>
            <Card.Header>
              <Card.Title>{brief.title}</Card.Title>
              <Card.Description>{brief.summary}</Card.Description>
            </Card.Header>
            <Card.Footer>
              <Badge variant="outline"
                >{brief.storyChecks.length} planned checks</Badge
              >
            </Card.Footer>
          </Card.Root>
        {/each}
      </div>
    </section>

    <section aria-labelledby="tasks-map-components">
      <h3 id="tasks-map-components">Task-specific components</h3>
      <div class="tasks-implementation-map__cards">
        {#each components as brief (brief.id)}
          <Card.Root>
            <Card.Header>
              <Card.Title>{brief.title}</Card.Title>
              <Card.Description>{brief.summary}</Card.Description>
            </Card.Header>
            <Card.Footer>
              <Badge variant="secondary"
                >{brief.reuse.length} reuse targets</Badge
              >
            </Card.Footer>
          </Card.Root>
        {/each}
      </div>
    </section>
  </div>
</section>

<style>
  .tasks-implementation-map {
    min-height: 100%;
    padding: clamp(1rem, 4vw, 3rem);
  }

  .tasks-implementation-map__intro {
    width: min(100%, 72rem);
    margin: 0 auto;
  }

  .tasks-implementation-map__eyebrow {
    margin: 0 0 0.25rem;
    color: var(--tasks-muted-ink);
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  h2,
  h3,
  p {
    margin: 0;
  }

  h2 {
    font-size: clamp(1.5rem, 3vw, 2.25rem);
  }

  .tasks-implementation-map__intro > p:last-child {
    max-width: 52rem;
    margin-top: 0.5rem;
    color: var(--tasks-muted-ink);
  }

  .tasks-implementation-map__columns {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.5rem;
    width: min(100%, 72rem);
    margin: 2rem auto 0;
  }

  .tasks-implementation-map__columns > section {
    display: grid;
    gap: 0.75rem;
  }

  .tasks-implementation-map__cards {
    display: grid;
    gap: 0.75rem;
  }

  .tasks-implementation-map__cards :global([data-slot="card"]) {
    border-color: var(--tasks-divider);
    background: var(--tasks-surface);
    color: var(--tasks-ink);
  }

  @media (max-width: 50rem) {
    .tasks-implementation-map__columns {
      grid-template-columns: 1fr;
    }
  }
</style>
