<script lang="ts">
  import type { AppShellController } from "../core/app-shell-controller.svelte.js";
  import { getHotkeyId } from "../core/command-manager.svelte.js";
  import WorkspaceIcon from "../icon/WorkspaceIcon.svelte";

  let { app }: { app: AppShellController } = $props();
  let query = $state("");
  let assignedOnly = $state(false);
  let assignments = $derived(
    app.commands
      .getHotkeyAssignments()
      .filter(
        (assignment) =>
          (!assignedOnly || assignment.hotkeys.length > 0) &&
          `${assignment.command.title} ${assignment.command.category ?? ""}`
            .toLocaleLowerCase()
            .includes(query.trim().toLocaleLowerCase()),
      ),
  );
  let conflicts = $derived(
    new Map(
      app.commands
        .getConflicts()
        .map((conflict) => [getHotkeyId(conflict.hotkey), conflict.commandIds]),
    ),
  );

  function label(modifiers: string[], key: string) {
    return [...modifiers, key.length === 1 ? key.toUpperCase() : key].join(
      " + ",
    );
  }
</script>

<section class="ui-workspace-settings-page">
  <header>
    <h1>Hotkeys</h1>
    <p>Review and customize application command bindings.</p>
  </header>
  <div class="ui-workspace-hotkeys__filters">
    <label>
      <WorkspaceIcon name="search" />
      <input bind:value={query} type="search" placeholder="Search hotkeys" />
    </label>
    <label>
      <input type="checkbox" bind:checked={assignedOnly} />
      Assigned only
    </label>
  </div>
  <div class="ui-workspace-hotkeys__list">
    {#each assignments as assignment (assignment.commandId)}
      <article>
        <div>
          <strong>{assignment.command.title}</strong>
          <span>{assignment.command.category ?? "Commands"}</span>
        </div>
        <div class="ui-workspace-hotkeys__bindings">
          {#each assignment.hotkeys as hotkey (getHotkeyId(hotkey))}
            <span
              data-conflict={conflicts.has(getHotkeyId(hotkey))}
              title={conflicts.has(getHotkeyId(hotkey))
                ? "This binding conflicts with another command"
                : undefined}
            >
              <kbd>{label(hotkey.modifiers, hotkey.key)}</kbd>
              <button
                type="button"
                aria-label={`Remove ${label(hotkey.modifiers, hotkey.key)} from ${assignment.command.title}`}
                onclick={() =>
                  app.commands.removeHotkey(assignment.commandId, hotkey)}
              >
                <WorkspaceIcon name="x" />
              </button>
            </span>
          {:else}
            <em>Unbound</em>
          {/each}
          <button
            type="button"
            class="ui-workspace-hotkeys__reset"
            disabled={!assignment.customized}
            onclick={() => app.commands.resetHotkeys(assignment.commandId)}
          >
            Reset
          </button>
        </div>
      </article>
    {/each}
  </div>
</section>
