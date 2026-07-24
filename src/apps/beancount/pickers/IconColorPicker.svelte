<script lang="ts">
  import { Popover } from "bits-ui";
  import Pencil from "@lucide/svelte/icons/pencil";
  import Search from "@lucide/svelte/icons/search";
  import { ScrollArea } from "@stevejuma/ui/shadcn/scroll-area";
  import { accountAppearanceIconOptions } from "./account-appearance-icons";
  import {
    appearanceIconForeground,
    autoCorrectAppearanceColor,
    needsAppearanceContrastCorrection,
    normalizeAppearanceColor,
  } from "./appearance-color";

  type AccountAppearanceIconOption =
    (typeof accountAppearanceIconOptions)[number];

  const DEFAULT_COLOR = "#7667D9";

  const colors = [
    "#F59E0B",
    "#22C55E",
    "#6366F1",
    "#EF4444",
    "#EC4899",
    "#A855F7",
    "#F97316",
    "#06B6D4",
    "#8B5CF6",
    "#10B981",
    "#F43F5E",
    "#64748B",
  ];

  const iconOptions = accountAppearanceIconOptions;

  /** Lower scores are better matches. `null` means no match. */
  function scoreField(
    haystack: string,
    needle: string,
    weight: number,
  ): number | null {
    const h = haystack.toLowerCase();
    const n = needle.toLowerCase();
    if (!n) return 0;
    if (h === n) return 0;
    if (h.startsWith(n)) return 0.05 / weight;
    if (h.includes(n)) return 0.15 / weight;

    let index = 0;
    for (const char of n) {
      index = h.indexOf(char, index);
      if (index === -1) return null;
      index += 1;
    }
    return 0.35 / weight;
  }

  function scoreIconOption(
    option: AccountAppearanceIconOption,
    needle: string,
  ): number | null {
    const fields: { values: readonly string[]; weight: number }[] = [
      { values: [option.label], weight: 3 },
      { values: option.keywords ?? [], weight: 2 },
      { values: [option.category], weight: 1 },
    ];

    let best: number | null = null;
    for (const field of fields) {
      for (const value of field.values) {
        const score = scoreField(value, needle, field.weight);
        if (score === null) continue;
        if (best === null || score < best) best = score;
      }
    }
    return best;
  }

  /** Rank icon options by label, keywords, then category — visible label first. */
  function rankIconOptions(
    options: readonly AccountAppearanceIconOption[],
    query: string,
  ): AccountAppearanceIconOption[] {
    const needle = query.trim();
    if (!needle) return [...options];

    return options
      .map((option, refIndex) => ({
        option,
        refIndex,
        score: scoreIconOption(option, needle),
      }))
      .filter(
        (
          entry,
        ): entry is {
          option: AccountAppearanceIconOption;
          refIndex: number;
          score: number;
        } => entry.score !== null,
      )
      .sort((a, b) => a.score - b.score || a.refIndex - b.refIndex)
      .map((entry) => entry.option);
  }

  let {
    color = "",
    icon = "",
    onChange = () => {},
  }: {
    color?: string;
    icon?: string;
    onChange?: (value: { color: string; icon: string }) => void;
  } = $props();

  let open = $state(false);
  let pendingColor = $state<string | null>(null);
  let iconSearch = $state("");

  const currentColor = $derived(
    pendingColor ?? normalizeAppearanceColor(color) ?? DEFAULT_COLOR,
  );
  const currentForeground = $derived(
    appearanceIconForeground(currentColor) ?? DEFAULT_COLOR,
  );
  const needsContrastCorrection = $derived(
    needsAppearanceContrastCorrection(currentColor),
  );
  const selectedIcon = $derived(
    iconOptions.find((option) => option.value === icon) ?? iconOptions[0],
  );
  const SelectedIcon = $derived(selectedIcon.icon);
  const filteredIconOptions = $derived.by(() =>
    rankIconOptions(iconOptions, iconSearch),
  );

  function chooseColor(nextColor: string) {
    const normalized = normalizeAppearanceColor(nextColor);
    if (!normalized) return;

    if (needsAppearanceContrastCorrection(normalized)) {
      pendingColor = normalized;
      return;
    }

    pendingColor = null;
    onChange({ color: normalized, icon });
  }

  function autoCorrectColor() {
    const corrected = autoCorrectAppearanceColor(currentColor);
    if (!corrected) return;

    pendingColor = null;
    onChange({ color: corrected, icon });
  }

  function chooseIcon(nextIcon: string) {
    if (needsContrastCorrection) return;
    pendingColor = null;
    onChange({ color: currentColor, icon: nextIcon });
  }
</script>

<Popover.Root bind:open>
  <Popover.Trigger>
    {#snippet child({ props })}
      <button
        {...props}
        type="button"
        class="beancount-icon-color-picker__trigger"
        aria-label="Choose account colour and icon"
      >
        <span
          class="beancount-icon-color-picker__preview"
          style={`--bc-appearance-color: ${currentColor}; --bc-appearance-foreground: ${currentForeground}`}
          aria-hidden="true"
        >
          <SelectedIcon
            class="beancount-icon-color-picker__preview-icon"
            strokeWidth={1.9}
          />
        </span>
        <span class="beancount-icon-color-picker__trigger-label"
          >Colour and icon</span
        >
        <Pencil
          class="beancount-icon-color-picker__trigger-icon"
          aria-hidden="true"
        />
      </button>
    {/snippet}
  </Popover.Trigger>
  <Popover.Portal>
    <Popover.Content
      class="beancount-icon-color-picker__content"
      align="start"
      sideOffset={6}
      aria-label="Choose account appearance"
    >
      <div class="beancount-icon-color-picker__section">
        <p class="beancount-icon-color-picker__heading">Colour</p>
        <div class="beancount-icon-color-picker__colors">
          {#each colors as optionColor (optionColor)}
            <button
              type="button"
              class="beancount-icon-color-picker__color"
              class:selected={currentColor === optionColor}
              style={`--bc-appearance-color: ${optionColor}`}
              aria-label={`Use ${optionColor} colour`}
              aria-pressed={currentColor === optionColor}
              onclick={() => chooseColor(optionColor)}
            ></button>
          {/each}
          <label
            class="beancount-icon-color-picker__color beancount-icon-color-picker__custom-color"
            class:selected={!colors.includes(currentColor)}
            style={`--bc-appearance-color: ${currentColor}`}
          >
            <span class="beancount-icon-color-picker__screen-reader-text"
              >Choose a custom colour</span
            >
            <input
              type="color"
              value={currentColor}
              aria-label="Choose a custom colour"
              onchange={(event) => chooseColor(event.currentTarget.value)}
            />
          </label>
        </div>
        {#if needsContrastCorrection}
          <div
            id="beancount-icon-color-picker-contrast-warning"
            class="beancount-icon-color-picker__contrast-warning"
            role="alert"
          >
            <span>The generated icon colour needs more contrast.</span>
            <button type="button" onclick={autoCorrectColor}
              >Auto-correct</button
            >
          </div>
        {/if}
      </div>

      <div class="beancount-icon-color-picker__section">
        <div class="beancount-icon-color-picker__heading-row">
          <p class="beancount-icon-color-picker__heading">Icon</p>
          <span
            class="beancount-icon-color-picker__icon-count"
            aria-live="polite"
            >{filteredIconOptions.length} of {iconOptions.length}</span
          >
        </div>
        <label class="beancount-icon-color-picker__search">
          <Search
            class="beancount-icon-color-picker__search-icon"
            aria-hidden="true"
          />
          <span class="beancount-icon-color-picker__screen-reader-text"
            >Search icons</span
          >
          <input
            bind:value={iconSearch}
            type="search"
            placeholder="Search icons…"
            autocomplete="off"
          />
        </label>
        <ScrollArea class="beancount-icon-color-picker__icons">
          {#if filteredIconOptions.length}
            <div class="beancount-icon-color-picker__icons-grid">
              {#each filteredIconOptions as option (option.value)}
                {@const Icon = option.icon}
                <button
                  type="button"
                  class="beancount-icon-color-picker__icon"
                  class:selected={icon === option.value}
                  style={`--bc-appearance-color: ${currentColor}; --bc-appearance-foreground: ${currentForeground}`}
                  aria-label={`Use ${option.label} icon`}
                  aria-pressed={icon === option.value}
                  aria-describedby={needsContrastCorrection
                    ? "beancount-icon-color-picker-contrast-warning"
                    : undefined}
                  disabled={needsContrastCorrection}
                  title={needsContrastCorrection
                    ? "Correct the colour contrast before choosing an icon"
                    : `${option.label} · ${option.category}`}
                  onclick={() => chooseIcon(option.value)}
                >
                  <Icon
                    class="beancount-icon-color-picker__icon-glyph"
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                </button>
              {/each}
            </div>
          {:else}
            <p class="beancount-icon-color-picker__empty-icons">
              No icons match “{iconSearch}”.
            </p>
          {/if}
        </ScrollArea>
      </div>
    </Popover.Content>
  </Popover.Portal>
</Popover.Root>

<style>
  .beancount-icon-color-picker__trigger {
    display: inline-flex;
    min-height: 2.4rem;
    align-items: center;
    gap: 0.55rem;
    border: 0;
    border-radius: 0.5rem;
    background: transparent;
    color: var(--ui-beancount-foreground);
    cursor: pointer;
    font: inherit;
    padding: 0.15rem 0.35rem 0.15rem 0;
    text-align: left;
  }

  .beancount-icon-color-picker__trigger:hover,
  .beancount-icon-color-picker__trigger:focus-visible {
    color: var(--ui-beancount-accent);
    outline: 0;
  }

  .beancount-icon-color-picker__trigger:focus-visible {
    box-shadow: 0 0 0 2px var(--ui-beancount-focus-ring);
  }

  .beancount-icon-color-picker__preview {
    display: inline-flex;
    width: 2rem;
    height: 2rem;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    background: color-mix(in srgb, var(--bc-appearance-color) 10%, transparent);
    color: var(--bc-appearance-foreground);
  }

  :global(.beancount-icon-color-picker__preview-icon),
  :global(.beancount-icon-color-picker__icon-glyph) {
    width: var(--ui-beancount-space-5);
    height: var(--ui-beancount-space-5);
  }

  :global(.beancount-icon-color-picker__trigger-icon) {
    width: var(--ui-beancount-space-3-5);
    height: var(--ui-beancount-space-3-5);
  }

  :global(.beancount-icon-color-picker__search-icon) {
    width: var(--ui-beancount-space-4);
    height: var(--ui-beancount-space-4);
  }

  .beancount-icon-color-picker__screen-reader-text {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }

  .beancount-icon-color-picker__trigger-label {
    font-size: 0.875rem;
    font-weight: 500;
  }

  :global(.beancount-icon-color-picker__content) {
    width: min(22rem, calc(100vw - 2rem));
    border: 1px solid var(--ui-beancount-border);
    border-radius: 0.875rem;
    background: var(--ui-beancount-surface-floating);
    box-shadow: 0 12px 32px color-mix(in srgb, #080319 18%, transparent);
    color: var(--ui-beancount-surface-floating-foreground);
    padding: 1rem;
  }

  .beancount-icon-color-picker__section
    + .beancount-icon-color-picker__section {
    margin-top: 1rem;
  }

  .beancount-icon-color-picker__heading {
    margin: 0 0 0.6rem;
    color: var(--ui-beancount-muted-foreground);
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .beancount-icon-color-picker__heading-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.75rem;
  }

  .beancount-icon-color-picker__heading-row
    .beancount-icon-color-picker__heading {
    margin-bottom: 0.6rem;
  }

  .beancount-icon-color-picker__icon-count {
    color: var(--ui-beancount-muted-foreground);
    font-size: 0.75rem;
    font-variant-numeric: tabular-nums;
  }

  .beancount-icon-color-picker__colors {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: 0.5rem;
  }

  .beancount-icon-color-picker__color {
    position: relative;
    display: block;
    width: 1.65rem;
    height: 1.65rem;
    justify-self: center;
    border: 0;
    border-radius: 999px;
    background: var(--bc-appearance-color);
    cursor: pointer;
    padding: 0;
  }

  .beancount-icon-color-picker__color::after,
  .beancount-icon-color-picker__icon::after {
    position: absolute;
    inset: -0.2rem;
    border: 2px solid transparent;
    border-radius: inherit;
    content: "";
    pointer-events: none;
  }

  .beancount-icon-color-picker__color:hover::after,
  .beancount-icon-color-picker__color:focus-visible::after,
  .beancount-icon-color-picker__custom-color:focus-within::after,
  .beancount-icon-color-picker__color.selected::after {
    border-color: var(--ui-beancount-focus-ring);
  }

  .beancount-icon-color-picker__color:focus-visible,
  .beancount-icon-color-picker__icon:focus-visible {
    outline: 0;
  }

  .beancount-icon-color-picker__custom-color {
    border: 2px solid var(--ui-beancount-surface-floating);
    background: conic-gradient(
      from 0deg,
      #ef4444,
      #f59e0b,
      #facc15,
      #22c55e,
      #06b6d4,
      #3b82f6,
      #8b5cf6,
      #ec4899,
      #ef4444
    );
  }

  .beancount-icon-color-picker__custom-color.selected::after {
    inset: -0.3rem;
    border-color: var(--bc-appearance-color);
    border-width: 3px;
  }

  .beancount-icon-color-picker__custom-color input {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: 0;
    border-radius: inherit;
    background: transparent;
    clip-path: circle(50%);
    cursor: pointer;
    opacity: 0;
    padding: 0;
  }

  :global(.beancount-icon-color-picker__icons) {
    height: min(15rem, 35dvh);
    max-height: min(15rem, 35dvh);
    min-height: 0;
    border-radius: 0.5rem;
    padding: 0.2rem;
  }

  .beancount-icon-color-picker__icons-grid {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: 0.35rem;
    padding: 0.25rem;
  }

  .beancount-icon-color-picker__search {
    display: flex;
    height: 2.25rem;
    align-items: center;
    gap: 0.45rem;
    margin-bottom: 0.55rem;
    border: 1px solid var(--ui-beancount-border);
    border-radius: 0.5rem;
    background: var(--ui-beancount-surface);
    color: var(--ui-beancount-muted-foreground);
    padding: 0 0.65rem;
  }

  .beancount-icon-color-picker__search input {
    width: 100%;
    min-width: 0;
    border: 0;
    background: transparent;
    color: var(--ui-beancount-foreground);
    font: inherit;
    font-size: 0.8125rem;
    outline: 0;
  }

  .beancount-icon-color-picker__search:focus-within {
    border-color: var(--ui-beancount-focus-ring);
    box-shadow: 0 0 0 1px var(--ui-beancount-focus-ring);
  }

  .beancount-icon-color-picker__empty-icons {
    margin: 0;
    padding: 1.5rem 0.5rem;
    color: var(--ui-beancount-muted-foreground);
    font-size: 0.8125rem;
    text-align: center;
  }

  .beancount-icon-color-picker__icon {
    position: relative;
    display: inline-flex;
    width: 2.3rem;
    height: 2.3rem;
    align-items: center;
    justify-content: center;
    border: 0;
    border-radius: 999px;
    background: transparent;
    color: var(--ui-beancount-muted-foreground);
    cursor: pointer;
    padding: 0;
  }

  .beancount-icon-color-picker__icon:hover,
  .beancount-icon-color-picker__icon:focus-visible {
    background: color-mix(in srgb, var(--ui-beancount-accent) 10%, transparent);
    color: var(--ui-beancount-accent);
  }

  .beancount-icon-color-picker__icon.selected {
    background: color-mix(in srgb, var(--bc-appearance-color) 10%, transparent);
    color: var(--bc-appearance-foreground);
  }

  .beancount-icon-color-picker__icon:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }

  .beancount-icon-color-picker__icon:disabled:hover {
    background: transparent;
    color: var(--ui-beancount-muted-foreground);
  }

  .beancount-icon-color-picker__icon.selected:disabled {
    background: color-mix(in srgb, var(--bc-appearance-color) 10%, transparent);
    color: var(--bc-appearance-foreground);
  }

  .beancount-icon-color-picker__icon:focus-visible::after,
  .beancount-icon-color-picker__icon.selected::after {
    border-color: var(--ui-beancount-focus-ring);
  }

  .beancount-icon-color-picker__contrast-warning {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    margin-top: 0.75rem;
    color: var(--ui-beancount-negative);
    font-size: 0.75rem;
    line-height: 1.2;
  }

  .beancount-icon-color-picker__contrast-warning button {
    border: 0;
    background: transparent;
    color: inherit;
    cursor: pointer;
    font: inherit;
    font-weight: 700;
    padding: 0;
    text-decoration: underline;
  }

  .beancount-icon-color-picker__contrast-warning button:focus-visible {
    border-radius: 0.2rem;
    outline: 2px solid var(--ui-beancount-focus-ring);
    outline-offset: 2px;
  }
</style>
