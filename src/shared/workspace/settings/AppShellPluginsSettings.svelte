<script lang="ts">
  import { Switch } from "@lapismd/design-core/shadcn/switch";
  import type { AppShellController } from "../core/app-shell-controller.svelte.js";
  import WorkspaceIcon from "../icon/WorkspaceIcon.svelte";
  import { findPluginSettingsSection } from "./plugin-settings-target.js";

  let { app }: { app: AppShellController } = $props();
  let busy = $state<string | null>(null);
  let included = $derived(
    app.managedPlugins.states.filter(
      (plugin) => plugin.distribution === "bundled",
    ),
  );
  let firstParty = $derived(
    app.managedPlugins.states.filter(
      (plugin) => plugin.distribution === "first-party-external",
    ),
  );

  async function toggle(key: string, enabled: boolean) {
    busy = key;
    try {
      if (enabled) await app.managedPlugins.disable(key);
      else await app.managedPlugins.enable(key);
    } finally {
      busy = null;
    }
  }

  function openPluginSettings(pluginId: string) {
    const section = findPluginSettingsSection(app.settings.sections, pluginId);
    if (!section) return;
    app.settings.selectSection(section.id);
  }
</script>

{#snippet pluginList(plugins: typeof app.managedPlugins.states)}
  <div class="ui-workspace-plugins">
    {#each plugins as plugin (plugin.key)}
      {@const settingsSection = findPluginSettingsSection(
        app.settings.sections,
        plugin.id,
      )}
      <article data-settings-plugin-id={plugin.id}>
        <div class="ui-workspace-plugins__icon">
          <WorkspaceIcon name={plugin.icon ?? "puzzle"} />
        </div>
        <div>
          <div class="ui-workspace-plugins__title">
            <strong>{plugin.name}</strong>
            {#if plugin.required}
              <span class="ui-workspace-plugins__badge">Required</span>
            {/if}
          </div>
          {#if plugin.description}<p>{plugin.description}</p>{/if}
          <span data-status={plugin.status}>{plugin.status}</span>
          {#if plugin.error}
            <span class="ui-workspace-plugins__error" role="alert"
              >{String(plugin.error)}</span
            >
          {/if}
        </div>
        <div class="ui-workspace-plugins__actions">
          {#if settingsSection}
            <button
              type="button"
              class="ui-workspace-plugins__settings"
              aria-label={`Open ${plugin.name} settings`}
              title="Options"
              onclick={() => openPluginSettings(plugin.id)}
            >
              <WorkspaceIcon name="settings" />
            </button>
          {/if}
          <Switch
            aria-label={`Enable ${plugin.name}`}
            checked={plugin.enabled}
            disabled={plugin.required || busy === plugin.key}
            onCheckedChange={() => toggle(plugin.key, plugin.enabled)}
          />
        </div>
      </article>
    {/each}
  </div>
{/snippet}

<section class="ui-workspace-settings-page">
  <header>
    <h1>Core plugins</h1>
    <p>Enable or disable the statically registered application extensions.</p>
  </header>
  {#if included.length > 0}
    <section class="ui-workspace-plugins-group">
      <h2>Included plugins</h2>
      {@render pluginList(included)}
    </section>
  {/if}
  {#if firstParty.length > 0}
    <section class="ui-workspace-plugins-group">
      <h2>First-party plugins</h2>
      {@render pluginList(firstParty)}
    </section>
  {/if}
</section>
