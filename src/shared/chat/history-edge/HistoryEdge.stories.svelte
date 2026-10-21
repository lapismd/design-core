<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import HistoryEdge from "./HistoryEdge.svelte";
  import { Basic } from "./HistoryEdge.example-sources.js";
  const { Story } = defineMeta({
    title: "Chat/History Edge",
    component: HistoryEdge,
    tags: ["visual-pending"],
    parameters: {
      docs: { source: { code: Basic, language: "tsx", type: "code" } },
    },
  });
</script>

<Story name="Loading" args={{ state: "loading" }} />
<Story name="Retry" args={{ state: "retry", onLoad: () => {} }} />
<Story name="Empty" args={{ state: "empty" }} />
