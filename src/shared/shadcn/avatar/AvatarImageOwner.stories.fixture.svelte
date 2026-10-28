<script lang="ts">
  import { onDestroy } from "svelte";
  import Avatar from "./avatar.svelte";
  let { name, src }: { name: string; src: string } = $props();
  let host: HTMLDivElement;
  // Simulate a pending resource failure delivered during owner teardown.
  onDestroy(() => host.querySelector("img")?.dispatchEvent(new Event("error")));
</script>

<div bind:this={host}><Avatar {name} {src} /></div>
