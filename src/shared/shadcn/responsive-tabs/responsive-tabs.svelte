<script lang="ts">
  import { onMount, untrack } from "svelte";
  import { Button } from "../button/index.js";
  import * as Tabs from "../tabs/index.js";
  import * as DropdownMenu from "../dropdown-menu/index.js";
  import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
  import type { ResponsiveTabsProps } from "./responsive-tabs.types.js";
  import "./responsive-tabs.css";
  let {
    value = $bindable(""),
    items,
    onValueChange,
    label = "Sections",
    disabled = false,
    leading,
    trailing,
    inheritContext = false,
    presentation = "pill",
    ...restProps
  }: ResponsiveTabsProps = $props();
  let space = $state<HTMLDivElement | null>(null);
  let probes = $state<HTMLDivElement | null>(null);
  let more = $state<HTMLButtonElement | null>(null);
  let mounted = $state(false);
  let count = $state(untrack(() => items.length));
  const visible = $derived(items.slice(0, count));
  const overflow = $derived(items.slice(count));
  const overflowActive = $derived(
    overflow.some((item) => item.value === value),
  );
  function select(next: string | undefined): void {
    if (
      !disabled &&
      next !== value &&
      items.some((item) => item.value === next && !item.disabled)
    ) {
      value = next!;
      onValueChange?.(next!);
    }
  }
  $effect(() => {
    const area = space,
      probe = probes,
      button = more;
    items;
    presentation;
    if (!mounted || !area || !probe || !button) return;
    let frame: number | undefined;
    const fit = () => {
      frame = undefined;
      const widths = [
        ...probe.querySelectorAll<HTMLElement>('[data-slot="tabs-trigger"]'),
      ].map((tab) => tab.getBoundingClientRect().width);
      if (widths.length !== items.length) return;
      const gap = parseFloat(getComputedStyle(area).gap) || 0;
      if (
        widths.reduce((sum, width) => sum + width, 0) +
          gap * Math.max(0, widths.length - 1) <=
        area.clientWidth + 1
      ) {
        count = items.length;
        return;
      }
      const available =
        area.clientWidth - button.getBoundingClientRect().width - gap;
      let used = 0,
        fitting = 0;
      for (const width of widths) {
        const next = used + width + (fitting ? gap : 0);
        if (next > available + 1) break;
        used = next;
        fitting++;
      }
      count = fitting;
    };
    const schedule = () => {
      frame ??= requestAnimationFrame(fit);
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(area);
    observer.observe(probe);
    observer.observe(button);
    schedule();
    return () => {
      observer.disconnect();
      if (frame !== undefined) cancelAnimationFrame(frame);
    };
  });
  onMount(() => {
    mounted = true;
  });
</script>

{#snippet controls()}
  <div data-ui-part="measurement" aria-hidden="true" inert>
    <Tabs.Root {value}>
      <Tabs.List
        bind:ref={probes}
        variant={presentation === "line" ? "line" : "default"}
      >
        {#each items as item (item.value)}
          <Tabs.Trigger value={item.value} disabled
            >{#if item.Icon}<item.Icon
                aria-hidden="true"
              />{/if}{item.label}</Tabs.Trigger
          >
        {/each}
      </Tabs.List>
      <Button bind:ref={more} variant="ghost" size="sm" disabled
        >More<ChevronDownIcon aria-hidden="true" /></Button
      >
    </Tabs.Root>
  </div>
  {@render leading?.()}
  <div data-ui-part="space" bind:this={space}>
    <Tabs.List
      aria-label={label}
      data-empty={count === 0}
      variant={presentation === "line" ? "line" : "default"}
    >
      {#each visible as item (item.value)}
        <Tabs.Trigger
          value={item.value}
          disabled={disabled || !!item.disabled}
          title={item.label}
          >{#if item.Icon}<item.Icon
              aria-hidden="true"
            />{/if}{item.label}</Tabs.Trigger
        >
      {/each}
    </Tabs.List>
    {#if overflow.length}
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          {#snippet child({ props })}
            <Button
              {...props}
              variant="ghost"
              size="sm"
              {disabled}
              aria-label={`More ${label.toLowerCase()}`}
              aria-current={overflowActive ? "page" : undefined}
              data-selected={overflowActive || undefined}
              >More<ChevronDownIcon aria-hidden="true" /></Button
            >
          {/snippet}
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="start" preventScroll={false}>
          <DropdownMenu.Group>
            {#each overflow as item (item.value)}
              <DropdownMenu.Item
                disabled={disabled || !!item.disabled}
                aria-current={value === item.value ? "page" : undefined}
                onSelect={() => select(item.value)}
                >{#if item.Icon}<item.Icon
                    aria-hidden="true"
                  />{/if}{item.label}</DropdownMenu.Item
              >
            {/each}
          </DropdownMenu.Group>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    {/if}
  </div>
  {@render trailing?.()}
{/snippet}
<div
  {...restProps}
  data-ui-component="responsive-tabs"
  data-presentation={presentation}
>
  {#if inheritContext}<div data-ui-part="controls">{@render controls()}</div>
  {:else}<Tabs.Root {value} onValueChange={select}
      >{@render controls()}</Tabs.Root
    >{/if}
</div>
