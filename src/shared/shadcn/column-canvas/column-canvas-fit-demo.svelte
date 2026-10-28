<script lang="ts">
  import { onDestroy, untrack } from "svelte";
  import * as ColumnCanvas from "./index.js";
  let {
    scenario = "grow",
  }: {
    scenario?:
      | "grow"
      | "cap"
      | "short"
      | "bounded"
      | "pair"
      | "controlled"
      | "ellipsis";
  } = $props();
  const initial = 320;
  let controlledWidth = $state(initial);
  let changes = $state(0);
  const controller = ColumnCanvas.createColumnCanvasController({
    columns: {
      measured: {
        defaultWidth: initial,
        minWidth: 240,
        maxWidth: untrack(() => (scenario === "bounded" ? 480 : 1100)),
        resizable: true,
      },
      neighbour: {
        defaultWidth: 320,
        minWidth: 240,
        maxWidth: 1100,
        resizable: true,
      },
    },
    trailingSpacerWidth: 160,
  });
  onDestroy(() => void controller.dispose());
  const contentWidth = $derived(
    scenario === "cap" || scenario === "bounded"
      ? 2000
      : scenario === "short"
        ? 160
        : scenario === "pair"
          ? 900
          : 520,
  );
</script>

<div style="width:1100px;max-width:100%;height:420px" data-testid="fit-host">
  <ColumnCanvas.Root
    {controller}
    displayMode={scenario === "pair" ? "auto" : "fixed"}
    aria-label="Fit contents canvas"
  >
    <ColumnCanvas.Column
      id="measured"
      title="Measured"
      width={scenario === "controlled" ? controlledWidth : undefined}
      onWidthChange={scenario === "controlled"
        ? (value) => {
            controlledWidth = value;
            changes++;
          }
        : undefined}
    >
      <ColumnCanvas.Body orientation="both">
        {#if scenario === "ellipsis"}<div class="fit-row">
            <span class="fit-label"
              >feature/a-long-recorded-branch-name-with-portable-controller-context</span
            ><span>Local</span>
          </div>
        {:else}<div style:width={`${contentWidth}px`} data-testid="fit-content">
            Recorded content that retains its existing width.
          </div>{/if}
        <input
          aria-label="Retained draft"
          value="Keep this draft"
          style="width:160px"
        />
      </ColumnCanvas.Body>
    </ColumnCanvas.Column>
    {#if scenario === "pair"}<ColumnCanvas.Column
        id="neighbour"
        title="Neighbour"
        ><ColumnCanvas.Body>Another column</ColumnCanvas.Body
        ></ColumnCanvas.Column
      >{/if}
  </ColumnCanvas.Root>
  <output hidden data-testid="fit-events" data-count={changes}></output>
</div>

<style>
  .fit-row {
    display: flex;
    gap: 12px;
    padding: 12px;
  }
  .fit-label {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
