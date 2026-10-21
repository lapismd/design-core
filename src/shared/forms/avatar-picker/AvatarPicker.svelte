<script lang="ts">
  import { onDestroy, tick } from "svelte";
  import * as Popover from "../../shadcn/popover/index.js";
  import * as ScrollArea from "../../shadcn/scroll-area/index.js";
  import * as Tabs from "../../shadcn/tabs/index.js";
  import * as InputGroup from "../../shadcn/input-group/index.js";
  import PencilIcon from "@lucide/svelte/icons/pencil";
  import CloudUploadIcon from "@lucide/svelte/icons/cloud-upload";
  import LinkIcon from "@lucide/svelte/icons/link";
  import * as Alert from "../../shadcn/alert/index.js";
  import { Input } from "../../shadcn/input/index.js";
  import { Button } from "../../shadcn/button/index.js";
  import { Avatar, avatarInitials } from "../../shadcn/avatar/index.js";
  import { EmojiPicker } from "../../shadcn/emoji-picker/index.js";
  import {
    AVATAR_IMAGE_ACCEPT,
    readAvatarImage,
    avatarDataUrl,
    avatarGlyph,
  } from "./avatar-image.js";
  import type { AvatarPickerProps } from "./avatar-picker.types.js";
  import "./avatar-picker.css";
  let {
    value = $bindable(""),
    open = $bindable(false),
    label = "Choose avatar",
    presentation = "popover",
    size = "xl",
    mode = $bindable("image"),
    disabled = false,
    name = "",
    initials,
    shape = $bindable("rounded"),
    background = $bindable("#6e56cf"),
    customEmojis = [],
    theme = "auto",
    onUploadImage,
    onValueChange,
  }: AvatarPickerProps = $props();
  let error = $state(""),
    pending = $state(false),
    glyph = $state("");
  let editButton = $state<HTMLButtonElement | null>(null);
  let dragging = $state(false);
  function done() {
    open = false;
    if (presentation === "inline") void tick().then(() => editButton?.focus());
  }
  function updateBackground(color: string) {
    background = color;
    if (glyph) draw(glyph);
  }
  const fallbackInitials = $derived(initials ?? avatarInitials(name));
  const imageUrl = $derived(value.startsWith("data:") ? "" : value);
  let ownValue: string | undefined;
  let generation = 0;
  let request: AbortController | undefined;
  const colors = [
    "#ffffff",
    "#fef3c7",
    "#fde047",
    "#ffb547",
    "#fb923c",
    "#f87171",
    "#f472b6",
    "#c65df5",
    "#a855f7",
    "#8b5cf6",
    "#3b82f6",
    "#38bdf8",
    "#2dd4bf",
    "#34d399",
    "#a3e635",
    "#c4d169",
    "#d1d5db",
    "#9ca3af",
    "#111827",
  ];
  function cancel(): void {
    generation++;
    request?.abort();
    request = undefined;
    pending = false;
  }
  function commit(next: string): void {
    if (disabled) return;
    cancel();
    error = "";
    ownValue = next;
    value = next;
    onValueChange?.(next);
  }
  $effect(() => {
    if (value !== ownValue) glyph = avatarGlyph(value);
    disabled;
    cancel();
    if (disabled) open = false;
  });
  onDestroy(cancel);
  function draw(text: string): void {
    glyph = text;
    commit(avatarDataUrl(text, background));
  }
  async function choose(file: File | undefined): Promise<void> {
    if (!file || disabled) return;
    cancel();
    error = "";
    if (!AVATAR_IMAGE_ACCEPT.split(",").includes(file.type)) {
      error = "Choose a PNG, JPEG, GIF, or WebP image.";
      return;
    }
    const token = generation,
      previous = value;
    const active = new AbortController();
    request = active;
    pending = true;
    try {
      const next = await (onUploadImage
        ? onUploadImage(file, active.signal)
        : readAvatarImage(file, active.signal));
      if (
        token === generation &&
        !active.signal.aborted &&
        value === previous &&
        !disabled
      ) {
        glyph = "";
        commit(next);
      }
    } catch (cause) {
      if (token === generation && !active.signal.aborted)
        error =
          cause instanceof Error
            ? cause.message
            : "The image could not be read. Try again.";
    } finally {
      if (token === generation) {
        pending = false;
        request = undefined;
      }
    }
  }
</script>

{#snippet avatarTrigger()}
  <Avatar
    src={value}
    {name}
    initials={fallbackInitials}
    {shape}
    {size}
    {background}
    decorative
  />
  <span class="ui-avatar-picker__edit" aria-hidden="true"><PencilIcon /></span>
{/snippet}

{#snippet editor()}
  <div
    data-ui-component="avatar-picker"
    data-ui-part="editor"
    data-presentation={presentation}
    aria-busy={pending}
  >
    <Tabs.Root bind:value={mode} class="ui-avatar-picker__tabs">
      <Tabs.List aria-label="Avatar type" class="ui-avatar-picker__tab-list">
        <Tabs.Trigger value="image">Image</Tabs.Trigger>
        <Tabs.Trigger value="emoji">Emoji</Tabs.Trigger>
      </Tabs.List>
      {#if presentation === "inline"}
        <div class="ui-avatar-picker__editor-preview">
          <Avatar
            src={value}
            {name}
            initials={fallbackInitials}
            {shape}
            size="2xl"
            {background}
            decorative
          />
        </div>
      {/if}
      <Tabs.Content value="image" class="ui-avatar-picker__tab-content">
        <label
          class="ui-avatar-picker__drop"
          data-dragging={dragging}
          data-disabled={disabled}
          ondragover={(event) => {
            event.preventDefault();
            if (!disabled) dragging = true;
          }}
          ondragleave={() => (dragging = false)}
          ondrop={(event) => {
            event.preventDefault();
            dragging = false;
            void choose(event.dataTransfer?.files[0]);
          }}
        >
          <CloudUploadIcon aria-hidden="true" />
          <span
            >Drop or <span class="ui-avatar-picker__browse">browse</span></span
          >
          <Input
            class="ui-avatar-picker__file"
            type="file"
            accept={AVATAR_IMAGE_ACCEPT}
            aria-label="Upload avatar image"
            {disabled}
            onchange={(event) => {
              void choose(event.currentTarget.files?.[0]);
            }}
          />
        </label>
        <InputGroup.Root class="ui-avatar-picker__url">
          <InputGroup.Addon><LinkIcon aria-hidden="true" /></InputGroup.Addon>
          <InputGroup.Input
            type="url"
            aria-label="Avatar image URL"
            value={imageUrl}
            {disabled}
            placeholder="Paste a URL"
            oninput={(event) => {
              glyph = "";
              commit(event.currentTarget.value);
            }}
          />
        </InputGroup.Root>
      </Tabs.Content>
      <Tabs.Content value="emoji" class="ui-avatar-picker__tab-content">
        <div class="ui-avatar-picker__emoji-panel">
          <EmojiPicker
            presentation="inline"
            label="Browse avatar emoji"
            {customEmojis}
            {theme}
            {disabled}
            onSelect={(emoji, custom) => {
              if (custom) {
                glyph = "";
                commit(custom.url);
              } else draw(emoji);
            }}
          />
        </div>
      </Tabs.Content>
    </Tabs.Root>
    <div
      role="group"
      aria-label="Avatar background"
      class="ui-avatar-picker__colors"
    >
      {#each colors as color}
        <Button
          variant="outline"
          size="icon-sm"
          class="ui-avatar-picker__swatch"
          {disabled}
          aria-label={`Use ${color} background`}
          aria-pressed={background.toLowerCase() === color}
          style={`background-color:${color}`}
          onclick={() => updateBackground(color)}
        />
      {/each}
      <label
        class="ui-avatar-picker__custom-color"
        title="Custom background colour"
      >
        <Input
          type="color"
          value={background}
          {disabled}
          aria-label="Avatar background color"
          oninput={(event) => updateBackground(event.currentTarget.value)}
        />
      </label>
    </div>

    {#if pending}<p role="status" class="ui-avatar-picker__hint">
        Preparing avatar…
      </p>{/if}
    {#if error}<Alert.Root variant="destructive"
        ><Alert.Title>Avatar could not be updated</Alert.Title
        ><Alert.Description>{error}</Alert.Description></Alert.Root
      >{/if}
    <Button
      variant="ghost"
      class="ui-avatar-picker__remove"
      disabled={disabled || (!value && !pending)}
      onclick={() => {
        glyph = "";
        commit("");
      }}>Remove avatar</Button
    >
    <Button class="ui-avatar-picker__done" onclick={done}>Done</Button>
  </div>
{/snippet}

<div
  class="ui-avatar-picker"
  data-size={size}
  data-shape={shape}
  data-presentation={presentation}
  data-open={open}
>
  {#if presentation === "inline"}
    {#if open}
      {@render editor()}
    {:else}
      <Button
        bind:ref={editButton}
        variant="ghost"
        class="ui-avatar-picker__trigger"
        {disabled}
        aria-label={`${label}: ${fallbackInitials}`}
        aria-expanded={open}
        onclick={() => (open = true)}
      >
        {@render avatarTrigger()}
      </Button>
    {/if}
  {:else}
    <Popover.Root bind:open>
      <Popover.Trigger>
        {#snippet child({ props })}
          <Button
            {...props}
            variant="ghost"
            class="ui-avatar-picker__trigger"
            {disabled}
            aria-label={`${label}: ${fallbackInitials}`}
          >
            {@render avatarTrigger()}
          </Button>
        {/snippet}
      </Popover.Trigger>
      <Popover.Content
        trapFocus={false}
        class="ui-avatar-picker-content"
        aria-label="Avatar picker"
        align="start"
        sideOffset={12}
        collisionPadding={8}
      >
        <ScrollArea.Root
          scrollStrategy="styled"
          class="ui-avatar-picker__scroll"
        >
          <div class="ui-avatar-picker__scroll-content">{@render editor()}</div>
        </ScrollArea.Root>
      </Popover.Content>
    </Popover.Root>
  {/if}
</div>
