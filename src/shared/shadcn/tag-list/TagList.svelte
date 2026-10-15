<script lang="ts">
  import { tick } from "svelte";
  import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
  import XIcon from "@lucide/svelte/icons/x";
  import { Button } from "../button/index.js";
  import * as Tooltip from "../tooltip/index.js";
  import * as Popover from "../popover/index.js";
  import { ScrollArea } from "../scroll-area/index.js";
  import TagChip from "./TagChip.svelte";
  import { fitTags, type TagListFit } from "./tag-list-fit.js";
  import type { TagListItem, TagListProps } from "./tag-list.types.js";
  import "./tag-list.css";

  let {
    tags,
    size = "sm",
    label = "Tags",
    class: className,
    ...restProps
  }: TagListProps = $props();
  const uid = $props.id();
  const titleId = `${uid}-title`;
  let root = $state<HTMLDivElement | null>(null);
  let probes = $state<HTMLDivElement | null>(null);
  let popup = $state<HTMLDivElement | null>(null);
  let viewport = $state<HTMLElement | null>(null);
  let fit = $state<TagListFit>({ visibleCount: 0 });
  let open = $state(false);
  let returnId: string | undefined;
  let popupStyle = $state("");
  const visible = $derived(tags.slice(0, fit.visibleCount));
  const hiddenCount = $derived(Math.max(0, tags.length - visible.length));
  const counts = $derived(
    Array.from({ length: tags.length }, (_, index) => index + 1),
  );

  function recoverFocus(preferred?: string): void {
    const owner = root;
    if (!owner?.isConnected) return;
    const active = owner.ownerDocument.activeElement;
    // A host callback or outside click may intentionally focus another surface.
    if (
      active instanceof HTMLElement &&
      active.isConnected &&
      active !== owner.ownerDocument.body &&
      !owner.contains(active) &&
      !popup?.contains(active)
    )
      return;
    const overflow = owner.querySelector<HTMLButtonElement>(
      '[data-ui-part="overflow"]',
    );
    const candidates = [
      ...owner.querySelectorAll<HTMLElement>("[data-tag-id]"),
    ];
    const matching = candidates.find(
      (element) =>
        element.dataset.tagId === preferred &&
        element.matches('button:not([aria-disabled="true"]), [tabindex="0"]'),
    );
    const fallback = owner.querySelector<HTMLButtonElement>(
      'button[data-tag-id]:not([aria-disabled="true"])',
    );
    (overflow ?? matching ?? fallback ?? owner).focus({ preventScroll: true });
  }

  function activate(tag: TagListItem, event: MouseEvent): void {
    if (tag.disabled) return;
    returnId = tag.id;
    open = false;
    tag.onClick?.(tag, event);
  }

  $effect.pre(() => {
    tags.map((tag) => ({ ...tag }));
    size;
    fit;
    const owner = root;
    const active = owner?.ownerDocument.activeElement;
    if (
      !owner ||
      !(active instanceof HTMLElement) ||
      (!owner.contains(active) && !popup?.contains(active))
    )
      return;
    const id = active.closest<HTMLElement>("[data-tag-id]")?.dataset.tagId;
    // Capture focus before a data update removes its rendered control.
    void tick().then(() => {
      if (!active.isConnected) recoverFocus(id);
    });
  });

  $effect(() => {
    const owner = root,
      measuring = probes;
    // Item presentation can change without replacing the array.
    tags.map((tag) => ({ ...tag }));
    size;
    if (!owner || !measuring) return;
    let frame: number | undefined;
    let disposed = false;
    const measure = () => {
      frame = undefined;
      if (disposed || !owner.isConnected) return;
      const items = [
        ...measuring.querySelectorAll<HTMLElement>(
          '[data-ui-part="measurement-tags"] [data-tag-measure]',
        ),
      ];
      if (items.length !== tags.length) return;
      const row = owner.querySelector<HTMLElement>('[data-ui-part="row"]');
      const minimum = measuring.querySelector<HTMLElement>(
        '[data-ui-part="minimum"] [data-tag-measure]',
      );
      if (!row || !minimum) return;
      const indicators: number[] = [];
      for (const button of measuring.querySelectorAll<HTMLElement>(
        "[data-measure-count]",
      ))
        indicators[Number(button.dataset.measureCount)] =
          button.getBoundingClientRect().width;
      const next = fitTags(
        items.map((item) => item.getBoundingClientRect().width),
        row.getBoundingClientRect().width,
        parseFloat(getComputedStyle(row).columnGap) || 0,
        indicators,
        minimum.getBoundingClientRect().width,
      );
      const active = owner.ownerDocument.activeElement;
      const focusedTag =
        active instanceof HTMLElement
          ? active.closest<HTMLElement>("[data-tag-id]")?.dataset.tagId
          : undefined;
      const focusedIndex = tags.findIndex((tag) => tag.id === focusedTag);
      const losingTag =
        focusedTag !== undefined &&
        (focusedIndex < 0 || focusedIndex >= next.visibleCount) &&
        active !== null &&
        owner.contains(active);
      const losingOverflow =
        active instanceof HTMLElement &&
        active.dataset.uiPart === "overflow" &&
        next.visibleCount === tags.length;
      const closing = open && next.visibleCount === tags.length;
      fit = next;
      if (closing) open = false;
      if (losingTag || losingOverflow || closing)
        void tick().then(() => recoverFocus(focusedTag));
    };
    const schedule = () => {
      if (!disposed) frame ??= requestAnimationFrame(measure);
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(owner);
    for (const element of measuring.querySelectorAll<HTMLElement>(
      "[data-tag-measure], [data-measure-count]",
    ))
      observer.observe(element);
    const fonts = owner.ownerDocument.fonts;
    fonts?.addEventListener("loadingdone", schedule);
    void fonts?.ready.then(schedule);
    schedule();
    return () => {
      disposed = true;
      observer.disconnect();
      fonts?.removeEventListener("loadingdone", schedule);
      if (frame !== undefined) cancelAnimationFrame(frame);
    };
  });

  $effect(() => {
    if (!open || !root) return;
    const style = getComputedStyle(root);
    // Carry explicit host overrides through the existing body portal.
    const names = [...style].filter((name) =>
      name.startsWith("--ui-tag-list-"),
    );
    popupStyle =
      `--ui-tag-list-font-family:${style.fontFamily};` +
      names.map((name) => `${name}:${style.getPropertyValue(name)};`).join("");
  });
</script>

{#if tags.length}
  <Tooltip.Provider delayDuration={200}>
    <div
      {...restProps}
      bind:this={root}
      class={["ui-tag-list", className]}
      data-ui-component="tag-list"
      data-size={size}
      role="list"
      aria-label={label}
      tabindex="-1"
    >
      <div data-ui-part="row">
        {#each visible as tag (tag.id)}
          <span
            role="listitem"
            class="ui-tag-list__item"
            style:inline-size={tag.id === tags[0]?.id &&
            fit.firstWidth !== undefined
              ? `${fit.firstWidth}px`
              : undefined}
          >
            <TagChip
              {tag}
              {...tag.id === tags[0]?.id && fit.firstWidth !== undefined
                ? { width: fit.firstWidth }
                : {}}
              onActivate={activate}
            />
          </span>
        {/each}
        {#if hiddenCount}
          <div role="listitem" class="ui-tag-list__overflow-item">
            <Popover.Root
              bind:open
              onOpenChange={(next) => {
                if (next) returnId = undefined;
              }}
            >
              <Popover.Trigger>
                {#snippet child({ props })}
                  <Button
                    {...props}
                    variant="outline"
                    size="sm"
                    class="ui-tag-list__overflow"
                    data-ui-part="overflow"
                    aria-label={`${hiddenCount} more ${label.toLowerCase()}; show all ${tags.length}`}
                  >
                    <span>+{hiddenCount}</span><ChevronDownIcon
                      aria-hidden="true"
                    />
                  </Button>
                {/snippet}
              </Popover.Trigger>
              <Popover.Content
                bind:ref={popup}
                align="end"
                class="ui-tag-list-popup"
                data-tag-list-popup=""
                data-size={size}
                role="dialog"
                style={popupStyle}
                aria-labelledby={titleId}
                onOpenAutoFocus={(event) => {
                  event.preventDefault();
                  void tick().then(() => {
                    (
                      popup?.querySelector<HTMLButtonElement>(
                        'button[data-tag-id]:not([aria-disabled="true"])',
                      ) ?? viewport
                    )?.focus({ preventScroll: true });
                  });
                }}
                onCloseAutoFocus={(event) => {
                  event.preventDefault();
                  void tick().then(() => recoverFocus(returnId));
                }}
              >
                <Popover.Header class="ui-tag-list__header">
                  <Popover.Title id={titleId}
                    >{label} ({tags.length})</Popover.Title
                  >
                  <Popover.Close
                    >{#snippet child({ props })}<Button
                        {...props}
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Close ${label.toLowerCase()}`}
                        ><XIcon aria-hidden="true" /></Button
                      >{/snippet}</Popover.Close
                  >
                </Popover.Header>
                <ScrollArea
                  bind:viewportRef={viewport}
                  class="ui-tag-list__scroll"
                >
                  <div
                    role="list"
                    aria-label={`All ${label.toLowerCase()}`}
                    class="ui-tag-list__all"
                  >
                    {#each tags as tag (tag.id)}<div role="listitem">
                        <TagChip
                          {tag}
                          mode="popup"
                          onActivate={activate}
                        />{#if tag.tooltip}<span
                            class="ui-tag-list__description">{tag.tooltip}</span
                          >{/if}
                      </div>{/each}
                  </div>
                </ScrollArea>
              </Popover.Content>
            </Popover.Root>
          </div>
        {/if}
      </div>
      <div
        bind:this={probes}
        class="ui-tag-list__measurement"
        aria-hidden="true"
        inert
      >
        <div data-ui-part="measurement-tags" class="ui-tag-list__measure-row">
          {#each tags as tag (tag.id)}<TagChip {tag} mode="measure" />{/each}
        </div>
        <div data-ui-part="minimum" class="ui-tag-list__measure-row">
          {#if tags[0]}<TagChip tag={tags[0]} mode="measure" minimum />{/if}
        </div>
        <div class="ui-tag-list__measure-row">
          {#each counts as count (count)}<Button
              disabled
              tabindex={-1}
              variant="outline"
              size="sm"
              class="ui-tag-list__overflow"
              data-measure-count={count}
              >+{count}<ChevronDownIcon aria-hidden="true" /></Button
            >{/each}
        </div>
      </div>
    </div>
  </Tooltip.Provider>
{/if}
