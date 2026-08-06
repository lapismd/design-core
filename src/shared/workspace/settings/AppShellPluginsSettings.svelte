<script lang="ts">
  import { Switch } from "@lapismd/design-core/shadcn/switch";
  import type { AppShellController } from "../core/app-shell-controller.svelte.js";
  import WorkspaceIcon from "../icon/WorkspaceIcon.svelte";

  let { app }: { app: AppShellController } = $props();
  let busy = $state<string | null>(null);

  async function toggle(id: string, enabled: boolean) {
    busy = id;
    try {
      if (enabled) await app.plugins.disable(id);
      else await app.plugins.enable(id);
    } finally {
      busy = null;
    }
  }
</script>

<section class="ui-workspace-settings-page">
  <header>
    <h1>Core plugins</h1>
    <p>Enable or disable the statically registered application extensions.</p>
  </header>
  <div class="ui-workspace-plugins">
    {#each app.plugins.states as plugin (plugin.id)}
      <article>
        <div class="ui-workspace-plugins__icon">
          <WorkspaceIcon name={plugin.icon ?? "puzzle"} />
        </div>
        <div>
          <strong>{plugin.name}</strong>
          {#if plugin.description}<p>{plugin.description}</p>{/if}
          <span data-status={plugin.status}>{plugin.status}</span>
          {#if plugin.error}<span role="alert">{String(plugin.error)}</span
            >{/if}
        </div>
        <Switch
          aria-label={`Enable ${plugin.name}`}
          checked={plugin.enabled}
          disabled={plugin.required || busy === plugin.id}
          onCheckedChange={() => toggle(plugin.id, plugin.enabled)}
        />
      </article>
    {/each}
  </div>
</section>
