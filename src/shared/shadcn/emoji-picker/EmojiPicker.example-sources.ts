export const Full = `<script lang="ts">
  import { EmojiPicker } from "@lapismd/design-core/shadcn/emoji-picker";
  let selected = $state("");
</script>
<EmojiPicker onSelect={(emoji) => selected = emoji} />
<output>{selected}</output>`;

export const Restricted = `<script lang="ts">
  import { EmojiPicker, DEFAULT_EMOJIS } from "@lapismd/design-core/shadcn/emoji-picker";
</script>
<EmojiPicker emojis={DEFAULT_EMOJIS} onSelect={(emoji) => console.log(emoji)} />`;

export const Custom = `<script lang="ts">
  import { EmojiPicker, type CustomEmoji } from "@lapismd/design-core/shadcn/emoji-picker";
  const customEmojis: CustomEmoji[] = [{ id: "team:wave", shortcode: "wave", url: "/team-wave.png", label: "Team wave" }];
</script>
<EmojiPicker presets={["👍", "❤️"]} {customEmojis}
  onSelect={(emoji, custom) => console.log(emoji, custom?.id)} />`;

export const Presets = `<script lang="ts">
  import { EmojiPicker } from "@lapismd/design-core/shadcn/emoji-picker";
</script>
<EmojiPicker presetsOnly presets={["👍", "👎"]} onSelect={(emoji) => console.log(emoji)} />`;

export const Dark = `<script lang="ts">
  import { EmojiPicker } from "@lapismd/design-core/shadcn/emoji-picker";
</script>
<EmojiPicker theme="dark" onSelect={(emoji) => console.log(emoji)} />`;

export const Disabled = `<script lang="ts">
  import { EmojiPicker } from "@lapismd/design-core/shadcn/emoji-picker";
</script>
<EmojiPicker disabled onSelect={() => {}} />`;

export const Controlled = `<script lang="ts">
  import { EmojiPicker } from "@lapismd/design-core/shadcn/emoji-picker";
  import { Button } from "@lapismd/design-core/shadcn/button";
  let mounted = $state(true);
  let theme = $state<"light" | "dark">("light");
  let selected = $state("");
</script>
<Button onclick={() => mounted = !mounted}>Toggle picker mounting</Button>
<Button onclick={() => theme = theme === "light" ? "dark" : "light"}>Change picker theme</Button>
{#if mounted}<EmojiPicker {theme} onSelect={(emoji) => selected = emoji} />{/if}
<output>{selected}</output>`;

export const Empty = `<script lang="ts">
  import { EmojiPicker } from "@lapismd/design-core/shadcn/emoji-picker";
</script>
<EmojiPicker emojis={[]} onSelect={() => {}} />`;
