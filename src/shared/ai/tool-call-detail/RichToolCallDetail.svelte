<script lang="ts">
  import * as Empty from "@lapismd/design-core/shadcn/empty";
  import FileQuestionIcon from "@lucide/svelte/icons/file-question-mark";
  import { tick } from "svelte";
  import * as Dialog from "@lapismd/design-core/shadcn/dialog";
  import MaximizeIcon from "@lucide/svelte/icons/maximize";
  import MinimizeIcon from "@lucide/svelte/icons/minimize";
  import { FileDiff, resolveDiffLanguage } from "@lapismd/design-core/diff";
  import { Button } from "@lapismd/design-core/shadcn/button";
  import { FileTypeIcon } from "@lapismd/design-core/shadcn/file-type-icon";
  import { CodeBlock } from "@lapismd/design-core/shadcn/code-block";
  import ContentViewToggle from "../content-view-toggle/ContentViewToggle.svelte";
  import * as Alert from "@lapismd/design-core/shadcn/alert";
  import ExternalLinkIcon from "@lucide/svelte/icons/external-link";
  import TerminalIcon from "@lucide/svelte/icons/terminal";
  import ToolCallPayloads from "./ToolCallPayloads.svelte";
  import type {
    ToolCallDetailProps,
    ToolDetailTarget,
  } from "./rich-tool-call-detail.types.js";
  import "./rich-tool-call-detail.css";

  let {
    input,
    output,
    error,
    toolName,
    detail,
    raw,
    view = $bindable("formatted"),
    capture,
    onOpen,
    maximized = $bindable(false),
  }: ToolCallDetailProps = $props();

  let maximizeButton = $state<HTMLButtonElement | null>(null);
  let contentElement = $state<HTMLDivElement | null>(null);
  let inlineHeight = $state(0);

  function maximize() {
    inlineHeight = contentElement?.getBoundingClientRect().height ?? 0;
    maximized = true;
  }

  function restoreFocus(event: Event) {
    event.preventDefault();
    void tick().then(() => maximizeButton?.focus());
  }

  const notice = $derived(
    [
      capture?.partial ? "Only part of this activity was captured." : "",
      capture?.redacted ? "Sensitive fields were redacted." : "",
      capture?.truncated ? "Output was truncated." : "",
      capture?.note,
    ]
      .filter(Boolean)
      .join(" "),
  );

  const shell = $derived(
    detail?.kind === "shell"
      ? [
          `$ ${detail.command}`,
          detail.output,
          detail.error == null || detail.error === ""
            ? undefined
            : `stderr:\n${detail.error}`,
        ]
          .filter((part) => part !== undefined && part !== "")
          .join("\n")
      : "",
  );
  const hasRaw = $derived(
    raw !== undefined ||
      input !== undefined ||
      output !== undefined ||
      error !== undefined,
  );

  function setView(next: string) {
    if (next === "formatted" || next === "raw") view = next;
  }

  function open(path: string, line?: number, column?: number) {
    const target: ToolDetailTarget = { path };
    if (line !== undefined) target.line = line;
    if (column !== undefined) target.column = column;
    onOpen?.(target);
  }
</script>

{#snippet content()}
  <div
    bind:this={contentElement}
    data-ui-component="ai-chat-tool-call-detail"
    data-ui-part="root"
    data-view={view}
    data-maximized={maximized}
    data-kind={detail?.kind ?? "generic"}
  >
    <div class="tool-detail__toolbar">
      <span class="tool-detail__title">{toolName ?? "Tool details"}</span>
      <div class="tool-detail__actions">
        <ContentViewToggle
          view={view === "raw" ? "source" : "formatted"}
          sourceLabel="Show raw capture"
          onViewChange={(next) =>
            setView(next === "source" ? "raw" : "formatted")}
        />
        {#if maximized}
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Restore tool details"
            title="Restore tool details"
            onclick={() => (maximized = false)}
            ><MinimizeIcon aria-hidden="true" /></Button
          >
        {:else}
          <Button
            bind:ref={maximizeButton}
            variant="ghost"
            size="icon-sm"
            aria-label="Maximize tool details"
            title="Maximize tool details"
            onclick={maximize}><MaximizeIcon aria-hidden="true" /></Button
          >
        {/if}
      </div>
    </div>
    {#if notice}<Alert.Root
        ><Alert.Description>{notice}</Alert.Description></Alert.Root
      >{/if}

    {#if view === "raw"}
      {#if raw !== undefined}
        <CodeBlock
          code={raw}
          language="json"
          title="Raw tool call"
          size="sm"
          width="full"
          isWrapped
          maxHeight="var(--ui-tool-detail-max-height, 20rem)"
        />
      {:else}
        {#each [{ title: "Raw input", value: input }, { title: "Raw output", value: output }, { title: "Raw error", value: error }] as payload (payload.title)}
          {#if payload.value !== undefined}<CodeBlock
              code={payload.value}
              language="plaintext"
              title={payload.title}
              size="sm"
              width="full"
              isWrapped
              maxHeight="var(--ui-tool-detail-max-height, 20rem)"
            />{/if}
        {/each}
        {#if !hasRaw}<p class="tool-detail__notice">
            No raw payload was captured.
          </p>{/if}
      {/if}
    {:else}
      {#if error && detail && !(detail.kind === "shell" && detail.error === error)}
        <Alert.Root variant="destructive"
          ><Alert.Description>{error}</Alert.Description></Alert.Root
        >
      {/if}
      {#if detail?.kind === "shell"}
        <section
          class="tool-detail__panel"
          aria-label="Shell command and output"
          data-ui-part="shell-panel"
        >
          <header class="tool-detail__panel-header">
            <span class="tool-detail__heading"
              ><TerminalIcon aria-hidden="true" />Shell</span
            >
            {#if detail.exitCode != null}<span
                class="tool-detail__exit"
                data-error={detail.exitCode !== 0}>Exit {detail.exitCode}</span
              >{/if}
          </header>
          {#if detail.cwd}<p class="tool-detail__context">{detail.cwd}</p>{/if}
          <CodeBlock
            code={shell}
            language="bash"
            container="section"
            hasLanguageLabel={false}
            size="sm"
            width="full"
            isWrapped
            maxHeight="var(--ui-tool-detail-max-height, 20rem)"
          />
        </section>
      {:else if detail?.kind === "file-read"}
        <section class="tool-detail__panel" aria-label="File contents">
          <header class="tool-detail__panel-header">
            <span class="tool-detail__path"
              >{#if detail.path}<FileTypeIcon
                  path={detail.path}
                  size="s"
                />{/if}<span>{detail.path ?? "Captured file contents"}</span
              ></span
            >
            {#if detail.path && onOpen}<Button
                variant="ghost"
                size="sm"
                onclick={() => {
                  if (detail?.kind === "file-read" && detail.path)
                    open(detail.path, detail.startLine);
                }}
                >Open file<ExternalLinkIcon
                  data-icon="inline-end"
                  aria-hidden="true"
                /></Button
              >{/if}
          </header>
          {#if !detail.path}<p class="tool-detail__context">
              No unique file path was recorded.
            </p>{/if}
          {#if detail.startLine !== undefined}<p class="tool-detail__context">
              Captured from line {detail.startLine}
            </p>{/if}
          <CodeBlock
            code={detail.content}
            language={detail.language ??
              resolveDiffLanguage(detail.path ?? "") ??
              "plaintext"}
            container="section"
            hasLanguageLabel={false}
            size="sm"
            width="full"
            isWrapped
            maxHeight="var(--ui-tool-detail-max-height, 20rem)"
          />
        </section>
      {:else if detail?.kind === "file-edit"}
        {#each detail.files as file, index (index)}
          <section
            class="tool-detail__panel"
            aria-label={`Change to ${file.path ?? "unknown file"}`}
          >
            <header class="tool-detail__panel-header">
              <span class="tool-detail__path"
                >{#if file.path}<FileTypeIcon
                    path={file.path}
                    size="s"
                  />{/if}<span>{file.path ?? "Captured change"}</span></span
              >
              {#if file.path && onOpen}<Button
                  variant="ghost"
                  size="sm"
                  onclick={() => {
                    if (file.path) open(file.path);
                  }}
                  >Open file<ExternalLinkIcon
                    data-icon="inline-end"
                    aria-hidden="true"
                  /></Button
                >{/if}
            </header>
            {#if !file.path}<p class="tool-detail__context">
                No unique file path was recorded.
              </p>{/if}
            {#if file.partial}
              <p class="tool-detail__context">
                Only {file.capturedSide === "before"
                  ? "the original contents were"
                  : file.capturedSide === "after"
                    ? "the updated contents were"
                    : "one side was"} captured. A complete diff is unavailable.
              </p>
              {#if file.capturedText !== undefined}<CodeBlock
                  code={file.capturedText}
                  language={file.language ??
                    resolveDiffLanguage(file.path ?? "") ??
                    "plaintext"}
                  container="section"
                  hasLanguageLabel={false}
                  size="sm"
                  width="full"
                  isWrapped
                  maxHeight="var(--ui-tool-detail-max-height, 20rem)"
                />{/if}
            {:else}
              <div class="tool-detail__diff">
                <FileDiff
                  path={file.path ?? ""}
                  {...file.language === undefined
                    ? {}
                    : { language: file.language }}
                  {..."patch" in file && file.patch !== undefined
                    ? { patch: file.patch }
                    : {
                        oldText: file.oldText ?? null,
                        newText: file.newText ?? null,
                      }}
                  viewMode="unified"
                  wrap
                />
              </div>
            {/if}
          </section>
        {/each}
        {#if detail.files.length === 0}<p class="tool-detail__notice">
            No file changes were captured.
          </p>{/if}
      {:else if detail?.kind === "search"}
        <section class="tool-detail__panel" aria-label="Search results">
          <header class="tool-detail__panel-header">
            <span class="tool-detail__heading">Search results</span><span
              class="tool-detail__count">{detail.matches.length} captured</span
            >
          </header>
          {#if detail.query !== undefined}<p class="tool-detail__context">
              <code>{detail.query}</code>
            </p>{/if}
          {#if detail.command}<p class="tool-detail__context">
              <code>$ {detail.command}</code>
            </p>{/if}
          <ol class="tool-detail__matches">
            {#each detail.matches as match, index (index)}
              <li>
                {#if match.path && onOpen}<Button
                    variant="link"
                    size="sm"
                    onclick={() => {
                      if (match.path)
                        open(match.path, match.line, match.column);
                    }}
                    ><FileTypeIcon
                      path={match.path}
                      size="s"
                      data-icon="inline-start"
                    /><span
                      >{match.path}{match.line === undefined
                        ? ""
                        : `:${match.line}`}{match.column === undefined
                        ? ""
                        : `:${match.column}`}</span
                    ></Button
                  >
                {:else}<span class="tool-detail__location"
                    >{#if match.path}<FileTypeIcon
                        path={match.path}
                        size="s"
                      />{/if}<span
                      >{match.path ?? "Unknown location"}{match.line ===
                      undefined
                        ? ""
                        : `:${match.line}`}{match.column === undefined
                        ? ""
                        : `:${match.column}`}</span
                    ></span
                  >{/if}
                <code>{match.text}</code>
              </li>
            {/each}
          </ol>
          {#if detail.matches.length === 0}<p class="tool-detail__context">
              No matches were captured.
            </p>{/if}
        </section>
      {:else if detail?.kind === "unavailable"}<Empty.Root role="status"
          ><Empty.Header
            ><Empty.Media variant="icon"
              ><FileQuestionIcon aria-hidden="true" /></Empty.Media
            ><Empty.Title>Tool output unavailable</Empty.Title
            ><Empty.Description>{detail.reason}</Empty.Description
            ></Empty.Header
          ></Empty.Root
        >
      {:else if input !== undefined || output !== undefined || error !== undefined}
        <ToolCallPayloads
          {...input === undefined ? {} : { input }}
          {...output === undefined ? {} : { output }}
          {...error === undefined ? {} : { error }}
          {...toolName === undefined ? {} : { toolName }}
        />
      {:else}<p class="tool-detail__notice">
          No formatted output was captured. Check Raw for recorded fields.
        </p>{/if}
    {/if}
  </div>
{/snippet}

<Dialog.Root bind:open={maximized}>
  {#if maximized}
    <div style:height={`${inlineHeight}px`} aria-hidden="true"></div>
    <Dialog.Content
      class="tool-detail__fullscreen"
      showCloseButton={false}
      onCloseAutoFocus={restoreFocus}
    >
      <Dialog.Title class="sr-only"
        >{toolName ?? "Tool details"} — maximized</Dialog.Title
      >
      <Dialog.Description class="sr-only"
        >Expanded tool output. Press Escape or use Restore tool details to
        return inline.</Dialog.Description
      >
      {@render content()}
    </Dialog.Content>
  {:else}
    {@render content()}
  {/if}
</Dialog.Root>
