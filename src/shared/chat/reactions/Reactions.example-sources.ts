export const Basic = `<script lang="ts">
  import { ReactionBar, type Reaction } from "@lapismd/design-core/chat";
  const customEmojis = [{ id: "team", shortcode: "team", label: "Team", url: "https://example.test/team.png" }];
  let reactions = $state<Reaction[]>([{ emoji: "👍", count: 2 }, { emoji: "team", count: 1 }]);
  let selected = $state("");
</script>
<ReactionBar {reactions} {customEmojis}
  onToggle={(emoji) => { reactions = reactions.map((r) => r.emoji === emoji ? { ...r, selected: !r.selected } : r); }}
  onAdd={(emoji, custom) => { selected = custom?.shortcode ?? emoji; }} />
<output>{selected}</output>`;
