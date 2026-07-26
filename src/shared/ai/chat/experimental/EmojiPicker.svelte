<script module lang="ts">
  export type EmojiOption = {
    emoji: string;
    name: string;
  };

  export const DEFAULT_EMOJIS: readonly EmojiOption[] = [
    { emoji: "👍", name: "thumbs up" },
    { emoji: "❤️", name: "heart" },
    { emoji: "😂", name: "joy" },
    { emoji: "🎉", name: "tada" },
    { emoji: "😮", name: "wow" },
    { emoji: "😢", name: "cry" },
    { emoji: "🔥", name: "fire" },
    { emoji: "👀", name: "eyes" },
    { emoji: "✅", name: "check" },
    { emoji: "🙏", name: "pray" },
    { emoji: "💯", name: "hundred" },
    { emoji: "🚀", name: "rocket" },
    { emoji: "😍", name: "heart eyes" },
    { emoji: "🤔", name: "thinking" },
    { emoji: "👋", name: "wave" },
    { emoji: "⭐", name: "star" },
  ];
</script>

<script lang="ts">
  import SmilePlusIcon from "@lucide/svelte/icons/smile-plus";
  import { Button } from "@stevejuma/ui/shadcn/button";
  import { Input } from "@stevejuma/ui/shadcn/input";
  import * as Popover from "@stevejuma/ui/shadcn/popover";
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import "../chat.css";

  let {
    ref = $bindable(null),
    open = $bindable(false),
    emojis = DEFAULT_EMOJIS,
    label = "Pick an emoji",
    searchLabel = "Search emoji",
    triggerLabel = label,
    trigger,
    onSelect,
    ...restProps
  }: Omit<HTMLAttributes<HTMLDivElement>, "onselect"> & {
    ref?: HTMLDivElement | null;
    open?: boolean;
    emojis?: readonly EmojiOption[];
    label?: string;
    searchLabel?: string;
    triggerLabel?: string;
    trigger?: Snippet;
    onSelect: (emoji: string) => void;
  } = $props();

  let query = $state("");
  let gridRef = $state<HTMLDivElement | null>(null);

  const visible = $derived.by(() => {
    const normalized = query.trim().toLocaleLowerCase();
    if (!normalized) return emojis;
    return emojis.filter(
      (option) =>
        option.name.toLocaleLowerCase().includes(normalized) ||
        option.emoji === normalized,
    );
  });

  function setOpen(next: boolean): void {
    open = next;
    if (!next) query = "";
  }

  function select(emoji: string): void {
    onSelect(emoji);
    setOpen(false);
  }

  function moveGridFocus(event: KeyboardEvent): void {
    if (
      ![
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Home",
        "End",
      ].includes(event.key)
    ) {
      return;
    }
    const buttons = Array.from(
      gridRef?.querySelectorAll<HTMLButtonElement>("[data-emoji]") ?? [],
    );
    if (buttons.length === 0) return;
    const current = Math.max(
      0,
      buttons.indexOf(document.activeElement as HTMLButtonElement),
    );
    const offset =
      event.key === "ArrowLeft"
        ? -1
        : event.key === "ArrowRight"
          ? 1
          : event.key === "ArrowUp"
            ? -8
            : event.key === "ArrowDown"
              ? 8
              : event.key === "Home"
                ? -current
                : buttons.length - 1 - current;
    event.preventDefault();
    buttons[
      Math.min(buttons.length - 1, Math.max(0, current + offset))
    ]?.focus();
  }
</script>

<span data-ui-component="ai-chat-emoji-picker" data-ui-part="root">
  <Popover.Root {open} onOpenChange={setOpen}>
    <Popover.Trigger>
      {#snippet child({ props })}
        <Button
          {...props}
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={triggerLabel}
        >
          {#if trigger}
            {@render trigger()}
          {:else}
            <SmilePlusIcon aria-hidden="true" />
          {/if}
        </Button>
      {/snippet}
    </Popover.Trigger>
    <Popover.Content
      align="start"
      aria-label={label}
      data-ai-chat-part="emoji-content"
    >
      <div bind:this={ref} {...restProps} data-ui-part="emoji-panel">
        <Input
          bind:value={query}
          aria-label={searchLabel}
          placeholder={searchLabel}
        />
        {#if visible.length === 0}
          <p data-ui-part="emoji-empty">No emoji match “{query.trim()}”.</p>
        {:else}
          <div
            bind:this={gridRef}
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
                onclick={() => select(option.emoji)}
                onkeydown={moveGridFocus}
              >
                <span aria-hidden="true">{option.emoji}</span>
              </Button>
            {/each}
          </div>
        {/if}
      </div>
    </Popover.Content>
  </Popover.Root>
</span>
