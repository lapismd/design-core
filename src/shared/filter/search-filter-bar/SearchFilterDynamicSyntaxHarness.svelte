<script lang="ts">
  import { onDestroy } from "svelte";
  import SearchFilterInput from "./SearchFilterInput.svelte";
  import type { SearchFilterSyntax } from "./search-filter-syntax.js";
  let refreshed = $state(false);
  let timer: ReturnType<typeof setTimeout>;
  let syntax = $state<SearchFilterSyntax>({
    fields: [{ name: "path", operators: [":"] }],
  });
  onDestroy(() => clearTimeout(timer));
  function refresh() {
    clearTimeout(timer);
    timer = setTimeout(() => {
      syntax = {
        fields: [
          { name: "path", operators: [":"], values: ["Notes/Welcome.md"] },
        ],
      };
      refreshed = true;
    }, 0);
  }
</script>

<div onfocusin={refresh} style="width: 20rem; padding: 1rem;">
  <SearchFilterInput
    inputMode="filter-query"
    filterSyntax={syntax}
    ariaLabel="Dynamic vault search"
  />
  <output>{refreshed ? "Catalog refreshed" : "Waiting for catalog"}</output>
</div>
