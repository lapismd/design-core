<script lang="ts">
  import SmilePlusIcon from "@lucide/svelte/icons/smile-plus";
  import { Button } from "../button/index.js";
  import * as Popover from "../popover/index.js";
  import EmojiGrid from "./EmojiGrid.svelte";
  import EmojiMartPanel from "./EmojiMartPanel.svelte";
  import type { CustomEmoji, EmojiPickerProps } from "./emoji-picker.types.js";
  import "./emoji-picker.css";

  let {
    ref = $bindable(null),
    open = $bindable(false),
    presentation = "popover",
    emojis,
    presets = [],
    presetsOnly = false,
    customEmojis = [],
    disabled = false,
    selection,
    label = "Pick an emoji",
    searchLabel = "Search emoji",
    triggerLabel = label,
    trigger,
    theme = "auto",
    onSelect,
    ...restProps
  }: EmojiPickerProps = $props();
  const restricted = $derived(emojis !== undefined || presetsOnly);
  let content = $state<HTMLDivElement | null>(null);
  $effect(() => {
    if (disabled) open = false;
  });

  function select(value: string, custom?: CustomEmoji): void {
    if (disabled) return;
    if (custom) onSelect(value, custom);
    else onSelect(value);
    open = false;
  }
  function focusSearch(event: Event): void {
    event.preventDefault();
    const search = content
      ?.querySelector("em-emoji-picker")
      ?.shadowRoot?.querySelector<HTMLInputElement>("input");
    (
      search ??
      content?.querySelector<HTMLElement>("[data-emoji-initial-focus]")
    )?.focus();
  }
</script>

{#snippet panel()}
  <div
    bind:this={ref}
    {...restProps}
    data-ui-component="emoji-picker"
    data-ui-part="panel"
  >
    {#if presets.length && emojis === undefined}
      <section data-ui-part="presets" aria-label="Suggested emoji">
        {#each presets as emoji (emoji)}
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`React ${emoji}`}
            onclick={() => select(emoji)}
            data-emoji-initial-focus={presetsOnly ? "" : undefined}
          >
            <span aria-hidden="true">{emoji}</span>
          </Button>
        {/each}
      </section>
    {/if}
    {#if emojis !== undefined}
      <EmojiGrid {emojis} {searchLabel} onSelect={select} />
    {:else if !presetsOnly}
      {#if customEmojis.length}
        <section data-ui-part="custom" aria-label="Custom emoji">
          {#each customEmojis as emoji (emoji.id)}
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={emoji.label ?? `:${emoji.shortcode}:`}
              onclick={() => select(emoji.shortcode, emoji)}
              ><img src={emoji.url} alt="" /></Button
            >
          {/each}
        </section>
      {/if}
      <EmojiMartPanel
        {theme}
        {searchLabel}
        onSelect={select}
        {...presentation === "popover" ? { onClose: () => (open = false) } : {}}
      />
    {:else if !presets.length}
      <p data-ui-part="emoji-empty" role="status">No emoji available.</p>
    {/if}
  </div>
{/snippet}

<span
  data-ui-component="emoji-picker"
  data-ui-part="root"
  data-presentation={presentation}
>
  {#if presentation === "inline"}
    <div
      role="group"
      aria-label={label}
      aria-disabled={disabled || undefined}
      inert={disabled}
    >
      {@render panel()}
    </div>
  {:else}
    <Popover.Root bind:open>
      <Popover.Trigger>
        {#snippet child({ props })}
          <Button
            {...props}
            type="button"
            variant="ghost"
            size="icon-sm"
            {disabled}
            aria-label={triggerLabel}
          >
            {#if trigger}{@render trigger()}
            {:else if selection}<span aria-hidden="true">{selection}</span>
            {:else}<SmilePlusIcon aria-hidden="true" />{/if}
          </Button>
        {/snippet}
      </Popover.Trigger>
      <Popover.Content
        bind:ref={content}
        trapFocus={restricted}
        align="start"
        sideOffset={6}
        collisionPadding={8}
        class="ui-emoji-picker-content"
        data-restricted={restricted}
        aria-label={label}
        onOpenAutoFocus={focusSearch}
        onkeydowncapture={(event) => {
          // The library consumes search Escape; its skin-tone menu owns its own layer.
          const menu = content
            ?.querySelector("em-emoji-picker")
            ?.shadowRoot?.querySelector(".menu:not(.hidden)");
          if (!restricted && event.key === "Escape" && !menu) {
            event.preventDefault();
            event.stopPropagation();
            open = false;
          }
        }}
      >
        {@render panel()}
      </Popover.Content>
    </Popover.Root>
  {/if}
</span>
