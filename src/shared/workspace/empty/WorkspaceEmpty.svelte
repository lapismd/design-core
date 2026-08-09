<script lang="ts">
  import { Button } from "@lapismd/design-core/shadcn/button";
  import * as Empty from "@lapismd/design-core/shadcn/empty";
  import type { WorkspaceAction } from "../core/types.js";
  import WorkspaceIcon from "../icon/WorkspaceIcon.svelte";
  import "./WorkspaceEmpty.css";

  let {
    missingViewType = null,
    actions = [],
    links = [],
    surface = "panel",
  }: {
    /** Missing serializable view type, or `null` for an ordinary empty leaf. */
    missingViewType?: string | null;
    /** Primary actions. The first action receives primary emphasis. */
    actions?: WorkspaceAction[];
    /** Compact tertiary actions rendered beneath the primary actions. */
    links?: WorkspaceAction[];
    /** Background surface for the empty state host. */
    surface?: "page" | "panel";
  } = $props();
</script>

<div
  class="ui-workspace-empty"
  data-ui-component="workspace-empty"
  data-ui-part="root"
  data-workspace-missing-view={missingViewType ?? undefined}
  data-workspace-surface={surface}
>
  <Empty.Root class="ui-workspace-empty__body">
    <Empty.Header>
      <Empty.Media variant="icon">
        <WorkspaceIcon name={missingViewType ? "unplug" : "file-plus"} />
      </Empty.Media>

      <Empty.Title role="heading" aria-level={2}>
        {missingViewType ? "Plugin no longer active" : "No file is open"}
      </Empty.Title>

      <Empty.Description>
        {#if missingViewType}
          The plugin that created this view ({missingViewType}) has gone away.
        {:else}
          Create a tab or open the command palette to get started.
        {/if}
      </Empty.Description>
    </Empty.Header>

    {#if actions.length > 0}
      <Empty.Content>
        <div class="ui-workspace-empty__actions" data-ui-part="actions">
          {#each actions as action, index (action.id)}
            <Button
              variant={index === 0 ? "default" : "outline"}
              disabled={action.disabled}
              onclick={(event) => action.onSelect(event)}
            >
              {#if action.icon}
                <WorkspaceIcon name={action.icon} data-icon="inline-start" />
              {/if}
              {action.label}
            </Button>
          {/each}
        </div>
      </Empty.Content>
    {/if}

    {#if links.length > 0}
      <div class="ui-workspace-empty__links" data-ui-part="links">
        {#each links as action (action.id)}
          <Button
            variant="link"
            size="sm"
            disabled={action.disabled}
            onclick={(event) => action.onSelect(event)}
          >
            {#if action.icon}
              <WorkspaceIcon name={action.icon} data-icon="inline-start" />
            {/if}
            {action.label}
          </Button>
        {/each}
      </div>
    {/if}
  </Empty.Root>
</div>
