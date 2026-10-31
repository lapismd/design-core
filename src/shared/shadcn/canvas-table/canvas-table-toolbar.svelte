<script lang="ts">
  import { Button } from "../button/index.js";
  import { Toggle } from "../toggle/index.js";
  import * as Tooltip from "../tooltip/index.js";
  import Glyph from "./canvas-table-glyph.svelte";
  import { applyCommand, tableCommands } from "./canvas-table-commands.js";
  import type { TableContext } from "./canvas-table-context.js";
  import type { TableNavigation } from "./canvas-table-navigation.js";

  let { ctx, nav }: { ctx: TableContext; nav: TableNavigation } = $props();
  const config = $derived(ctx.props());
  const commands = $derived(tableCommands(ctx));
  const reference = $derived(nav.reference());
  const selected = $derived(
    (config.selectedRowIds ?? []).filter(
      (id) =>
        ctx.layout().byId.has(id) &&
        (!ctx.layout().headerRow || id !== config.rows[0]?.id),
    ),
  );
  let draft = $state<string | null>(null);
  function commitAddress() {
    if (draft == null) return;
    nav.address(draft);
    draft = null;
    ctx.state.scroller?.focus();
  }
</script>

<div class="canvas-table__toolbar" role="toolbar" aria-label="Sheet">
  <input
    class="canvas-table__address"
    aria-label="Cell address"
    value={draft ?? reference}
    spellcheck="false"
    onfocus={(event) => event.currentTarget.select()}
    oninput={(event) => {
      draft = event.currentTarget.value;
    }}
    onkeydown={(event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        commitAddress();
      } else if (event.key === "Escape") {
        draft = null;
        ctx.state.scroller?.focus();
      }
    }}
    onblur={commitAddress}
  />
  <Tooltip.Provider delayDuration={300}>
    {#each ["undo", "redo"] as action}
      <Tooltip.Root>
        <Tooltip.Trigger>
          {#snippet child({ props: trigger })}
            <Button
              {...trigger}
              variant="ghost"
              size="icon-sm"
              aria-label={action === "undo" ? "Undo" : "Redo"}
              disabled={action === "undo"
                ? !config.canUndo || !config.onUndo
                : !config.canRedo || !config.onRedo}
              onclick={() => {
                nav.commitEdit();
                if (action === "undo") config.onUndo?.();
                else config.onRedo?.();
              }}
            >
              <Glyph command={action === "undo" ? "undo" : "redo"} />
            </Button>
          {/snippet}
        </Tooltip.Trigger>
        <Tooltip.Content side="bottom"
          >{action === "undo" ? "Undo" : "Redo"}</Tooltip.Content
        >
      </Tooltip.Root>
    {/each}
    {#each commands as command (command.id)}
      <Tooltip.Root>
        <Tooltip.Trigger>
          {#snippet child({ props: trigger })}
            <Button
              {...trigger}
              variant="ghost"
              size="icon-sm"
              aria-label={command.label}
              disabled={command.disabled}
              onclick={() => {
                nav.commitEdit();
                applyCommand(ctx, command.id);
              }}
            >
              <Glyph command={command.id} />
            </Button>
          {/snippet}
        </Tooltip.Trigger>
        <Tooltip.Content side="bottom">{command.label}</Tooltip.Content>
      </Tooltip.Root>
    {/each}
    {#each [{ id: "wrap", label: "Wrap text" }, { id: "colours", label: "Column colours" }, { id: "header", label: "Header row" }] as action}
      <Tooltip.Root>
        <Tooltip.Trigger>
          {#snippet child({ props: trigger })}
            <Toggle
              {...trigger}
              size="sm"
              variant="outline"
              aria-label={action.label}
              disabled={action.id === "header" && !config.onHeaderRowChange}
              pressed={action.id === "wrap"
                ? ctx.state.wrap
                : action.id === "colours"
                  ? ctx.state.colours
                  : ctx.layout().headerRow}
              onPressedChange={(value) => {
                nav.commitEdit();
                if (action.id === "wrap") ctx.state.wrap = value;
                else if (action.id === "colours") ctx.state.colours = value;
                else config.onHeaderRowChange?.(value);
              }}
            >
              <Glyph
                command={action.id === "wrap"
                  ? "wrap"
                  : action.id === "colours"
                    ? "colours"
                    : "header"}
              />
            </Toggle>
          {/snippet}
        </Tooltip.Trigger>
        <Tooltip.Content side="bottom">{action.label}</Tooltip.Content>
      </Tooltip.Root>
    {/each}
  </Tooltip.Provider>
  {#if config.rowSelection && config.selectionActions}
    <div class="canvas-table__selection-actions">
      {@render config.selectionActions(selected)}
    </div>
  {/if}
</div>
