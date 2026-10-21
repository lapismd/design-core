<script lang="ts">
  import Owner from "./AvatarImageOwner.stories.fixture.svelte";
  let shown = $state(true);
  let source = $state(
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Crect width='24' height='24' fill='purple'/%3E%3C/svg%3E",
  );
  function toggle() {
    if (shown) source += "#replacement";
    shown = !shown;
  }
</script>

<button onclick={toggle}>Toggle image</button>
<button onclick={() => (source += "#replacement")}>Replace image</button>
{#if shown}
  {@const person = { name: "Ada Lovelace", src: source }}
  <Owner name={person.name} src={person.src} />
{/if}
