<script lang="ts">
  import type { WorkspaceSide } from "../core/types.js";
  import type { WorkspaceShellController } from "../core/workspace-controller.svelte.js";
  import WorkspaceIcon from "../icon/WorkspaceIcon.svelte";
  import "./WorkspaceRibbon.css";

  let {
    controller,
    side = "left",
  }: {
    controller: WorkspaceShellController;
    side?: WorkspaceSide;
  } = $props();

  let items = $derived(
    controller.ribbon.items.filter((item) => (item.side ?? "left") === side),
  );
  let topItems = $derived(
    items.filter((item) => (item.section ?? "top") === "top"),
  );
  let bottomItems = $derived(items.filter((item) => item.section === "bottom"));
</script>

<aside
  class="ui-workspace-ribbon"
  data-ui-component="workspace-ribbon"
  data-ui-part="root"
  data-side={side}
  data-workspace-ribbon={side}
  aria-label={`${side} ribbon`}
>
  <nav
    class="ui-workspace-ribbon__actions"
    data-ui-part="top-actions"
    aria-label={`${side} ribbon primary actions`}
  >
    {#each topItems as item (item.id)}
      <button
        type="button"
        class="ui-workspace-ribbon__action"
        data-ui-part="action"
        data-active={item.active}
        aria-pressed={item.active}
        aria-disabled={item.disabled}
        aria-label={item.label}
        title={item.label}
        data-hint-target="ribbon-action"
        data-hint-group="ribbon"
        data-hint-action="click"
        data-hint-target-id={`ribbon:${item.id}`}
        data-hint-label={item.label}
        onclick={(event) => {
          if (!item.disabled) item.onSelect(event);
        }}
      >
        <WorkspaceIcon name={item.icon} />
      </button>
    {/each}
  </nav>

  <nav
    class="ui-workspace-ribbon__actions ui-workspace-ribbon__actions--bottom"
    data-ui-part="bottom-actions"
    aria-label={`${side} ribbon secondary actions`}
  >
    {#each bottomItems as item (item.id)}
      <button
        type="button"
        class="ui-workspace-ribbon__action"
        data-ui-part="action"
        data-active={item.active}
        aria-pressed={item.active}
        aria-disabled={item.disabled}
        aria-label={item.label}
        title={item.label}
        data-hint-target="ribbon-action"
        data-hint-group="ribbon"
        data-hint-action="click"
        data-hint-target-id={`ribbon:${item.id}`}
        data-hint-label={item.label}
        onclick={(event) => {
          if (!item.disabled) item.onSelect(event);
        }}
      >
        <WorkspaceIcon name={item.icon} />
      </button>
    {/each}
  </nav>
</aside>
