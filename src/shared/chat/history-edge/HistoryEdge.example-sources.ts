export const Basic = `<script lang="ts">
  import { HistoryEdge } from "@lapismd/design-core/chat";
  let loading = $state(false);
</script>
<HistoryEdge state={loading ? "loading" : "idle"} onLoad={() => { loading = true; }} />`;
