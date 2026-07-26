<script lang="ts">
  import { tick } from "svelte";
  import WorkspaceIcon from "../icon/WorkspaceIcon.svelte";
  import WorkspaceSettingsSurface from "../settings/WorkspaceSettingsSurface.svelte";
  import { getAppShellContext } from "./app-shell-context.svelte.js";
  import "./AppShellSettingsDialog.css";

  let {
    open = $bindable(false),
    title = "Settings",
    onOpenChange,
  }: {
    open?: boolean;
    title?: string;
    onOpenChange?: (open: boolean) => void;
  } = $props();

  const { controller } = getAppShellContext();
  let overlay = $state<HTMLDivElement | null>(null);
  let dialog = $state<HTMLDivElement | null>(null);
  let restoreFocus = $state<HTMLElement | null>(null);

  function setOpen(next: boolean) {
    open = next;
    onOpenChange?.(next);
    if (!next) {
      void tick().then(() => restoreFocus?.focus());
    }
  }

  $effect(() => {
    if (!open) return;
    restoreFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    void tick().then(() => dialog?.focus());
  });

  $effect(() => {
    if (!open || !overlay?.parentElement) return;
    const background = [...overlay.parentElement.children].filter(
      (element): element is HTMLElement =>
        element instanceof HTMLElement && element !== overlay,
    );
    const previous = background.map((element) => ({
      element,
      inert: element.inert,
      ariaHidden: element.getAttribute("aria-hidden"),
    }));
    for (const element of background) {
      element.inert = true;
      element.setAttribute("aria-hidden", "true");
    }
    return () => {
      for (const state of previous) {
        state.element.inert = state.inert;
        if (state.ariaHidden === null) {
          state.element.removeAttribute("aria-hidden");
        } else {
          state.element.setAttribute("aria-hidden", state.ariaHidden);
        }
      }
    };
  });
</script>

{#if open}
  <div
    bind:this={overlay}
    class="ui-app-shell-settings-dialog"
    data-ui-component="app-shell-settings-dialog"
    data-ui-part="overlay"
    role="presentation"
    onclick={(event) => {
      if (event.currentTarget === event.target) setOpen(false);
    }}
  >
    <div
      bind:this={dialog}
      class="ui-app-shell-settings-dialog__content"
      data-ui-part="dialog"
      role="dialog"
      tabindex="-1"
      aria-modal="true"
      aria-labelledby="ui-app-shell-settings-title"
      onkeydown={(event) => {
        if (event.key === "Escape") setOpen(false);
      }}
    >
      <header class="ui-app-shell-settings-dialog__header">
        <h2 id="ui-app-shell-settings-title">{title}</h2>
        <p>Customize your settings here</p>
      </header>
      <button
        type="button"
        class="ui-app-shell-settings-dialog__close"
        aria-label="Close settings"
        title="Close settings"
        onclick={() => setOpen(false)}
      >
        <WorkspaceIcon name="x" />
      </button>
      <WorkspaceSettingsSurface
        controller={controller.settings}
        app={controller}
      />
    </div>
  </div>
{/if}
