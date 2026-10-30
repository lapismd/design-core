<script lang="ts">
  import Owner from "./AppShellSurfaceOwner.stories.fixture.svelte";
  let shown = $state(true);
  let latest = $state(false);
  let first = $state<HTMLElement | null>(null);
  let second = $state<HTMLElement | null>(null);
</script>

<button bind:this={first} type="button">Initial focus target</button>
<button bind:this={second} type="button">Latest focus target</button>
<button type="button" onclick={() => (latest = true)}
  >Change focus target</button
>
<button type="button" onclick={() => (shown = false)}>Remove layer owner</button
>
{#if shown}<Owner target={latest ? second : first} />{/if}
