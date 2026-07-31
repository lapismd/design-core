<script lang="ts">
  import { onDestroy, tick } from "svelte";
  import { useId } from "bits-ui";
  import CheckIcon from "@lucide/svelte/icons/check";
  import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
  import CopyIcon from "@lucide/svelte/icons/copy";
  import type { HTMLAttributes } from "svelte/elements";
  import { Button } from "../button/index.js";
  import { type WithElementRef } from "../../../lib/utils.js";
  import { omitDataUiComponent } from "../../../lib/data-ui-host.js";
  import {
    flatTokensToLines,
    SYNC_TOKENIZE_THRESHOLD,
    tokenize,
    tokenizeAsync,
    type TokenLine,
  } from "./tokenizer.js";
  import { applyHighlightRangesChunked } from "./highlightRanges.js";
  import { ensureHighlightStyles } from "./highlightStyles.js";
  import {
    buildSpanParts,
    chunkLineIndices,
    hasHighlightAPI,
    isSafari,
    LINE_CHUNK_THRESHOLD,
    splitCodeLines,
  } from "./code-block-helpers.js";
  import type { SyntaxThemeDefinition } from "./syntax/defineSyntaxTheme.js";
  import SyntaxTheme from "./syntax/SyntaxTheme.svelte";
  import "./code-block.css";

  function range(start: number, end: number): number[] {
    const out: number[] = [];
    for (let i = start; i < end; i++) {
      out.push(i);
    }
    return out;
  }

  type CustomTokenizer = (
    code: string,
    language: string,
  ) => { type: string; start: number; end: number }[];

  let {
    ref = $bindable(null),
    code,
    language = "plaintext",
    title,
    hasLanguageLabel = true,
    hasLineNumbers = false,
    highlightLines,
    hasCopyButton = true,
    onCopy,
    isWrapped = false,
    maxHeight,
    isCollapsible = false,
    collapsibleThreshold = 10,
    size = "md",
    width = "fit-content",
    container = "card",
    tokenizer: customTokenizer,
    highlightMode = "auto",
    syntaxTheme,
    class: className,
    style,
    ...restProps
  }: WithElementRef<HTMLAttributes<HTMLPreElement>, HTMLPreElement> & {
    /** Source text to display. */
    code: string;
    /** Language id for highlighting. Use `plaintext` to disable. @default 'plaintext' */
    language?: string;
    /** Filename or label in the header bar. */
    title?: string;
    /** Show language name in the header. Hidden for plaintext. @default true */
    hasLanguageLabel?: boolean;
    /** Show a line-number gutter. @default false */
    hasLineNumbers?: boolean;
    /** 1-indexed line numbers to accent. */
    highlightLines?: number[];
    /** Show copy-to-clipboard. @default true */
    hasCopyButton?: boolean;
    /** Fired after a successful copy. */
    onCopy?: () => void;
    /** Wrap long lines instead of horizontal scroll. @default false */
    isWrapped?: boolean;
    /** Max height before vertical scroll. */
    maxHeight?: number | string;
    /** Collapse body into the header when line count >= threshold. @default false */
    isCollapsible?: boolean;
    /** Minimum lines before collapse toggle appears. @default 10 */
    collapsibleThreshold?: number;
    /** Text size. @default 'md' */
    size?: "sm" | "md";
    /** CSS width. `fit-content` (default) or e.g. `100%`. */
    width?: string;
    /** `card` bordered surface or `section` flush embed. @default 'card' */
    container?: "card" | "section";
    /** Override tokenizer returning flat absolute-offset tokens. */
    tokenizer?: CustomTokenizer;
    /** Highlight strategy. @default 'auto' */
    highlightMode?: "auto" | "ranges" | "spans";
    /** Per-instance syntax theme override. */
    syntaxTheme?: SyntaxThemeDefinition;
  } = $props();

  const regionId = useId();

  let copied = $state(false);
  let announceText = $state("");
  let isCollapsed = $state(false);
  let codeEl = $state<HTMLElement | null>(null);
  let asyncTokenResult = $state<{
    code: string;
    language: string;
    tokens: TokenLine[];
  } | null>(null);
  let copyResetTimer: ReturnType<typeof setTimeout> | null = null;
  let highlightCleanup: (() => void) | null = null;

  const lines = $derived(splitCodeLines(code));
  const languageLabel = $derived(
    hasLanguageLabel && language !== "plaintext" ? language : null,
  );
  const showHeader = $derived(title != null || languageLabel != null);
  const canCollapse = $derived(
    isCollapsible && lines.length >= collapsibleThreshold,
  );
  const highlightSet = $derived(
    highlightLines ? new Set(highlightLines) : null,
  );
  const maxLineDigits = $derived(String(lines.length).length);
  const useSpans = $derived(
    highlightMode === "spans" ||
      (highlightMode === "auto" && !hasHighlightAPI()) ||
      (highlightMode === "auto" && isSafari()),
  );
  const widthAttr = $derived(width === "fit-content" ? "fit-content" : null);
  const customWidthStyle = $derived(
    width === "fit-content" ? undefined : `width: ${width}`,
  );
  const scrollMaxHeight = $derived(
    maxHeight == null
      ? undefined
      : typeof maxHeight === "number"
        ? `${maxHeight}px`
        : maxHeight,
  );
  const lineChunks = $derived(chunkLineIndices(lines.length));
  const syncTokens = $derived.by((): TokenLine[] | null => {
    if (customTokenizer) {
      return flatTokensToLines(customTokenizer(code, language), code);
    }
    if (code.length >= SYNC_TOKENIZE_THRESHOLD) {
      return null;
    }
    return tokenize(code, language);
  });

  const tokenLines = $derived.by((): TokenLine[] => {
    if (syncTokens != null) {
      return syncTokens;
    }
    if (
      asyncTokenResult?.code === code &&
      asyncTokenResult.language === language
    ) {
      return asyncTokenResult.tokens;
    }
    return [];
  });

  $effect(() => {
    if (code.length < SYNC_TOKENIZE_THRESHOLD || customTokenizer) {
      return;
    }

    const abortController = new AbortController();
    const currentCode = code;
    const currentLanguage = language;

    void (async () => {
      try {
        const tokens = await tokenizeAsync(
          currentCode,
          currentLanguage,
          abortController.signal,
        );
        if (!abortController.signal.aborted) {
          asyncTokenResult = {
            code: currentCode,
            language: currentLanguage,
            tokens,
          };
        }
      } catch {
        if (!abortController.signal.aborted) {
          asyncTokenResult = {
            code: currentCode,
            language: currentLanguage,
            tokens: [],
          };
        }
      }
    })();

    return () => {
      abortController.abort();
    };
  });

  $effect(() => {
    if (useSpans) {
      ensureHighlightStyles();
      highlightCleanup?.();
      highlightCleanup = null;
      return;
    }

    if (!hasHighlightAPI()) {
      return;
    }

    ensureHighlightStyles();
    const el = codeEl;
    const tokens = tokenLines;
    if (!el || tokens.length === 0) {
      return;
    }

    let cancelled = false;
    void tick().then(() => {
      if (cancelled || codeEl !== el) {
        return;
      }
      highlightCleanup?.();
      highlightCleanup = applyHighlightRangesChunked(el, tokens);
    });

    return () => {
      cancelled = true;
      highlightCleanup?.();
      highlightCleanup = null;
    };
  });

  onDestroy(() => {
    if (copyResetTimer != null) {
      clearTimeout(copyResetTimer);
    }
    highlightCleanup?.();
  });

  async function handleCopy(event: MouseEvent) {
    event.stopPropagation();
    try {
      await navigator.clipboard.writeText(code);
      copied = true;
      announceText = "Copied";
      onCopy?.();
      if (copyResetTimer != null) {
        clearTimeout(copyResetTimer);
      }
      copyResetTimer = setTimeout(() => {
        copyResetTimer = null;
        copied = false;
      }, 2000);
    } catch {
      // Clipboard failures leave the copied state unchanged.
    }
  }

  function toggleCollapsed() {
    if (!canCollapse) {
      return;
    }
    isCollapsed = !isCollapsed;
  }

  function onHeaderKeydown(event: KeyboardEvent) {
    if (!canCollapse) {
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleCollapsed();
    }
  }

  const rootStyle = $derived(
    [customWidthStyle, typeof style === "string" ? style : undefined]
      .filter(Boolean)
      .join("; ") || undefined,
  );
</script>

{#snippet copyControl(placement: "header" | "absolute")}
  {#if hasCopyButton}
    <Button
      variant="ghost"
      size="icon-xs"
      data-ui-part="code-block-copy"
      data-placement={placement}
      aria-label={copied ? "Copied" : "Copy code"}
      onclick={handleCopy}
    >
      {#if copied}
        <CheckIcon aria-hidden="true" />
      {:else}
        <CopyIcon aria-hidden="true" />
      {/if}
    </Button>
  {/if}
{/snippet}

{#snippet lineBody(lineIndex: number)}
  {@const line = lines[lineIndex] ?? ""}
  {@const numbered = hasLineNumbers}
  {@const highlighted = highlightSet?.has(lineIndex + 1) ?? false}
  <div
    data-ui-part="code-block-line"
    data-line={lineIndex + 1}
    data-numbered={numbered ? "true" : undefined}
    data-highlighted={highlighted ? "true" : undefined}
  >
    {#if useSpans}
      <span data-ui-part="code-block-line-content">
        {#each buildSpanParts(line, tokenLines[lineIndex] ?? []) as part (part.kind === "token" ? part.key : part.text)}
          {#if part.kind === "token"}
            <span class={`ui-code-token-${part.type}`}>{part.text}</span>
          {:else}
            {part.text}
          {/if}
        {/each}
      </span>
    {:else}
      {line || "\u200b"}
    {/if}
  </div>
{/snippet}

{#snippet codeBody()}
  <!-- Keyboard users need to focus the overflow container to scroll. -->
  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <div
    data-ui-part="code-block-scroll"
    role="group"
    tabindex="0"
    aria-label={languageLabel ?? "Code"}
    style={scrollMaxHeight ? `max-height: ${scrollMaxHeight}` : undefined}
  >
    <div
      data-ui-part="code-block-code-wrapper"
      data-compact={showHeader && !hasLineNumbers ? "true" : undefined}
    >
      <code
        bind:this={codeEl}
        data-ui-part="code-block-code"
        data-size={size}
        data-wrapped={isWrapped ? "true" : undefined}
        data-line-numbers={hasLineNumbers ? "true" : undefined}
        style={hasLineNumbers
          ? `--_codeblock-gutter-width: ${maxLineDigits}ch`
          : undefined}
      >
        {#each lineChunks as chunk (chunk.start)}
          {#if lines.length >= LINE_CHUNK_THRESHOLD}
            <div
              data-ui-part="code-block-line-chunk"
              style={`contain-intrinsic-block-size: auto ${chunk.end - chunk.start}lh`}
            >
              {#each range(chunk.start, chunk.end) as lineIndex (lineIndex)}
                {@render lineBody(lineIndex)}
              {/each}
            </div>
          {:else}
            {#each range(chunk.start, chunk.end) as lineIndex (lineIndex)}
              {@render lineBody(lineIndex)}
            {/each}
          {/if}
        {/each}
      </code>
    </div>
  </div>
{/snippet}

{#snippet block()}
  <pre
    bind:this={ref}
    {...omitDataUiComponent(restProps)}
    data-ui-component="code-block"
    data-slot="code-block"
    data-size={size}
    data-language={language}
    data-container={container}
    data-width={widthAttr}
    class={className}
    style={rootStyle}>
    {#if showHeader}
      <div
        data-ui-part="code-block-header-row"
        data-divider={hasLineNumbers ? "true" : "false"}>
        <!-- svelte-ignore a11y_no_noninteractive_tabindex a11y_no_static_element_interactions -->
        <div
          data-ui-part="code-block-header"
          data-collapsible={canCollapse ? "true" : undefined}
          role={canCollapse ? "button" : undefined}
          tabindex={canCollapse ? 0 : undefined}
          aria-expanded={canCollapse ? !isCollapsed : undefined}
          aria-controls={canCollapse ? regionId : undefined}
          onclick={canCollapse ? toggleCollapsed : undefined}
          onkeydown={canCollapse ? onHeaderKeydown : undefined}>
          <span data-ui-part="code-block-header-title"
            >{#if canCollapse}<span
                data-ui-part="code-block-collapse-chevron"
                data-expanded={!isCollapsed ? "true" : undefined}
                ><ChevronRightIcon size={14} aria-hidden="true" /></span
              >{/if}{title ?? ""}{title && languageLabel
              ? " — "
              : ""}{languageLabel ?? ""}</span
          >
        </div>
        {@render copyControl("header")}
      </div>
    {/if}

    {#if canCollapse}
      <div
        id={regionId}
        data-ui-part="code-block-collapse"
        data-collapsed={isCollapsed ? "true" : undefined}
        inert={isCollapsed || undefined}>
        <div data-ui-part="code-block-collapse-inner">
          {@render codeBody()}
        </div>
      </div>
    {:else}
      {@render codeBody()}
    {/if}

    {#if !showHeader}
      {@render copyControl("absolute")}
    {/if}

    <span data-ui-part="code-block-live" aria-live="polite">{announceText}</span
    >
  </pre>
{/snippet}

{#if syntaxTheme}
  <SyntaxTheme theme={syntaxTheme}>
    {@render block()}
  </SyntaxTheme>
{:else}
  {@render block()}
{/if}
