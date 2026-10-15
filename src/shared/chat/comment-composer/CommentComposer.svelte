<script lang="ts">
  import { onMount } from "svelte";
  import { MiraCodeEditor, type MiraCodeEditorHandle } from "@lapismd/mira";
  import { Prec } from "@codemirror/state";
  import { EditorView } from "@codemirror/view";
  import CornerUpLeftIcon from "@lucide/svelte/icons/corner-up-left";
  import XIcon from "@lucide/svelte/icons/x";
  import { Button } from "../../shadcn/button/index.js";
  import { ScrollArea } from "../../shadcn/scroll-area/index.js";
  import { shouldSubmitComposerKey } from "../../ai/composer-behavior.js";
  import MarkdownContent from "../markdown-content/MarkdownContent.svelte";
  import type {
    CommentComposerHandle,
    CommentComposerProps,
  } from "./comment-composer.types.js";
  import "@lapismd/mira/styles.css";
  import "./comment-composer.css";

  let {
    ref = $bindable(null),
    handle = $bindable(null),
    value = $bindable(""),
    source,
    sourceContent,
    avatar,
    onChange,
    onSubmit,
    onDismiss,
    onRemove,
    onNavigateSource,
    label = "Comment composer",
    inputLabel,
    placeholder = "Add a comment…",
    name,
    disabled = false,
    pending = false,
    readOnly = false,
    class: className,
    ...restProps
  }: CommentComposerProps = $props();
  let editor = $state<MiraCodeEditorHandle | undefined>();
  const blocked = $derived(disabled || pending || readOnly);
  const publicHandle: CommentComposerHandle = {
    focus: () => editor?.focus(),
    getSelection: () => editor?.getSelection() ?? null,
    setSelection: (selection) => editor?.setSelection(selection),
  };
  onMount(() => {
    handle = publicHandle;
    return () => {
      if (handle?.focus === publicHandle.focus) handle = null;
    };
  });
  function change(next: string) {
    value = next;
    onChange?.(next);
  }
  const extensions = [
    EditorView.theme({
      "&.cm-editor": {
        fontSize: "var(--ui-comment-composer-font-size, 1rem)",
        "--file-margins-x": "0px",
        "--file-margins-y": "0px",
        "--file-line-width": "100%",
        "--mira-line-height": "var(--ui-comment-composer-line-height, 1.5)",
      },
      ".cm-scroller": {
        fontFamily: "var(--_comment-font-family)",
        lineHeight: "var(--ui-comment-composer-line-height, 1.5)",
      },
      "&.cm-editor > .cm-scroller > .cm-content": {
        padding: "0",
        minHeight: "1.5rem",
      },
      ".cm-cursor": {
        borderInlineStartWidth: "2px",
        borderInlineStartColor: "var(--primary)",
        marginInlineStart: "0",
      },
    }),
    Prec.highest(
      EditorView.domEventHandlers({
        keydown(event, view) {
          if (
            event.defaultPrevented ||
            event.isComposing ||
            event.keyCode === 229 ||
            view.composing
          )
            return false;
          if (event.key === "Escape" && onDismiss) {
            event.preventDefault();
            onDismiss();
            return true;
          }
          if (
            !blocked &&
            onSubmit &&
            value.trim() &&
            !event.altKey &&
            (event.ctrlKey || event.metaKey) &&
            shouldSubmitComposerKey(event)
          ) {
            event.preventDefault();
            onSubmit(value);
            return true;
          }
          return false;
        },
      }),
    ),
  ];
</script>

<div
  bind:this={ref}
  {...restProps}
  class={["ui-comment-composer", className].filter(Boolean).join(" ")}
  data-ui-component="comment-composer"
  data-context={Boolean(source)}
  data-disabled={disabled}
  data-pending={pending}
  role="group"
  aria-label={label}
  aria-busy={pending}
  aria-disabled={disabled}
>
  {#if name}<input type="hidden" {name} {value} />{/if}
  {#if source}
    <div class="ui-comment-composer__source">
      <ScrollArea
        class="ui-comment-composer__quote-scroll"
        scrollStrategy="styled"
      >
        <blockquote
          class="ui-comment-composer__quote"
          aria-label={`Quoted source: ${source.label}`}
        >
          {#if sourceContent}{@render sourceContent(source)}
          {:else if source.kind === "markdown"}<MarkdownContent
              content={source.quote}
              compact
              fullWidth
              class="ui-comment-composer__markdown"
            />
          {:else}<code>{source.quote}</code>{/if}
        </blockquote>
      </ScrollArea>
      {#if onNavigateSource}<Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label={`Go to source: ${source.label}`}
          title="Go to source"
          disabled={disabled || pending || source.available === false}
          onclick={(event) => onNavigateSource?.(event.currentTarget)}
          ><CornerUpLeftIcon aria-hidden="true" /></Button
        >{/if}
    </div>
    {#if source.available === false}<p class="ui-comment-composer__unavailable">
        Original content unavailable or changed.
      </p>{/if}
  {/if}
  <div class="ui-comment-composer__card">
    {#if avatar}<div class="ui-comment-composer__avatar">
        {@render avatar()}
      </div>{/if}
    <div class="ui-comment-composer__input">
      <MiraCodeEditor
        bind:this={editor}
        {value}
        onChange={change}
        readonly={blocked}
        {extensions}
        ariaLabel={inputLabel ??
          (source ? `Comment on ${source.label}` : "Comment")}
        {placeholder}
        variant="document"
        surface="frameless"
        height="content"
        minHeight="1.5rem"
        lineNumbers={false}
        spellcheck
      />
    </div>
    {#if onRemove}<div class="ui-comment-composer__actions">
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          disabled={blocked}
          aria-label="Remove comment"
          title="Remove comment"
          onclick={onRemove}><XIcon aria-hidden="true" /></Button
        >
      </div>{/if}
  </div>
</div>
