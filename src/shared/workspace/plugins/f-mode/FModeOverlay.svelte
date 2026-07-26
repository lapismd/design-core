<script lang="ts">
  import type { AppShellOverlayComponentProps } from "../../core/app-shell-ui-registry.svelte.js";
  import type { FModeEntry } from "./hint-labels.js";
  import type { FModeSession } from "./f-mode-session.svelte.js";
  import type { FModeHintTarget } from "./types.js";
  import "./FModeOverlay.css";

  let {
    session,
  }: AppShellOverlayComponentProps & {
    session: FModeSession;
  } = $props();

  let host = $state<HTMLDivElement | null>(null);
  let positions = $state<
    Record<string, { left: number; top: number; placement: string }>
  >({});
  let invalid = $state(false);
  let layoutFrame: number | null = null;
  let invalidTimer: ReturnType<typeof setTimeout> | null = null;
  let visibleEntries = $derived(session.visibleEntries);
  let visibleIds = $derived(
    new Set(visibleEntries.map((entry) => entry.target.id)),
  );

  function clips(value: string): boolean {
    return ["auto", "clip", "hidden", "overlay", "scroll"].includes(value);
  }

  function visibleTargetRect(element: HTMLElement): DOMRect | null {
    const view = element.ownerDocument.defaultView;
    if (!view) return null;
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return null;
    let left = Math.max(0, rect.left);
    let top = Math.max(0, rect.top);
    let right = Math.min(view.innerWidth, rect.right);
    let bottom = Math.min(view.innerHeight, rect.bottom);
    for (
      let current = element.parentElement;
      current && current !== element.ownerDocument.body;
      current = current.parentElement
    ) {
      const style = view.getComputedStyle(current);
      const ancestorRect = current.getBoundingClientRect();
      if (clips(style.overflowX)) {
        left = Math.max(left, ancestorRect.left);
        right = Math.min(right, ancestorRect.right);
      }
      if (clips(style.overflowY)) {
        top = Math.max(top, ancestorRect.top);
        bottom = Math.min(bottom, ancestorRect.bottom);
      }
      if (right <= left || bottom <= top) return null;
    }
    return right > left && bottom > top
      ? new DOMRect(left, top, right - left, bottom - top)
      : null;
  }

  function layoutBadges(): void {
    if (!host) return;
    const view = host.ownerDocument.defaultView;
    if (!view) return;
    const next: typeof positions = {};
    for (const entry of session.entries) {
      if (!visibleIds.has(entry.target.id)) continue;
      const rect = visibleTargetRect(entry.target.element);
      const badge = host.querySelector<HTMLElement>(
        `[data-fmode-target-id="${CSS.escape(entry.target.id)}"]`,
      );
      if (!rect || !badge) continue;
      const badgeRect = badge.getBoundingClientRect();
      const padding = 8;
      const preferredLeft = rect.right - badgeRect.width;
      const preferredTop = rect.bottom - badgeRect.height;
      const left = Math.min(
        Math.max(Math.round(preferredLeft), padding),
        Math.max(padding, view.innerWidth - badgeRect.width - padding),
      );
      const top = Math.min(
        Math.max(Math.round(preferredTop), padding),
        Math.max(padding, view.innerHeight - badgeRect.height - padding),
      );
      next[entry.target.id] = {
        left,
        top,
        placement: `${top < preferredTop ? "top" : "bottom"}-${left < preferredLeft ? "left" : "right"}`,
      };
    }
    positions = next;
  }

  function scheduleLayout(): void {
    if (!host || layoutFrame !== null) return;
    const view = host.ownerDocument.defaultView;
    if (!view) return;
    layoutFrame = view.requestAnimationFrame(() => {
      layoutFrame = null;
      layoutBadges();
    });
  }

  function styleFor(entry: FModeEntry<FModeHintTarget>): string {
    const position = positions[entry.target.id];
    return position
      ? `left:${position.left}px;top:${position.top}px;`
      : "visibility:hidden;";
  }

  $effect(() => {
    session.query;
    session.entries;
    if (session.active) scheduleLayout();
  });

  $effect(() => {
    const sequence = session.invalidSequence;
    if (!sequence) return;
    invalid = false;
    requestAnimationFrame(() => {
      invalid = true;
      if (invalidTimer) clearTimeout(invalidTimer);
      invalidTimer = setTimeout(() => (invalid = false), 180);
    });
  });

  $effect(() => {
    if (!session.active || !host) return;
    const document = host.ownerDocument;
    const view = document.defaultView;
    const update = () => scheduleLayout();
    document.addEventListener("scroll", update, true);
    view?.addEventListener("resize", update);
    const resizeObserver =
      typeof ResizeObserver === "function" ? new ResizeObserver(update) : null;
    resizeObserver?.observe(document.body);
    for (const entry of session.entries) {
      resizeObserver?.observe(entry.target.element);
    }
    scheduleLayout();
    return () => {
      document.removeEventListener("scroll", update, true);
      view?.removeEventListener("resize", update);
      resizeObserver?.disconnect();
      if (layoutFrame !== null) view?.cancelAnimationFrame(layoutFrame);
      layoutFrame = null;
    };
  });
</script>

{#if session.active && session.settings}
  <div
    bind:this={host}
    class="ui-workspace-fmode"
    class:ui-workspace-fmode--invalid={invalid}
    data-ui-component="workspace-f-mode"
    data-ui-part="overlay"
    data-fmode-root
    data-fmode-hud-mode={session.settings.hudMode}
    style={session.settings.accentColor
      ? `--ui-workspace-fmode-accent:${session.settings.accentColor};`
      : undefined}
  >
    <div
      class="ui-workspace-fmode__hud"
      data-ui-part="hud"
      hidden={session.settings.hudMode === "minimal"}
    >
      <span class="ui-workspace-fmode__query">
        {session.query ? session.query.toUpperCase() : "Type a hint"}
      </span>
      <span
        class="ui-workspace-fmode__summary"
        hidden={session.settings.hudMode !== "detailed"}
      >
        {session.query
          ? `${visibleEntries.length} matches`
          : `${session.entries.length} targets`}
      </span>
    </div>
    {#each session.entries as entry (entry.target.id)}
      <div
        class="ui-workspace-fmode__hint"
        class:ui-workspace-fmode__hint--exact={session.exactEntry?.target.id ===
          entry.target.id}
        hidden={!visibleIds.has(entry.target.id)}
        data-ui-part="hint"
        data-fmode-hint={entry.hint}
        data-fmode-target-id={entry.target.id}
        data-fmode-placement={positions[entry.target.id]?.placement}
        style={styleFor(entry)}
      >
        <span class="ui-workspace-fmode__hint-code">
          {entry.hint.toUpperCase()}
        </span>
        {#if session.settings.hudMode !== "minimal" && session.settings.showTargetLabels}
          <span class="ui-workspace-fmode__hint-label">
            {entry.target.label}
          </span>
          {#if session.settings.showTargetDescriptions && entry.target.description}
            <span class="ui-workspace-fmode__hint-description">
              {entry.target.description}
            </span>
          {/if}
        {/if}
      </div>
    {/each}
  </div>
{/if}
