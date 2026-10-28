export const Basic = `<script lang="ts">
  import { ContentViewToggle } from "@lapismd/design-core/chat";
  let view = $state<"formatted" | "source">("formatted");
</script>
<ContentViewToggle bind:view />
<p>Selected presentation: {view}</p>`;
