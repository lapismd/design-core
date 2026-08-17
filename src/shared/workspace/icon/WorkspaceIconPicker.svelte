<script lang="ts">
  import { tick } from "svelte";
  import { Button } from "@lapismd/design-core/shadcn/button";
  import * as CommandView from "@lapismd/design-core/shadcn/command-view";
  import * as Popover from "@lapismd/design-core/shadcn/popover";
  import { filterWorkspaceIconNames } from "./icons.js";
  import WorkspaceIcon from "./WorkspaceIcon.svelte";
  import "./WorkspaceIconPicker.css";

  const ROW_HEIGHT = 40;
  const OVERSCAN = 6;
  const VIEWPORT_HEIGHT = 280;

  let {
    id,
    value = "",
    disabled = false,
    placeholder = "Select an icon",
    ariaLabel,
    onValueChange,
  }: {
    id?: string;
    value?: string;
    disabled?: boolean;
    placeholder?: string;
    ariaLabel?: string;
    onValueChange?: (value: string) => void;
  } = $props();

  let open = $state(false);
  let query = $state("");
  let scrollTop = $state(0);
  let trigger = $state<HTMLButtonElement | null>(null);
  let listHost = $state<HTMLElement | null>(null);

  let names = $derived(filterWorkspaceIconNames(query));
  let selected = $derived(value.trim());
  let visible = $derived.by(() => {
    const start = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
    const end = Math.min(
      names.length,
      Math.ceil((scrollTop + VIEWPORT_HEIGHT) / ROW_HEIGHT) + OVERSCAN,
    );
    return { start, end };
  });

  $effect(() => {
    if (!open) return;
    const viewport = listHost?.querySelector<HTMLElement>(
      '[data-ui-part="scroll-area-viewport"]',
    );
    if (!viewport) return;
    const onScroll = () => {
      scrollTop = viewport.scrollTop;
    };
    viewport.addEventListener("scroll", onScroll, { passive: true });
    return () => viewport.removeEventListener("scroll", onScroll);
  });

  function select(name: string) {
    onValueChange?.(name);
    open = false;
    query = "";
    scrollTop = 0;
    void tick().then(() => trigger?.focus());
  }
</script>

<div
  class="ui-workspace-icon-picker"
  data-ui-component="workspace-icon-picker"
  data-ui-part="root"
>
  <Popover.Root
    {open}
    onOpenChange={(next) => {
      open = next;
      if (next) {
        query = "";
        scrollTop = 0;
      }
    }}
  >
    <Popover.Trigger>
      {#snippet child({ props })}
        <Button
          {...props}
          bind:ref={trigger}
          {id}
          {disabled}
          variant="outline"
          size="sm"
          role="combobox"
          aria-expanded={open}
          aria-label={ariaLabel}
          dataUiComponent="workspace-icon-picker"
          data-ui-part="trigger"
        >
          <span data-ui-part="trigger-label">
            {#if selected}
              <WorkspaceIcon name={selected} />
              <span data-ui-part="trigger-name">{selected}</span>
            {:else}
              <span data-ui-part="trigger-placeholder">{placeholder}</span>
            {/if}
          </span>
          <span data-ui-part="chevron">
            <WorkspaceIcon name="chevrons-up-down" />
          </span>
        </Button>
      {/snippet}
    </Popover.Trigger>
    <Popover.Content
      align="start"
      style="--ui-popover-width: 22rem; --ui-popover-padding: 0; --ui-popover-gap: 0"
    >
      <div data-ui-component="workspace-icon-picker" data-ui-part="content">
        <CommandView.Root shouldFilter={false} label={ariaLabel ?? placeholder}>
          <CommandView.Input
            bind:value={query}
            placeholder="Search icon..."
            autocomplete="off"
            spellcheck="false"
            oninput={() => {
              scrollTop = 0;
              const viewport = listHost?.querySelector<HTMLElement>(
                '[data-ui-part="scroll-area-viewport"]',
              );
              if (viewport) viewport.scrollTop = 0;
            }}
          >
            {#snippet start()}
              <WorkspaceIcon name="search" />
            {/snippet}
          </CommandView.Input>
          <div bind:this={listHost}>
            <CommandView.List aria-label="Workspace icons">
              <CommandView.Empty>No icons found.</CommandView.Empty>
              {#if names.length > 0}
                <CommandView.Group heading="Icons">
                  <div
                    data-ui-component="workspace-icon-picker"
                    data-ui-part="virtual-root"
                    style:height={`${names.length * ROW_HEIGHT}px`}
                  >
                    {#each names.slice(visible.start, visible.end) as name, offset (name)}
                      {@const index = visible.start + offset}
                      <CommandView.Item
                        value={name}
                        style={`position:absolute;inset-inline:0;top:0;height:${ROW_HEIGHT}px;transform:translateY(${index * ROW_HEIGHT}px)`}
                        onSelect={() => select(name)}
                      >
                        <CommandView.ItemIcon>
                          <WorkspaceIcon {name} />
                        </CommandView.ItemIcon>
                        <CommandView.ItemLabel>{name}</CommandView.ItemLabel>
                      </CommandView.Item>
                    {/each}
                  </div>
                </CommandView.Group>
              {/if}
            </CommandView.List>
          </div>
        </CommandView.Root>
      </div>
    </Popover.Content>
  </Popover.Root>
</div>
