<script lang="ts">
  import { Button } from "@lapismd/design-core/shadcn/button";
  import * as DropdownMenu from "@lapismd/design-core/shadcn/dropdown-menu";
  import type { WorkspaceMenu } from "../core/workspace-menu.js";
  import WorkspaceIcon from "../icon/WorkspaceIcon.svelte";

  let { menu }: { menu: WorkspaceMenu } = $props();

  function stopRowActivation(event: Event) {
    event.stopPropagation();
  }

  function invokeHandler(handler: unknown, event: Event): void {
    if (typeof handler === "function") {
      (handler as (event: Event) => void)(event);
    }
  }
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger>
    {#snippet child({ props })}
      <Button
        {...props}
        variant="ghost"
        size="icon-xs"
        class="ui-workspace-problems__quick-fix"
        aria-label="Quick fix"
        title="Quick fix"
        onclick={(event) => {
          stopRowActivation(event);
          invokeHandler(props.onclick, event);
        }}
        onpointerdown={(event) => {
          stopRowActivation(event);
          invokeHandler(props.onpointerdown, event);
        }}
        onkeydown={(event) => {
          stopRowActivation(event);
          invokeHandler(props.onkeydown, event);
        }}
      >
        <WorkspaceIcon name="wand-sparkles" />
      </Button>
    {/snippet}
  </DropdownMenu.Trigger>
  <DropdownMenu.Content
    class="ui-workspace-problems__quick-fix-menu"
    align="end"
    onpointerdown={stopRowActivation}
  >
    {#each menu.entries as entry, index (`${entry.kind}-${index}`)}
      {#if entry.kind === "item"}
        <DropdownMenu.Item
          disabled={entry.disabled}
          onclick={(event) => {
            stopRowActivation(event);
            void entry.callback?.(event);
          }}
        >
          {#if entry.icon}<WorkspaceIcon name={entry.icon} />{/if}
          <span>{entry.title}</span>
        </DropdownMenu.Item>
      {/if}
    {/each}
  </DropdownMenu.Content>
</DropdownMenu.Root>
