<script lang="ts">
  import { tick } from "svelte";
  import CommentComposer from "./CommentComposer.svelte";
  let shown = $state(true);
  let generation = $state(0);
  let value = $state("");
  async function replace() {
    shown = false;
    await tick();
    generation++;
    shown = true;
  }
</script>

<button type="button" onclick={replace}>Replace composer</button>
<p data-testid="composer-generation">{generation}</p>
{#if shown}<CommentComposer bind:value />{/if}
<p data-testid="retained-comment">{value}</p>
