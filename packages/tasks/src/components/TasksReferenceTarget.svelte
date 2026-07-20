<script lang="ts">
  import "../lib/tasks-theme.css";
  import type { TasksReferenceTarget } from "../lib/story-data.js";

  let { target }: { target: TasksReferenceTarget } = $props();
</script>

<figure
  class="tasks-theme tasks-reference-target"
  data-tasks-target={target.id}
>
  <div class="tasks-reference-target__header">
    <div>
      <p class="tasks-reference-target__eyebrow">Redacted target capture</p>
      <h2>{target.title}</h2>
      <p>{target.description}</p>
    </div>
    <dl aria-label="Capture metadata">
      <div>
        <dt>Viewport</dt>
        <dd>{target.viewport}</dd>
      </div>
      <div>
        <dt>State</dt>
        <dd>{target.state}</dd>
      </div>
    </dl>
  </div>

  <div class="tasks-reference-target__image-frame">
    <img
      src={target.source}
      alt={`Sanitised reference capture for ${target.title}`}
    />
  </div>

  <figcaption>
    Use this as structural and interaction evidence only. It is not an asset,
    copy source, or a final visual implementation.
  </figcaption>
</figure>

<style>
  .tasks-reference-target {
    display: grid;
    gap: 1rem;
    min-height: 100%;
    padding: clamp(1rem, 3vw, 2.5rem);
    color: var(--tasks-ink);
  }

  .tasks-reference-target__header {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 1.5rem;
    width: 100%;
    max-width: 90rem;
    margin: 0 auto;
  }

  .tasks-reference-target__eyebrow {
    margin: 0 0 0.25rem;
    color: var(--tasks-muted-ink);
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  h2,
  p {
    margin: 0;
  }

  h2 {
    font-size: clamp(1.25rem, 2vw, 1.75rem);
  }

  .tasks-reference-target__header > div > p:last-child {
    max-width: 46rem;
    margin-top: 0.5rem;
    color: var(--tasks-muted-ink);
  }

  dl {
    display: grid;
    grid-template-columns: repeat(2, minmax(8rem, 1fr));
    gap: 0.5rem;
    margin: 0;
  }

  dl > div {
    border: 1px solid var(--tasks-divider);
    border-radius: var(--tasks-radius-control);
    background: var(--tasks-surface);
    padding: 0.625rem 0.75rem;
  }

  dt {
    color: var(--tasks-muted-ink);
    font-size: 0.75rem;
  }

  dd {
    margin: 0.125rem 0 0;
    font-size: 0.875rem;
  }

  .tasks-reference-target__image-frame {
    overflow: auto;
    max-width: 90rem;
    margin: 0 auto;
    border: 1px solid var(--tasks-divider);
    border-radius: var(--tasks-radius-shell);
    background: var(--tasks-shell);
    box-shadow: 0 1.5rem 3rem
      color-mix(in oklab, var(--tasks-ink) 10%, transparent);
  }

  img {
    display: block;
    width: 100%;
    min-width: 18rem;
    height: auto;
  }

  figcaption {
    max-width: 90rem;
    margin: 0 auto;
    color: var(--tasks-muted-ink);
    font-size: 0.875rem;
  }

  @media (max-width: 40rem) {
    dl {
      width: 100%;
    }
  }
</style>
