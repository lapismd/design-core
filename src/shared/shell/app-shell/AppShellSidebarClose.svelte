<script lang="ts">
  import XIcon from "@lucide/svelte/icons/x";
  import { flushSync } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";
  import { Button } from "../../shadcn/button/index.js";
  import { useAppShell } from "./app-shell-context.svelte.js";
  import {
    APP_SHELL_SIDEBAR_LAYOUT_SYNC_EVENT,
    useAppShellSidebar,
  } from "./app-shell-sidebar-context.svelte.js";

  let {
    ref = $bindable(null),
    label,
    class: className,
    onclick,
    ...restProps
  }: HTMLButtonAttributes & {
    ref?: HTMLButtonElement | null;
    /** Accessible close action name. Defaults from the containing sidebar. */
    label?: string;
  } = $props();

  const controller = useAppShell();
  const context = useAppShellSidebar();
  const sidebar = context.controller;
  let accessibleLabel = $derived(label ?? `Close ${context.side} sidebar`);

  function isDesktopOverlayOnly(element?: Element | null): boolean {
    const panelId = controller.getPanelId(sidebar);
    if (!panelId) return false;
    return (
      (element ?? ref)
        ?.closest("[data-shell-root]")
        ?.getAttribute("data-desktop-overlay-panels")
        ?.split(/\s+/)
        .includes(panelId) ?? false
    );
  }

  function dismissDesktopDomPreview(element: Element): void {
    const sidebarElement = element.closest<HTMLElement>(
      '[data-ui-part="sidebar"][data-mobile-panel-id]',
    );
    const panelId = sidebarElement?.dataset.mobilePanelId;
    const shellRoot = element.closest<HTMLElement>("[data-shell-root]");
    const toggle =
      panelId && shellRoot
        ? shellRoot.querySelector<HTMLButtonElement>(
            `[data-ui-part="sidebar-toggle"][data-target-panel-id="${CSS.escape(panelId)}"]`,
          )
        : null;
    if (toggle) {
      toggle.click();
      toggle.focus({ preventScroll: true });
    } else {
      sidebarElement?.removeAttribute("data-desktop-overlay-preview");
    }
  }
</script>

{#if context.closeable}
  <Button
    bind:ref
    {...restProps}
    variant="ghost"
    size="icon-sm"
    class={["ui-minimal-app-shell__sidebar-close", className]
      .filter(Boolean)
      .join(" ")}
    data-ui-part="sidebar-close"
    data-side={context.side}
    aria-label={accessibleLabel}
    title={accessibleLabel}
    onclick={(event) => {
      if (controller.mobile.resolvedMode === "mobile") {
        controller.mobile.showMain();
      } else if (isDesktopOverlayOnly(event.currentTarget)) {
        dismissDesktopDomPreview(event.currentTarget);
      } else {
        const sidebarElement = event.currentTarget.closest<HTMLElement>(
          '[data-ui-part="sidebar"][data-mobile-panel-id]',
        );
        const panelId = sidebarElement?.dataset.mobilePanelId;
        const targetSidebar = panelId ? controller.getPanel(panelId) : sidebar;
        flushSync(() => {
          targetSidebar?.close();
          sidebarElement?.dispatchEvent(
            new Event(APP_SHELL_SIDEBAR_LAYOUT_SYNC_EVENT),
          );
        });
        sidebarElement?.remove();
        context.dismissOverlay();
      }
      onclick?.(event);
    }}
  >
    <XIcon aria-hidden="true" />
  </Button>
{/if}
