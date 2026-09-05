<script lang="ts">
  import SearchFilterBar from "@lapismd/design-core/filter/SearchFilterBar.svelte";

  let query = $state("");
</script>

<SearchFilterBar
  value={query}
  inputMode="plain"
  placeholder="Search everything"
  ariaLabel="Search community"
  shortcut="⌘K"
  onValueChange={(value) => {
    query = value;
  }}
  onClearSearch={() => {
    query = "";
  }}
/>
