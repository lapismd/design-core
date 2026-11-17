export const CustomLabel = `<script lang="ts">
  import { ReactionBar } from "@lapismd/design-core/ai/experimental";
</script>
<ReactionBar reactions={[{ emoji: "lapis", count: 1, label: "1 reaction with lapis: Maya Chen" }]} onToggle={(emoji) => console.log(emoji)} />`;

export const TextualFallback = `<script lang="ts">
  import { ReactionBar } from "@lapismd/design-core/ai/experimental";
</script>
<ReactionBar reactions={[{ emoji: "ship_it", count: 2 }, { emoji: "👀", count: 3 }]} onToggle={(emoji) => console.log(emoji)} />`;
