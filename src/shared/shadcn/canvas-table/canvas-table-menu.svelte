<script lang="ts">
  import * as ContextMenu from "../context-menu/index.js";
  import Glyph from "./canvas-table-glyph.svelte";
  import { applyCommand, tableCommands } from "./canvas-table-commands.js";
  import type { TableContext } from "./canvas-table-context.js";
  import type { Snippet } from "svelte";

  let { ctx, children }: { ctx: TableContext; children: Snippet } = $props();
  const commands = $derived(tableCommands(ctx));
</script>

<ContextMenu.Root>
  <ContextMenu.Trigger class="canvas-table__menu-trigger"
    >{@render children()}</ContextMenu.Trigger
  >
  {#if ctx.props().onCommand && ctx.state.active}
    <ContextMenu.Content>
      <ContextMenu.Group>
        {#each commands as command (command.id)}
          <ContextMenu.Item
            disabled={command.disabled}
            onSelect={() => applyCommand(ctx, command.id)}
          >
            <Glyph command={command.id} />{command.label}
          </ContextMenu.Item>
        {/each}
      </ContextMenu.Group>
    </ContextMenu.Content>
  {/if}
</ContextMenu.Root>
