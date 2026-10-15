<script lang="ts">
  import { untrack } from "svelte";
  import { Button } from "../button/index.js";
  import { loadEmojiMart, normalizeEmojiMart } from "./emoji-mart.js";

  let {
    theme,
    searchLabel,
    onSelect,
    onClose,
  }: {
    theme: "light" | "dark" | "auto";
    searchLabel: string;
    onSelect: (emoji: string) => void;
    onClose?: () => void;
  } = $props();
  let host = $state<HTMLDivElement | null>(null);
  // Emoji Mart's declarations do not describe its custom element's DOM base.
  type PickerElement = HTMLElement & { update(props: { theme: string }): void };
  let picker = $state<PickerElement | undefined>();
  let appliedTheme = "auto";
  let error = $state(false);
  let ready = $state(false);

  $effect(() => {
    const element = host;
    if (!element) return;
    let disposed = false;
    let instance: PickerElement | undefined;
    let observer: MutationObserver | undefined;
    error = false;
    ready = false;
    void loadEmojiMart()
      .then(([{ Picker }, { default: data }]) => {
        if (disposed) return;
        appliedTheme = untrack(() => theme);
        instance = new Picker({
          data,
          autoFocus: false,
          dynamicWidth: true,
          navPosition: "bottom",
          previewPosition: "none",
          skinTonePosition: "search",
          theme: appliedTheme,
          emojiButtonColors: [
            "var(--ui-emoji-picker-hover, color-mix(in srgb, currentColor 14%, transparent))",
          ],
          emojiButtonRadius: "0.4rem",
          onEmojiSelect: (selection: {
            native?: string;
            shortcodes?: string;
          }) => {
            const value = selection.native ?? selection.shortcodes;
            if (!disposed && value) onSelect(value);
          },
        }) as unknown as PickerElement;
        picker = instance;
        element.append(instance);
        const root = instance.shadowRoot;
        if (!root) throw new Error("Emoji picker shadow root unavailable");
        let focusPending = true;
        const normalize = () => {
          normalizeEmojiMart(root, searchLabel);
          const search = root.querySelector<HTMLInputElement>("input");
          if (search && focusPending) {
            focusPending = false;
            ready = true;
            // A delayed import must not steal focus from presets or other controls.
            if (document.activeElement === element) search.focus();
          }
        };
        observer = new MutationObserver(normalize);
        observer.observe(root, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ["aria-posinset", "aria-setsize", "aria-selected"],
        });
        normalize();
      })
      .catch(() => {
        if (!disposed) {
          error = true;
          instance?.remove();
        }
      });
    return () => {
      disposed = true;
      observer?.disconnect();
      instance?.remove();
      picker = undefined;
    };
  });

  $effect(() => {
    const value = theme;
    if (picker && value !== appliedTheme) {
      appliedTheme = value;
      picker.update({ theme: value });
    }
  });
</script>

<div
  bind:this={host}
  data-ui-part="library"
  data-emoji-initial-focus
  tabindex="-1"
  aria-busy={!ready && !error}
>
  {#if error}
    <div data-ui-part="emoji-loading" role="alert">
      <p>
        Emoji could not be loaded. Check your connection and refresh the page to
        try again.
      </p>
      {#if onClose}<Button variant="outline" size="sm" onclick={onClose}
          >Close emoji picker</Button
        >{/if}
    </div>
  {:else if !ready}
    <p data-ui-part="emoji-loading" role="status">Loading emoji…</p>
  {/if}
</div>
