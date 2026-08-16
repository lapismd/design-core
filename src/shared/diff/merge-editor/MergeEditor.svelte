<script lang="ts">
  import { onMount } from "svelte";
  import CheckCheckIcon from "@lucide/svelte/icons/check-check";
  import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
  import ChevronUpIcon from "@lucide/svelte/icons/chevron-up";
  import PencilIcon from "@lucide/svelte/icons/pencil";
  import PlayIcon from "@lucide/svelte/icons/play";
  import XIcon from "@lucide/svelte/icons/x";
  import { ensureHighlightStyles } from "../../shadcn/code-block/index.js";
  import { Button } from "../../shadcn/button/index.js";
  import * as ScrollArea from "../../shadcn/scroll-area/index.js";
  import { highlightText } from "../file-diff/highlight.js";
  import { resolveDiffLanguage } from "../file-diff/language.js";
  import {
    applyMergeAction,
    assembleOneWayMerge,
    assembleThreeWayMerge,
    createMergeRenderModel,
    deleteMergedRenderComponentFromCenter,
    mergeRenderComponentIntoCenter,
    navigationIndexForLine,
    pendingMergeNavigationTargets,
    serializeMergeCenter,
    type MergeModel,
    type MergeSide,
    type RenderComponent,
  } from "../core/merge/index.js";
  import {
    EMPTY_CONNECTOR_GEOMETRY,
    measureConnectorLane,
    type ConnectorGeometry,
  } from "./connector.js";
  import type { MergeEditorMode, MergeResolvedChange } from "./types.js";
  import "./MergeEditor.css";

  let {
    mode = "three-way",
    left,
    right,
    base = "",
    leftLabel = "Left",
    baseLabel = "Resolved",
    rightLabel = "Right",
    path,
    language,
    readOnly = false,
    editable = false,
    editableSides,
    ignoreWhitespace = false,
    ignoreCase = false,
    syncHorizontalScroll = false,
    wrap = false,
    onLeftChange,
    onBaseChange,
    onRightChange,
    onResolvedChange,
  }: {
    mode?: MergeEditorMode;
    left: string;
    right: string;
    /** Required for three-way merges; ignored for one-way. */
    base?: string;
    leftLabel?: string;
    baseLabel?: string;
    rightLabel?: string;
    path?: string;
    language?: string | null;
    readOnly?: boolean;
    /** When true, visible sides are editable unless `editableSides` narrows them. */
    editable?: boolean;
    editableSides?: readonly MergeSide[];
    ignoreWhitespace?: boolean;
    ignoreCase?: boolean;
    syncHorizontalScroll?: boolean;
    wrap?: boolean;
    onLeftChange?: (content: string) => void;
    onBaseChange?: (content: string) => void;
    onRightChange?: (content: string) => void;
    onResolvedChange?: (state: MergeResolvedChange) => void;
  } = $props();

  const mergeOptions = $derived({
    ignoreWhitespace,
    ignoreCase,
    workingCopyCenter: true,
  });
  const inputKey = $derived(
    `${mode}\0${left}\0${base}\0${right}\0${ignoreWhitespace}\0${ignoreCase}`,
  );
  const resolvedLanguage = $derived(resolveDiffLanguage(path ?? "", language));
  let draft = $state<{
    key: string;
    left: string;
    base: string;
    right: string;
  } | null>(null);
  let override = $state<{ key: string; model: MergeModel } | null>(null);
  const source = $derived({
    left: draft?.key === inputKey ? draft.left : left,
    base: draft?.key === inputKey ? draft.base : base,
    right: draft?.key === inputKey ? draft.right : right,
  });
  const model = $derived(
    override?.key === inputKey
      ? override.model
      : mode === "one-way"
        ? assembleOneWayMerge(source.left, source.right, mergeOptions)
        : assembleThreeWayMerge(
            source.left,
            source.base,
            source.right,
            mergeOptions,
          ),
  );
  const resolvedEditableSides = $derived.by((): ReadonlySet<MergeSide> => {
    if (readOnly || !editable) return new Set();
    if (editableSides) return new Set(editableSides);
    return mode === "one-way"
      ? new Set<MergeSide>(["left", "right"])
      : new Set<MergeSide>(["left", "base", "right"]);
  });
  let editorEl: HTMLElement | null = $state(null);
  let geometry = $state<ConnectorGeometry>(EMPTY_CONNECTOR_GEOMETRY);
  let activeIndex = $state(0);

  const renderModel = $derived(
    mode === "one-way"
      ? createMergeRenderModel(model, ["left", "right"])
      : createMergeRenderModel(model),
  );
  const navigationTargets = $derived(
    pendingMergeNavigationTargets(renderModel),
  );
  const currentIndex = $derived(
    navigationTargets.length === 0
      ? -1
      : Math.min(Math.max(activeIndex, 0), navigationTargets.length - 1),
  );
  const currentTarget = $derived(
    currentIndex < 0 ? undefined : navigationTargets[currentIndex],
  );
  const footerCounts = $derived({
    added: model.blocks.filter((block) => block.kind === "added").length,
    removed: model.blocks.filter((block) => block.kind === "removed").length,
    modified: model.blocks.filter((block) => block.kind === "modified").length,
    conflict: model.blocks.filter(
      (block) => block.kind === "conflict" && !block.resolved,
    ).length,
    resolved: model.blocks.filter(
      (block) => block.kind === "conflict" && block.resolved,
    ).length,
  });

  onMount(() => {
    ensureHighlightStyles();
  });

  $effect(() => {
    emitResolved(model);
  });

  $effect(() => {
    const container = editorEl;
    const targets = navigationTargets;
    if (!container) return;
    const onClick = (event: MouseEvent) => {
      const host = (event.target as HTMLElement | null)?.closest(
        "[data-block-id]",
      );
      if (!host || !container.contains(host)) return;
      const blockId = host.getAttribute("data-block-id");
      const index = targets.findIndex((target) => target.blockId === blockId);
      if (index >= 0) activeIndex = index;
    };
    container.addEventListener("click", onClick);
    return () => container.removeEventListener("click", onClick);
  });

  $effect(() => {
    const container = editorEl;
    const syncAcross = syncHorizontalScroll;
    if (!container) return;
    const views = [
      ...container.querySelectorAll<HTMLElement>("[data-ui-part='merge-view']"),
    ];
    const targets = views.flatMap((view) => {
      const viewport = view.querySelector<HTMLElement>(
        "[data-ui-part='scroll-area-viewport']",
      );
      return viewport
        ? [{ side: view.dataset.mergeSide, viewport }]
        : [];
    });
    if (targets.length === 0) return;
    let syncing = false;
    const listeners = targets.map((target) => {
      const onScroll = () => {
        if (syncing) return;
        syncing = true;
        for (const candidate of targets) {
          if (candidate.viewport === target.viewport) continue;
          if (candidate.viewport.scrollTop !== target.viewport.scrollTop) {
            candidate.viewport.scrollTop = target.viewport.scrollTop;
          }
          if (
            !syncAcross &&
            candidate.side !== target.side
          ) {
            continue;
          }
          if (candidate.viewport.scrollLeft !== target.viewport.scrollLeft) {
            candidate.viewport.scrollLeft = target.viewport.scrollLeft;
          }
        }
        syncing = false;
      };
      target.viewport.addEventListener("scroll", onScroll, { passive: true });
      return () => target.viewport.removeEventListener("scroll", onScroll);
    });
    return () => {
      for (const stop of listeners) stop();
    };
  });

  $effect(() => {
    const container = editorEl;
    const current = renderModel;
    const shouldWrap = wrap;
    if (!container) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      for (const view of container.querySelectorAll<HTMLElement>(
        "[data-ui-part='merge-view']",
      )) {
        const lines = view.querySelectorAll<HTMLElement>(
          ".ui-diff-merge-editor__line",
        );
        const numbers = view.querySelectorAll<HTMLElement>(
          ".ui-diff-merge-editor__line-number",
        );
        lines.forEach((line, index) => {
          const number = numbers[index];
          if (!number) return;
          number.style.height = shouldWrap
            ? `${line.getBoundingClientRect().height}px`
            : "";
        });
      }
      geometry = {
        left: measureConnectorLane(container, "left", current.leftConnections),
        right: measureConnectorLane(
          container,
          "right",
          current.rightConnections,
        ),
      };
    };
    const schedule = () => {
      if (frame !== 0) return;
      frame = window.requestAnimationFrame(measure);
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(container);
    const observed = [
      ...container.querySelectorAll<HTMLElement>(
        "[data-ui-part='merge-view'], [data-ui-part='merge-pane-scroll'], [data-ui-part='merge-component'], [data-ui-part='scroll-area-viewport']",
      ),
    ];
    for (const target of observed) observer.observe(target);
    const viewports = observed.filter(
      (target) => target.dataset.uiPart === "scroll-area-viewport",
    );
    for (const viewport of viewports) {
      viewport.addEventListener("scroll", schedule, { passive: true });
    }
    schedule();
    return () => {
      if (frame !== 0) window.cancelAnimationFrame(frame);
      observer.disconnect();
      for (const viewport of viewports) {
        viewport.removeEventListener("scroll", schedule);
      }
    };
  });

  function emitResolved(next: MergeModel) {
    onResolvedChange?.({
      resolved: next.unresolvedConflictCount === 0,
      conflictCount: next.conflictCount,
      unresolvedConflictCount: next.unresolvedConflictCount,
      content: serializeMergeCenter(next),
    });
  }

  function commit(next: MergeModel) {
    const nextBase = serializeMergeCenter(next);
    override = { key: inputKey, model: next };
    draft = {
      key: inputKey,
      left: source.left,
      base: nextBase,
      right: source.right,
    };
    onBaseChange?.(nextBase);
  }

  function writeDraft(
    next: Partial<{ left: string; base: string; right: string }>,
  ) {
    draft = {
      key: inputKey,
      left: next.left ?? source.left,
      base: next.base ?? source.base,
      right: next.right ?? source.right,
    };
    override = null;
  }

  function editSide(side: MergeSide, content: string) {
    writeDraft({ [side]: content });
    if (side === "left") onLeftChange?.(content);
    else if (side === "right") onRightChange?.(content);
    else onBaseChange?.(content);
  }

  function sideText(side: MergeSide): string {
    if (side === "left") return source.left;
    if (side === "right") return source.right;
    return source.base;
  }

  function applyCenterDraft(next: MergeModel) {
    const nextBase = serializeMergeCenter(next);
    writeDraft({ base: nextBase });
    onBaseChange?.(nextBase);
  }

  function applyComponentAction(component: RenderComponent) {
    if (readOnly || !component.action) return;
    if (component.action.kind === "merge") {
      applyCenterDraft(mergeRenderComponentIntoCenter(model, component));
      return;
    }
    if (component.action.kind === "delete") {
      if (component.side === "base") {
        applyCenterDraft(
          applyMergeAction(model, {
            type: "delete-merged-content",
            blockId: component.blockId,
          }),
        );
        return;
      }
      applyCenterDraft(deleteMergedRenderComponentFromCenter(model, component));
      return;
    }
    commit(
      applyMergeAction(model, {
        type: "mark-resolved",
        blockId: component.blockId,
        resolved: !component.resolved,
      }),
    );
  }

  function acceptAll(side: MergeSide) {
    if (readOnly) return;
    commit(applyMergeAction(model, { type: "accept-all", side }));
  }

  function navigate(delta: number) {
    if (navigationTargets.length === 0) return;
    const from = currentIndex < 0 ? 0 : currentIndex;
    const next =
      (((from + delta) % navigationTargets.length) + navigationTargets.length) %
      navigationTargets.length;
    activeIndex = next;
    const target = navigationTargets[next];
    editorEl
      ?.querySelector<HTMLElement>(
        `[data-ui-part='merge-component'][data-render-component-id="${target.componentId}"][data-placeholder="false"]`,
      )
      ?.scrollIntoView({ block: "center", inline: "nearest" });
  }

  function lineNumberFromOffset(text: string, offset: number): number {
    let line = 1;
    const end = Math.min(offset, text.length);
    for (let index = 0; index < end; index += 1) {
      if (text[index] === "\n") line += 1;
    }
    return line;
  }

  function syncCaret(event: Event, side: MergeSide) {
    const textarea = event.currentTarget as HTMLTextAreaElement;
    const index = navigationIndexForLine(
      navigationTargets,
      renderModel,
      side,
      lineNumberFromOffset(textarea.value, textarea.selectionStart),
    );
    if (index >= 0) activeIndex = index;
  }

  function actionLabel(component: RenderComponent): string {
    if (component.action?.kind === "resolve") {
      return component.resolved ? "Mark Unresolved" : "Mark Resolved";
    }
    if (component.action?.kind === "delete") {
      return "Delete merged content";
    }
    return `Merge ${component.side === "left" ? "Left" : "Right"}`;
  }
</script>

{#snippet actionButton(component: RenderComponent, side: MergeSide)}
  {#if !readOnly && component.action}
    <button
      type="button"
      class="ui-diff-merge-editor__action"
      data-action-kind={component.action.kind}
      data-point={component.action.kind === "merge" && side === "right"
        ? "toward-center"
        : undefined}
      aria-label={actionLabel(component)}
      title={actionLabel(component)}
      onclick={() => applyComponentAction(component)}
    >
      {#if component.action.kind === "delete"}
        <XIcon />
      {:else if component.action.kind === "resolve"}
        <PencilIcon />
      {:else}
        <PlayIcon fill="currentColor" />
      {/if}
    </button>
  {/if}
{/snippet}

{#snippet sideView(side: MergeSide, label: string)}
  {@const components = renderModel.sides[side]}
  {@const isEditable = resolvedEditableSides.has(side)}
  {@const editValue = sideText(side)}
  {@const editMinHeight = `calc(${Math.max(1, editValue.split("\n").length)} * var(--ui-diff-merge-line-height))`}
  <section
    class="ui-diff-merge-editor__view"
    data-ui-part="merge-view"
    data-merge-side={side}
    data-editable={isEditable}
    aria-label={label}
  >
    <ScrollArea.Root
      class="ui-diff-merge-editor__scroll"
      type="auto"
      orientation={wrap ? "vertical" : "both"}
    >
      <div class="ui-diff-merge-editor__view-inner">
        <div class="ui-diff-merge-editor__gutter">
          {#each components as component (component.id)}
            {#if component.placeholder || component.lines.length === 0}
              <div
                class="ui-diff-merge-editor__placeholder"
                data-block-id={component.blockId}
                data-visual-kind={component.visualKind}
                data-current={component.blockId === currentTarget?.blockId
                  ? "true"
                  : undefined}
              ></div>
            {:else}
              {#each component.lines as line, index (line.id)}
                <div
                  class="ui-diff-merge-editor__line-number"
                  data-visual-kind={component.visualKind}
                  data-block-id={component.blockId}
                  data-current={component.blockId === currentTarget?.blockId
                    ? "true"
                    : undefined}
                >
                  {#if index === 0}
                    {@render actionButton(component, side)}
                  {/if}
                  {component.lineStart + index}
                </div>
              {/each}
            {/if}
          {/each}
        </div>
        <div
          class="ui-diff-merge-editor__view-content"
          data-ui-part="merge-pane-scroll"
          data-merge-side={side}
          style:--ui-diff-merge-edit-min-height={editMinHeight}
        >
          <div
            class="ui-diff-merge-editor__component-stack"
            aria-hidden={isEditable}
          >
            {#each components as component (component.id)}
              <div
                class="ui-diff-merge-editor__component"
                data-ui-part="merge-component"
                data-render-component-id={component.id}
                data-block-id={component.blockId}
                data-visual-kind={component.visualKind}
                data-placeholder={component.placeholder}
                data-current={component.blockId === currentTarget?.blockId
                  ? "true"
                  : undefined}
              >
                {#each component.lines as line (line.id)}
                  <span class="ui-diff-merge-editor__line">
                    {#each line.parts as part, partIndex (`${line.id}-${partIndex}`)}
                      <span data-changed={part.changed}>
                        {#if part.changed}
                          {part.text}
                        {:else}
                          {#each highlightText(part.text, resolvedLanguage) as token (`${line.id}-${partIndex}-${token.key}`)}
                            {#if token.type}
                              <span class={`ui-code-token-${token.type}`}
                                >{token.text}</span
                              >
                            {:else}
                              {token.text}
                            {/if}
                          {/each}
                        {/if}
                      </span>
                    {/each}
                  </span>
                {/each}
              </div>
            {/each}
          </div>
          {#if isEditable}
            <textarea
              class="ui-diff-merge-editor__edit"
              aria-label={`Edit ${label}`}
              data-merge-side={side}
              spellcheck={false}
              value={editValue}
              oninput={(event) => editSide(side, event.currentTarget.value)}
              onclick={(event) => syncCaret(event, side)}
              onkeyup={(event) => syncCaret(event, side)}
              onselect={(event) => syncCaret(event, side)}
            ></textarea>
          {/if}
        </div>
      </div>
    </ScrollArea.Root>
  </section>
{/snippet}

{#snippet connectorLane(name: "left" | "right")}
  {@const lane = geometry[name]}
  <div
    class="ui-diff-merge-editor__connector"
    data-ui-part="merge-connector"
    data-connector-lane={name}
    aria-hidden="true"
  >
    <svg
      width={lane.width}
      height={lane.height}
      viewBox={`0 0 ${lane.width} ${lane.height}`}
      preserveAspectRatio="none"
      focusable="false"
    >
      {#each lane.paths as pathItem (pathItem.id)}
        <path
          class="ui-diff-merge-editor__connector-path"
          data-visual-kind={pathItem.visualKind}
          d={pathItem.path}
        />
      {/each}
    </svg>
  </div>
{/snippet}

<div
  bind:this={editorEl}
  class="ui-diff-merge-editor"
  data-ui-component="merge-editor"
  data-ui-part="merge-editor"
  data-mode={mode}
  data-path={path}
  data-wrap={wrap ? "true" : undefined}
>
  <div class="ui-diff-merge-editor__toolbar">
    <span class="ui-diff-merge-editor__title">{path ?? "Merge"}</span>
    <div class="ui-diff-merge-editor__nav">
      <Button
        variant="ghost"
        size="icon-xs"
        aria-label="Previous change"
        disabled={navigationTargets.length === 0}
        onclick={() => navigate(-1)}
      >
        <ChevronUpIcon />
      </Button>
      <span>
        {navigationTargets.length === 0
          ? "No changes"
          : `${currentIndex + 1} / ${navigationTargets.length}`}
      </span>
      <Button
        variant="ghost"
        size="icon-xs"
        aria-label="Next change"
        disabled={navigationTargets.length === 0}
        onclick={() => navigate(1)}
      >
        <ChevronDownIcon />
      </Button>
    </div>
  </div>

  <div class="ui-diff-merge-editor__labels" data-mode={mode}>
    <div class="ui-diff-merge-editor__label">
      {#if !readOnly}
        <span class="ui-diff-merge-editor__label-action">
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Accept All Incoming Changes from Left"
            onclick={() => acceptAll("left")}
          >
            <CheckCheckIcon />
          </Button>
        </span>
      {/if}
      <span>{leftLabel}</span>
    </div>
    <div
      class="ui-diff-merge-editor__label"
      data-spacer
      aria-hidden="true"
    ></div>
    {#if mode === "three-way"}
      <div class="ui-diff-merge-editor__label">
        <span>{baseLabel}</span>
      </div>
      <div
        class="ui-diff-merge-editor__label"
        data-spacer
        aria-hidden="true"
      ></div>
    {/if}
    <div class="ui-diff-merge-editor__label" data-align="end">
      {#if !readOnly}
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label="Accept All Incoming Changes from Right"
          onclick={() => acceptAll("right")}
        >
          <CheckCheckIcon />
        </Button>
      {/if}
      <span>{rightLabel}</span>
    </div>
  </div>

  <div class="ui-diff-merge-editor__main">
    <div class="ui-diff-merge-editor__views" data-mode={mode}>
      {@render sideView("left", leftLabel)}
      {@render connectorLane("left")}
      {#if mode === "three-way"}
        {@render sideView("base", baseLabel)}
        {@render connectorLane("right")}
      {/if}
      {@render sideView("right", rightLabel)}
    </div>
  </div>

  <footer class="ui-diff-merge-editor__footer">
    <div>
      Conflicts: {model.unresolvedConflictCount}/{model.conflictCount}
    </div>
    <div class="ui-diff-merge-editor__legend">
      {#if footerCounts.added > 0}
        <span>{footerCounts.added} added</span>
      {/if}
      {#if footerCounts.removed > 0}
        <span>{footerCounts.removed} removed</span>
      {/if}
      {#if footerCounts.modified > 0}
        <span>{footerCounts.modified} modified</span>
      {/if}
      {#if footerCounts.conflict > 0}
        <span>{footerCounts.conflict} conflict</span>
      {/if}
      {#if footerCounts.resolved > 0}
        <span>{footerCounts.resolved} resolved</span>
      {/if}
      {#if Object.values(footerCounts).every((count) => count === 0)}
        <span>No changes</span>
      {/if}
    </div>
  </footer>
</div>
