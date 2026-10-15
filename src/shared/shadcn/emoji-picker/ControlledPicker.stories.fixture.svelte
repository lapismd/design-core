<script lang="ts">
  import { EmojiPicker } from "./index.js";
  import { Button } from "../button/index.js";
  let mounted = $state(true);
  let theme = $state<"light" | "dark">("light");
  let selection = $state("");
</script>

<Button variant="outline" onclick={() => (mounted = !mounted)}
  >Toggle picker mounting</Button
>
<Button
  variant="outline"
  onclick={() => (theme = theme === "light" ? "dark" : "light")}
  >Change picker theme</Button
>
{#if mounted}
  <EmojiPicker {theme} onSelect={(emoji) => (selection = emoji)} />
{/if}
<output>{selection}</output>
