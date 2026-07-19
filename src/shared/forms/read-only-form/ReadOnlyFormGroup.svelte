<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    title = "",
    meta = "",
    children,
  }: {
    title?: string;
    meta?: string;
    children?: Snippet;
  } = $props();
</script>

<section class="cv-readonly-form-group">
  {#if title || meta}
    <header>
      {#if title}
        <h4>{title}</h4>
      {/if}
      {#if meta}
        <p>{meta}</p>
      {/if}
    </header>
  {/if}
  <div class="cv-readonly-form-group-body">
    {@render children?.()}
  </div>
</section>

<style>
  .cv-readonly-form-group {
    display: grid;
    gap: 0;
    min-width: 0;
  }

  .cv-readonly-form-group > header {
    display: grid;
    gap: 0.1rem;
    border-bottom: 1px solid
      var(--ui-form-border);
    padding: 0.45rem 0 0.35rem;
  }

  .cv-readonly-form-group h4 {
    color: var(--ui-form-foreground);
    font-size: 0.8125rem;
    font-weight: 600;
    line-height: 1.35;
    margin: 0;
  }

  .cv-readonly-form-group p {
    color: var(--ui-form-muted);
    font-family: var(
      --ui-form-mono,
      ui-monospace,
      SFMono-Regular,
      Menlo,
      monospace
    );
    font-size: 0.6875rem;
    line-height: 1.35;
    margin: 0;
    overflow-wrap: anywhere;
  }

  .cv-readonly-form-group-body {
    display: grid;
    gap: 0;
    min-width: 0;
  }
</style>
