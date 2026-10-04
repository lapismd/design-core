<script lang="ts">
  import { onDestroy, untrack } from "svelte";
  import * as ColumnCanvas from "./index.js";
  import { Button } from "../button/index.js";
  import { Input } from "../input/index.js";
  import { ScrollArea } from "../scroll-area/index.js";
  import * as Popover from "../popover/index.js";
  let {
    external = false,
    mixed = false,
    mode = "fixed",
  }: {
    external?: boolean;
    mixed?: boolean;
    mode?: "fixed" | "auto" | "compact";
  } = $props();
  let viewport = $state<HTMLElement | null>(null);
  let enabled = $state(true);
  let direction = $state<"ltr" | "rtl">("ltr");
  let currentMode = $state(untrack(() => mode));
  let draft = $state("");
  let dropped = $state(false);
  let mounted = $state(true);
  const columns = ["primary", "secondary", "detail", "activity"];
  const controller = ColumnCanvas.createColumnCanvasController({
    columns: Object.fromEntries(
      columns.map((id) => [
        id,
        {
          defaultWidth: id === "activity" ? 420 : 240,
          minWidth: 180,
          maxWidth: 420,
          collapsible: true,
          closeable: true,
          resizable: true,
        },
      ]),
    ),
    trailingSpacerWidth: 160,
  });
  onDestroy(() => {
    void controller.dispose();
  });
</script>

<div class="canvas-pinning-demo" data-testid="fixed-host" dir={direction}>
  <div class="canvas-pinning-demo__controls">
    <Button onclick={() => (enabled = !enabled)}>Toggle fixed</Button>
    <Button onclick={() => (direction = direction === "ltr" ? "rtl" : "ltr")}
      >Toggle direction</Button
    >
    <Button
      onclick={() =>
        (currentMode = currentMode === "compact" ? mode : "compact")}
      >Toggle compact</Button
    >
    <Button onclick={() => controller.open("primary")}>Reopen primary</Button>
    <Button onclick={() => (mounted = !mounted)}>Toggle canvas</Button>
  </div>
  <output data-testid="durable-layout" hidden
    >{JSON.stringify(controller.getLayout())}</output
  >
  <div class="canvas-pinning-demo__canvas">
    {#if mounted}
      {#if external}
        <ScrollArea
          style="height: 100%"
          dir={direction}
          orientation="horizontal"
          scrollStrategy="styled"
          fillContent
          bind:viewportRef={viewport}
        >
          {@render canvas()}
        </ScrollArea>
      {:else}
        {@render canvas()}
      {/if}
    {/if}
  </div>
</div>

{#snippet canvas()}
  <ColumnCanvas.Root
    {controller}
    displayMode={currentMode}
    scrollViewport={external ? viewport : null}
    aria-label="Pinned canvas"
    compactBreakpoint={600}
  >
    {#each columns as id, index (id)}
      <ColumnCanvas.Column
        {id}
        title={id}
        fixed={enabled && (index === 0 || (!mixed && index === 1))}
        sticky={index === 0 || (mixed && index === 1)}
        collapsedRail={index === 1 ? secondaryRail : undefined}
        revealOnEdgeHover
      >
        <ColumnCanvas.Body scrollStrategy="styled">
          {#if index === 0}
            <Input aria-label="Retained draft" bind:value={draft} />
            <Popover.Root>
              <Popover.Trigger>Open column menu</Popover.Trigger>
              <Popover.Content><Button>Column action</Button></Popover.Content>
            </Popover.Root>
            <Button
              draggable="true"
              ondragstart={(event) =>
                event.dataTransfer?.setData("text/plain", "fixed-file")}
              >Drag pinned file</Button
            >
          {:else if index === 3}
            <Button
              ondragover={(event) => event.preventDefault()}
              ondrop={(event) => {
                event.preventDefault();
                dropped =
                  event.dataTransfer?.getData("text/plain") === "fixed-file";
              }}>Drop file here</Button
            >
            {#if dropped}<p role="status">Pinned file received</p>{/if}
          {/if}
          {#each Array.from({ length: index === 0 ? 40 : 4 }) as _, row}
            <ColumnCanvas.Item>{id} item {row + 1}</ColumnCanvas.Item>
          {/each}
        </ColumnCanvas.Body>
      </ColumnCanvas.Column>
    {/each}
  </ColumnCanvas.Root>
{/snippet}

{#snippet secondaryRail({
  expand,
}: ColumnCanvas.ColumnCanvasCollapsedRailContext)}
  <Button onclick={expand}>Expand secondary custom</Button>
{/snippet}

<style>
  .canvas-pinning-demo {
    width: 1040px;
    max-width: 100%;
    height: 500px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .canvas-pinning-demo__controls {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .canvas-pinning-demo__canvas {
    min-height: 0;
    flex: 1;
  }
</style>
