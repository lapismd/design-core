<script lang="ts">
  import type { WorkspaceViewContext } from "../core/types.js";

  let { tab, active, setState }: WorkspaceViewContext = $props();

  const initialCount = () => Number(tab.view.state?.count ?? 0);
  let count = $state(initialCount());

  function increment() {
    count += 1;
    setState({ count });
  }
</script>

<section class="example-workspace-view" aria-label={tab.title}>
  <h2>{tab.title}</h2>
  <p>This view is {active ? "active" : "inactive"}.</p>
  <button type="button" onclick={increment}>Count {count}</button>
</section>

<style>
  .example-workspace-view {
    display: grid;
    height: 100%;
    box-sizing: border-box;
    place-content: center;
    gap: 0.75rem;
    text-align: center;
  }

  h2,
  p {
    margin: 0;
  }
</style>
