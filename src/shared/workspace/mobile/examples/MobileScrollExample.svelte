<script lang="ts">
  import type { WorkspaceViewContext } from "../../core/types.js";
  let { tab }: WorkspaceViewContext = $props();
</script>

<section
  class="mobile-scroll-example"
  aria-label={`Scrollable note: ${tab.title}`}
>
  <a href={`#note-${tab.id}`}>Start of {tab.title}</a>
  <h2 id={`note-${tab.id}`}>{tab.title}</h2>
  {#each Array.from({ length: 60 }) as _, index (index)}
    <p>
      Paragraph {index + 1}. Scroll to read, then scroll upward to reveal
      navigation.
    </p>
  {/each}
</section>

<style>
  .mobile-scroll-example {
    height: 100%;
    overflow: auto;
    padding: 4rem 1rem 6rem;
  }
</style>
