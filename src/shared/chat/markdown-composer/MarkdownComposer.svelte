<script lang="ts">
  import { acceptCompletion, completionStatus } from "@codemirror/autocomplete";
  import {
    composerSuggestions,
    composerTriggerQuery,
  } from "./composer-suggestions.js";
  import "./composer-suggestions.css";
  import { onMount, untrack } from "svelte";
  import Mira, { type MiraHandle } from "@lapismd/mira";
  import { fromOffset, type MiraMarkdownActionId } from "@lapismd/mira/core";
  import type { MiraExtension } from "@lapismd/mira/extensions";
  import { Prec } from "@codemirror/state";
  import { EditorView } from "@codemirror/view";
  import BoldIcon from "@lucide/svelte/icons/bold";
  import ItalicIcon from "@lucide/svelte/icons/italic";
  import StrikeIcon from "@lucide/svelte/icons/strikethrough";
  import CodeIcon from "@lucide/svelte/icons/code";
  import ListIcon from "@lucide/svelte/icons/list";
  import OrderedListIcon from "@lucide/svelte/icons/list-ordered";
  import QuoteIcon from "@lucide/svelte/icons/quote";
  import TypeIcon from "@lucide/svelte/icons/type";
  import ArrowUpIcon from "@lucide/svelte/icons/arrow-up";
  import SquareIcon from "@lucide/svelte/icons/square";
  import ReplyIcon from "@lucide/svelte/icons/reply";
  import XIcon from "@lucide/svelte/icons/x";
  import Composer from "../../ai/composer/Composer.svelte";
  import ComposerDrawer from "../../ai/composer-drawer/ComposerDrawer.svelte";
  import { shouldSubmitComposerKey } from "../../ai/composer-behavior.js";
  import { Button } from "../../shadcn/button/index.js";
  import { ScrollArea } from "../../shadcn/scroll-area/index.js";
  import {
    EmojiPicker,
    type CustomEmoji,
  } from "../../shadcn/emoji-picker/index.js";
  import * as Tooltip from "../../shadcn/tooltip/index.js";
  import type {
    MarkdownComposerHandle,
    MarkdownComposerProps,
  } from "./markdown-composer.types.js";
  import "@lapismd/mira/styles.css";
  import "./markdown-composer.css";

  let {
    ref = $bindable(null),
    handle = $bindable(null),
    value = $bindable(""),
    onChange,
    onSubmit,
    presentation = "framed",
    placeholder,
    label = "Message composer",
    inputLabel = "Message",
    name,
    disabled = false,
    busy = false,
    onStop,
    status,
    submitLabel = "Send message",
    showSendButton = true,
    submitOnEnter,
    formattingOpen = $bindable(false),
    dockActions = false,
    documentActions = $bindable(),
    colorMode = "inherit",
    extensions = [],
    triggers = [],
    customEmojis = [],
    emojis,
    emojiText,
    reply,
    onCancelReply,
    context,
    avatar,
    additionalActions,
    class: className,
    ...restProps
  }: MarkdownComposerProps = $props();
  let mira = $state<MiraHandle | undefined>();
  let view: EditorView | undefined;
  let selection = { anchor: 0, head: 0 };
  const blocked = $derived(disabled || busy);
  const enterSubmits = $derived(submitOnEnter ?? presentation === "framed");
  const hasDraft = $derived(value.trim().length > 0);
  const formatActions = [
    { id: "bold", label: "Bold", Icon: BoldIcon },
    { id: "italic", label: "Italic", Icon: ItalicIcon },
    { id: "strikethrough", label: "Strikethrough", Icon: StrikeIcon },
    { id: "inlineCode", label: "Inline code", Icon: CodeIcon },
    { id: "bulletList", label: "Bulleted list", Icon: ListIcon },
    { id: "numberedList", label: "Numbered list", Icon: OrderedListIcon },
    { id: "quote", label: "Quote", Icon: QuoteIcon },
  ] as const;

  function submit() {
    if (!blocked && hasDraft) onSubmit(value);
  }
  function restoreSelection() {
    if (!view || !mira) return;
    const length = view.state.doc.length;
    mira.setSelection({
      anchor: fromOffset(view.state.doc, Math.min(selection.anchor, length)),
      head: fromOffset(view.state.doc, Math.min(selection.head, length)),
    });
  }
  function insertText(text: string) {
    if (blocked || !mira) return;
    restoreSelection();
    mira.insertMarkdown(text);
    mira.focus();
  }
  function applyFormatting(action: MiraMarkdownActionId): boolean {
    if (blocked || !mira) return false;
    restoreSelection();
    const applied = mira.applyMarkdownAction(action);
    mira.focus();
    return applied;
  }
  const publicHandle: MarkdownComposerHandle = {
    focus: () => mira?.focus(),
    getSelection: () => mira?.getSelection() ?? null,
    setSelection(next) {
      mira?.setSelection(next);
    },
    insertText,
    applyFormatting,
  };
  onMount(() => {
    handle = publicHandle;
    return () => {
      // Bindings may proxy the object; the owned focus function stays stable.
      if (handle?.focus === publicHandle.focus) handle = null;
    };
  });
  const composerExtension: MiraExtension = {
    name: "design-core-markdown-composer",
    codeMirror: () => [
      // Compose public Mira tokens on the CodeMirror root, where its document
      // surface defines its own margins and readable line width.
      EditorView.theme({
        "&.cm-editor": {
          "--file-margins-x":
            "var(--ui-markdown-composer-editor-padding, var(--_composer-editor-padding, 0.5rem))",
          "--file-margins-y":
            "var(--ui-markdown-composer-editor-padding, var(--_composer-editor-padding, 0.5rem))",
          "--file-line-width": "100%",
        },
        "&.cm-editor > .cm-scroller > .cm-content": {
          minHeight: "var(--_composer-content-min-height, 0px)",
          paddingBlock: "var(--_composer-caret-padding-block, 0px)",
          paddingInline: "var(--_composer-caret-padding-inline, 0px)",
        },
        ".ui-markdown-composer[data-presentation='document'] & .cm-cursor": {
          borderInlineStartWidth: "2px",
          borderInlineStartColor:
            "var(--_composer-caret-color, var(--mira-foreground))",
          marginInlineStart: "0",
        },
        ".cm-gutters": { display: "none" },
      }),
      Prec.highest(
        EditorView.contentAttributes.of(() => ({
          "aria-label": inputLabel,
          "aria-multiline": "true",
        })),
      ),
      EditorView.updateListener.of((update) => {
        if (update.selectionSet || update.docChanged) {
          const main = update.state.selection.main;
          selection = { anchor: main.anchor, head: main.head };
        }
      }),
      Prec.highest(
        EditorView.domEventHandlers({
          keydown(event, editor) {
            if (
              !event.defaultPrevented &&
              !editor.composing &&
              !event.isComposing &&
              event.keyCode !== 229 &&
              !event.shiftKey &&
              !event.ctrlKey &&
              !event.metaKey &&
              !event.altKey &&
              event.key === "Enter" &&
              composerTriggerQuery(
                editor.state,
                triggers.map((trigger) => trigger.character),
              ) &&
              completionStatus(editor.state) !== null
            ) {
              if (completionStatus(editor.state) === "active" && !blocked)
                acceptCompletion(editor);
              event.preventDefault();
              return true;
            }
            if (
              event.defaultPrevented ||
              editor.composing ||
              event.altKey ||
              !shouldSubmitComposerKey(event)
            )
              return false;
            if (!enterSubmits && !event.ctrlKey && !event.metaKey) return false;
            event.preventDefault();
            submit();
            return true;
          },
        }),
      ),
    ],
    onMount(runtime) {
      if (!(runtime.view instanceof EditorView)) return;
      const current = runtime.view;
      view = current;
      const length = current.state.doc.length;
      current.dispatch({
        selection: {
          anchor: Math.min(selection.anchor, length),
          head: Math.min(selection.head, length),
        },
      });
      return () => {
        if (view === current) {
          const main = current.state.selection.main;
          selection = { anchor: main.anchor, head: main.head };
          view = undefined;
        }
      };
    },
  };
  const suggestions = composerSuggestions({
    triggers: () => triggers,
    disabled: () => blocked,
  });
  const editorExtensions = $derived([
    composerExtension,
    ...(triggers.length ? [suggestions] : []),
    ...extensions,
  ]);
  function change(next: string) {
    value = next;
    onChange?.(next);
  }
  function addEmoji(emoji: string, custom?: CustomEmoji) {
    insertText(
      emojiText?.(emoji, custom) ?? (custom ? `:${custom.shortcode}:` : emoji),
    );
  }
  const docked = $derived(dockActions && presentation === "document");
  $effect(() => {
    const actions = docked ? toolbar : undefined;
    untrack(() => (documentActions = actions));
    return () =>
      untrack(() => {
        if (documentActions === actions) documentActions = undefined;
      });
  });
</script>

{#snippet toolbar()}<Tooltip.Provider>
    <div
      class="ui-markdown-composer__actions"
      role="group"
      data-formatting-open={formattingOpen || undefined}
      aria-label="Message formatting and actions"
    >
      <Tooltip.Root>
        <Tooltip.Trigger
          >{#snippet child({ props })}
            <Button
              {...props}
              variant="ghost"
              size="icon-sm"
              disabled={blocked}
              aria-label="Formatting options"
              aria-pressed={formattingOpen}
              onclick={() => (formattingOpen = !formattingOpen)}
              ><TypeIcon aria-hidden="true" /></Button
            >
          {/snippet}</Tooltip.Trigger
        >
        <Tooltip.Content>Formatting options</Tooltip.Content>
      </Tooltip.Root>
      {#if formattingOpen}
        {#each formatActions as action (action.id)}
          <Tooltip.Root>
            <Tooltip.Trigger
              >{#snippet child({ props })}
                <Button
                  {...props}
                  variant="ghost"
                  size="icon-sm"
                  disabled={blocked}
                  aria-label={action.label}
                  onmousedown={(event) => event.preventDefault()}
                  onclick={() => applyFormatting(action.id)}
                  ><action.Icon aria-hidden="true" /></Button
                >
              {/snippet}</Tooltip.Trigger
            >
            <Tooltip.Content>{action.label}</Tooltip.Content>
          </Tooltip.Root>
        {/each}
      {/if}
      <EmojiPicker
        triggerLabel="Add emoji"
        disabled={blocked}
        {customEmojis}
        {...emojis === undefined ? {} : { emojis }}
        theme={colorMode === "light" || colorMode === "dark"
          ? colorMode
          : "auto"}
        onSelect={addEmoji}
      />
      {@render additionalActions?.({
        ...publicHandle,
        disabled: blocked,
        submit,
      })}
    </div>
  </Tooltip.Provider>{/snippet}

{#snippet replyPreview()}
  {#if reply}
    <ComposerDrawer
      class="ui-markdown-composer__reply"
      role="group"
      aria-label={`Replying to ${reply.authorName}`}
    >
      <div class="ui-markdown-composer__reply-row">
        <div class="ui-markdown-composer__quote">
          <ReplyIcon aria-hidden="true" />
          <strong>Replying to {reply.authorName}</strong>
          <small title={reply.content}>{reply.content}</small>
        </div>
        {#if onCancelReply}
          <Button
            class="ui-markdown-composer__cancel-reply"
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={blocked}
            aria-label="Cancel reply"
            onclick={() => {
              onCancelReply?.();
              mira?.focus();
            }}><XIcon aria-hidden="true" /></Button
          >
        {/if}
      </div>
    </ComposerDrawer>
  {/if}
{/snippet}

<div
  bind:this={ref}
  {...restProps}
  class={["ui-markdown-composer", className].filter(Boolean).join(" ")}
  data-ui-component="markdown-composer"
  data-presentation={presentation}
  data-actions-docked={docked}
  data-send-hidden={!showSendButton}
  aria-busy={busy}
  role="group"
  aria-label={label}
>
  {#if name}<input type="hidden" {name} {value} />{/if}
  <Tooltip.Provider>
    <Composer
      bind:value
      disabled={blocked}
      clearOnSubmit={false}
      elevation="none"
      isStopShown={busy && Boolean(onStop)}
      {...status === undefined ? {} : { status }}
      statusPosition="top"
      onSubmit={submit}
      {...reply ? { drawer: replyPreview } : {}}
      {...context === undefined ? {} : { headerContext: context }}
    >
      {#snippet input()}
        <div class="ui-markdown-composer__input-row">
          <div class="ui-markdown-composer__avatar">{@render avatar?.()}</div>
          <ScrollArea
            class="ui-markdown-composer__scroll"
            scrollStrategy="styled"
          >
            <Mira
              bind:this={mira}
              {value}
              onChange={change}
              mode="live-preview"
              readonly={blocked}
              placeholder={placeholder ??
                (presentation === "document" ? "" : "Write a message…")}
              {colorMode}
              extensions={editorExtensions}
              toolbar={false}
              blockControls={false}
              indentGuides={false}
              outline={false}
              htmlPolicy="safe"
              class="ui-markdown-composer__editor"
            />
          </ScrollArea>
        </div>
      {/snippet}
      {#snippet footerActions()}{#if !docked}{@render toolbar()}{/if}{/snippet}
      {#snippet sendButton()}
        {#if showSendButton}
          <Button
            data-ui-part="send-button"
            data-stop={busy && onStop ? "true" : undefined}
            size="icon-sm"
            disabled={busy && onStop ? false : blocked || !hasDraft}
            aria-label={busy && onStop ? "Stop response" : submitLabel}
            onclick={busy && onStop ? onStop : submit}
          >
            {#if busy && onStop}<SquareIcon
                aria-hidden="true"
              />{:else}<ArrowUpIcon aria-hidden="true" />{/if}
          </Button>
        {/if}
      {/snippet}
    </Composer>
  </Tooltip.Provider>
  <span class="ui-markdown-composer__hint"
    >{enterSubmits
      ? "Shift+Enter for a new line"
      : "Ctrl/⌘+Enter to send"}</span
  >
</div>
