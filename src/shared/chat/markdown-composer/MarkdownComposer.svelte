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
  import { Separator } from "../../shadcn/separator/index.js";
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
    statusContent,
    statusPosition = "top",
    submitLabel = "Send message",
    showSendButton = true,
    showHint = true,
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
    drawer,
    interactiveDrawerWhenDisabled = false,
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
      // Keep Mira's content styles; the chat shell owns column width and inset.
      EditorView.theme({
        "&.cm-editor": {
          "--file-line-width": "100%",
          "--file-margins-x":
            "var(--ui-markdown-composer-editor-padding, var(--_composer-editor-padding, 0.5rem))",
          "--file-margins-y":
            "var(--ui-markdown-composer-editor-padding, var(--_composer-editor-padding, 0.5rem))",
        },
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
              (event.key === "Enter" || event.key === "Tab") &&
              composerTriggerQuery(
                editor.state,
                triggers.map((trigger) => trigger.character),
              ) &&
              completionStatus(editor.state) !== null
            ) {
              if (event.key === "Tab") {
                if (
                  blocked ||
                  completionStatus(editor.state) !== "active" ||
                  !acceptCompletion(editor)
                )
                  return false;
                event.preventDefault();
                return true;
              }
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
              variant={formattingOpen ? "secondary" : "ghost"}
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
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Hide formatting"
          onclick={() => (formattingOpen = false)}
          ><XIcon aria-hidden="true" /></Button
        >
        <Separator
          orientation="vertical"
          class="ui-markdown-composer__separator"
        />
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
      {#if !formattingOpen}<EmojiPicker
          triggerLabel="Add emoji"
          disabled={blocked}
          {customEmojis}
          {...emojis === undefined ? {} : { emojis }}
          theme={colorMode === "light" || colorMode === "dark"
            ? colorMode
            : "auto"}
          onSelect={addEmoji}
        />{/if}
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

{#snippet composerDrawer()}
  {@render drawer?.()}
  {@render replyPreview()}
{/snippet}

<div
  bind:this={ref}
  {...restProps}
  class={["ui-markdown-composer", className].filter(Boolean).join(" ")}
  data-ui-component="markdown-composer"
  data-presentation={presentation}
  data-attached-status={status ? statusPosition : undefined}
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
      {interactiveDrawerWhenDisabled}
      clearOnSubmit={false}
      elevation="none"
      isStopShown={busy && Boolean(onStop)}
      {...status === undefined ? {} : { status }}
      {statusPosition}
      {statusContent}
      onSubmit={submit}
      {...drawer || reply ? { drawer: composerDrawer } : {}}
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
              lineNumbers={false}
              readonly={blocked}
              placeholder={placeholder ??
                (presentation === "document" ? "" : "Write a message…")}
              {colorMode}
              extensions={editorExtensions}
              toolbar={false}
              blockControls={false}
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
  {#if showHint}<span class="ui-markdown-composer__hint"
      >{enterSubmits
        ? "Shift+Enter for a new line"
        : "Ctrl/⌘+Enter to send"}</span
    >{/if}
</div>
