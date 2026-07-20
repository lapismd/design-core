<script lang="ts">
  import { Badge } from "@stevejuma/ui/shadcn/badge";
  import * as Card from "@stevejuma/ui/shadcn/card";
  import "../lib/tasks-theme.css";
  import type { TasksImplementationBrief } from "../lib/story-data.js";

  let { brief }: { brief: TasksImplementationBrief } = $props();
</script>

<section
  class="tasks-theme tasks-implementation-brief"
  data-tasks-brief={brief.id}
  aria-labelledby={`${brief.id}-heading`}
>
  <Card.Root class="tasks-implementation-brief__card">
    <Card.Header>
      <div class="tasks-implementation-brief__title-row">
        <div>
          <p class="tasks-implementation-brief__eyebrow">
            {brief.kind} placeholder
          </p>
          <Card.Title id={`${brief.id}-heading`}>{brief.title}</Card.Title>
          <Card.Description>{brief.summary}</Card.Description>
        </div>
        <Badge variant="outline">Not implemented</Badge>
      </div>
    </Card.Header>

    <Card.Content>
      <div class="tasks-implementation-brief__grid">
        <section aria-labelledby={`${brief.id}-fixture`}>
          <h3 id={`${brief.id}-fixture`}>Fixture state</h3>
          <p>{brief.fixtureState}</p>
        </section>
        <section aria-labelledby={`${brief.id}-spec`}>
          <h3 id={`${brief.id}-spec`}>Implementation spec</h3>
          <code>{brief.specPath}</code>
        </section>
        <section aria-labelledby={`${brief.id}-responsibilities`}>
          <h3 id={`${brief.id}-responsibilities`}>Responsibilities</h3>
          <ul>
            {#each brief.responsibilities as responsibility}
              <li>{responsibility}</li>
            {/each}
          </ul>
        </section>
        <section aria-labelledby={`${brief.id}-reuse`}>
          <h3 id={`${brief.id}-reuse`}>Reuse first</h3>
          <div class="tasks-implementation-brief__badges">
            {#each brief.reuse as primitive}
              <Badge variant="secondary">{primitive}</Badge>
            {/each}
          </div>
        </section>
        <section aria-labelledby={`${brief.id}-additions`}>
          <h3 id={`${brief.id}-additions`}>Add only when needed</h3>
          <div class="tasks-implementation-brief__badges">
            {#each brief.additions as addition}
              <Badge variant="outline">{addition}</Badge>
            {/each}
          </div>
        </section>
        <section aria-labelledby={`${brief.id}-checks`}>
          <h3 id={`${brief.id}-checks`}>Required story checks</h3>
          <ul>
            {#each brief.storyChecks as check}
              <li>{check}</li>
            {/each}
          </ul>
        </section>
      </div>
    </Card.Content>

    <Card.Footer>
      <p>
        This is a catalog planning surface. Build the actual composition only in
        a dedicated implementation slice with the corresponding interactive
        story.
      </p>
    </Card.Footer>
  </Card.Root>
</section>

<style>
  .tasks-implementation-brief {
    min-height: 100%;
    padding: clamp(1rem, 4vw, 3rem);
  }

  :global(.tasks-implementation-brief__card) {
    width: min(100%, 72rem);
    margin: 0 auto;
    border-color: var(--tasks-divider);
    background: var(--tasks-surface);
    color: var(--tasks-ink);
  }

  .tasks-implementation-brief__title-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
  }

  .tasks-implementation-brief__eyebrow {
    margin: 0 0 0.25rem;
    color: var(--tasks-muted-ink);
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .tasks-implementation-brief__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
  }

  .tasks-implementation-brief__grid > section {
    min-width: 0;
    border: 1px solid var(--tasks-divider);
    border-radius: var(--tasks-radius-control);
    background: var(--tasks-surface-raised);
    padding: 1rem;
  }

  h3,
  p,
  ul {
    margin: 0;
  }

  h3 {
    font-size: 0.875rem;
  }

  section p,
  li,
  code {
    color: var(--tasks-muted-ink);
    font-size: 0.875rem;
    line-height: 1.4;
  }

  section p,
  code,
  ul,
  .tasks-implementation-brief__badges {
    display: block;
    margin-top: 0.5rem;
  }

  ul {
    padding-left: 1.125rem;
  }

  .tasks-implementation-brief__badges {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .tasks-implementation-brief :global([data-slot="card-footer"] p) {
    color: var(--tasks-muted-ink);
    font-size: 0.875rem;
  }

  @media (max-width: 42rem) {
    .tasks-implementation-brief__grid {
      grid-template-columns: 1fr;
    }
  }
</style>
