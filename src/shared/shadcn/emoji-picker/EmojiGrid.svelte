<script lang="ts">
  import { Button } from "../button/index.js";
  import { Input } from "../input/index.js";
  import type { EmojiOption } from "./emoji-picker.types.js";

  let {
    emojis,
    searchLabel,
    onSelect,
  }: {
    emojis: readonly EmojiOption[];
    searchLabel: string;
    onSelect: (emoji: string) => void;
  } = $props();
  let query = $state("");
  let grid = $state<HTMLDivElement | null>(null);
  const visible = $derived.by(() => {
    const normalized = query.trim().toLocaleLowerCase();
    return normalized
      ? emojis.filter(
          (option) =>
            option.name.toLocaleLowerCase().includes(normalized) ||
            option.emoji === normalized,
        )
      : emojis;
  });

  function move(event: KeyboardEvent, fromSearch = false): void {
    const keys = [
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Home",
      "End",
    ];
    if (fromSearch ? event.key !== "ArrowDown" : !keys.includes(event.key))
      return;
    const buttons = Array.from(
      grid?.querySelectorAll<HTMLButtonElement>("[data-emoji]") ?? [],
    );
    if (!buttons.length) return;
    const current = Math.max(
      0,
      buttons.indexOf(document.activeElement as HTMLButtonElement),
    );
    const offsets: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -8,
      ArrowDown: 8,
      Home: -current,
      End: buttons.length - 1 - current,
    };
    const target = fromSearch ? 0 : current + (offsets[event.key] ?? 0);
    buttons[Math.max(0, Math.min(buttons.length - 1, target))]?.focus();
    event.preventDefault();
  }
</script>

<div data-ui-part="restricted">
  <Input
    bind:value={query}
    aria-label={searchLabel}
    placeholder={searchLabel}
    data-emoji-initial-focus
    onkeydown={(event) => move(event, true)}
  />
  {#if visible.length}
    <div
      bind:this={grid}
      data-ui-part="emoji-grid"
      role="group"
      aria-label="Emoji"
    >
      {#each visible as option (option.emoji)}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          data-emoji={option.emoji}
          aria-label={`React with ${option.name}`}
          onclick={() => onSelect(option.emoji)}
          onkeydown={(event) => move(event)}
          ><span aria-hidden="true">{option.emoji}</span></Button
        >
      {/each}
    </div>
  {:else}
    <p data-ui-part="emoji-empty" role="status">
      No emoji match “{query.trim()}”.
    </p>
  {/if}
</div>
