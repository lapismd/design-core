<script lang="ts">
  import * as Select from "../../shadcn/select/index.js";
  import { useAppShell } from "./app-shell-context.svelte.js";
  import type { AppShellSide } from "./app-shell-controller.svelte.js";

  let {
    side,
    active,
  }: {
    side: AppShellSide;
    active: boolean;
  } = $props();

  const controller = useAppShell();
  let open = $state(false);
  let panels = $derived(controller.mobile.panelsFor(side));
  let activePanelId = $derived(controller.mobile.activePanelId(side));
  let activeLabel = $derived(
    panels.find((panel) => panel.id === activePanelId)?.label ??
      panels[0]?.label ??
      `${side} panel`,
  );

  $effect(() => {
    if (!active) open = false;
  });
</script>

{#if panels.length > 1}
  <div
    class="ui-minimal-app-shell__mobile-panel-selector"
    data-ui-component="app-shell"
    data-ui-part="mobile-panel-selector"
    data-side={side}
    data-mobile-stage-control
  >
    <Select.Root
      type="single"
      bind:open
      value={activePanelId}
      onValueChange={(value) => {
        if (value) controller.mobile.selectPanel(side, value);
      }}
    >
      <Select.Trigger
        size="sm"
        class="ui-minimal-app-shell__mobile-panel-selector-trigger"
        aria-label={`Choose ${side} sidebar panel`}
      >
        {activeLabel}
      </Select.Trigger>
      <Select.Content aria-label={`${side} sidebar panels`}>
        <Select.Group>
          {#each panels as panel (panel.id)}
            <Select.Item value={panel.id} label={panel.label}>
              {panel.label}
            </Select.Item>
          {/each}
        </Select.Group>
      </Select.Content>
    </Select.Root>
  </div>
{/if}
