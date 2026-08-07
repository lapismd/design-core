<script lang="ts">
  import type { WorkspaceViewContext } from "../core/types.js";

  let { tab }: WorkspaceViewContext = $props();
</script>

{#if tab.view.type === "terminal-story"}
  <section
    class="ui-workspace-bottom-panel-story-terminal"
    aria-label={tab.title}
  >
    <pre><span>$</span> pnpm test
<span>✓</span> 24 tests passed
<span>$</span> _</pre>
  </section>
{:else}
  <section class="ui-workspace-bottom-panel-story-view" aria-label={tab.title}>
    <h3>{tab.title}</h3>
    <p>{String(tab.view.state?.message ?? "No items to report.")}</p>
  </section>
{/if}
