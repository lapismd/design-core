<script lang="ts">
  import { ReactionBar, type Reaction } from "../index.js";
  import { customEmojis, reactionChoices } from "../chat.stories.data.js";
  let {
    disabled = false,
    restricted = false,
    empty = false,
  }: { disabled?: boolean; restricted?: boolean; empty?: boolean } = $props();
  let reactions = $state<Reaction[]>([
    { emoji: "🎉", count: 4, selected: true },
    { emoji: "lapis", count: 2 },
  ]);
  let last = $state("No reaction changes");
</script>

<div style="padding:2rem;display:grid;gap:1rem">
  <ReactionBar
    {reactions}
    {customEmojis}
    {disabled}
    {...empty ? { emojis: [] } : restricted ? { emojis: reactionChoices } : {}}
    onToggle={(emoji, custom) => {
      reactions = reactions.map((item) =>
        item.emoji === emoji
          ? {
              ...item,
              count: item.count + (item.selected ? -1 : 1),
              selected: !item.selected,
            }
          : item,
      );
      last = `Toggled ${custom?.shortcode ?? emoji}`;
    }}
    onAdd={(emoji, custom) => (last = `Added ${custom?.shortcode ?? emoji}`)}
  />
  <output aria-live="polite">{last}</output>
</div>
