<script lang="ts">
  import PanelLeftCloseIcon from "@lucide/svelte/icons/panel-left-close";
  import PanelLeftOpenIcon from "@lucide/svelte/icons/panel-left-open";
  import PanelRightCloseIcon from "@lucide/svelte/icons/panel-right-close";
  import PanelRightOpenIcon from "@lucide/svelte/icons/panel-right-open";
  import type { HTMLButtonAttributes } from "svelte/elements";
  import { Button } from "../../shadcn/button/index.js";
  import { useAppShellBody } from "./app-shell-body-context.svelte.js";
  import { useAppShell } from "./app-shell-context.svelte.js";
  import type { AppShellSide } from "./app-shell-controller.svelte.js";

  let {
    ref = $bindable(null),
    side,
    target,
    pressed,
    label,
    class: className,
    onclick,
    ...restProps
  }: HTMLButtonAttributes & {
    ref?: HTMLButtonElement | null;
    /** Body corner occupied by this consumer-controlled sidebar action. */
    side: AppShellSide;
    /** Registered body panel id controlled by this action. */
    target?: string;
    /** Whether the corresponding body sidebar is currently mounted. */
    pressed?: boolean;
    /** Accessible action name. Defaults from `side` and `pressed`. */
    label?: string;
  } = $props();

  const controller = useAppShell();
  const body = useAppShellBody();

  if (body.layout !== "regions") {
    throw new Error(
      'AppShell.Body.Toggle requires AppShell.Body layout="regions"',
    );
  }

  let resolvedTarget = $derived(
    target ?? body.panels.find((panel) => panel.side === side)?.id,
  );
  let targetPanel = $derived(
    resolvedTarget ? body.getPanel(resolvedTarget) : undefined,
  );
  let mobilePressed = $derived(
    controller.mobile.resolvedMode === "mobile" &&
      controller.mobile.stage === side &&
      controller.mobile.activePanelId(side) === resolvedTarget,
  );
  let effectivePressed = $derived(
    controller.mobile.resolvedMode === "mobile"
      ? mobilePressed
      : (targetPanel?.open ?? pressed ?? false),
  );
  let accessibleLabel = $derived(
    label ?? `${effectivePressed ? "Hide" : "Show"} ${side} body sidebar`,
  );
</script>

<Button
  bind:ref
  {...restProps}
  variant="ghost"
  size="icon-sm"
  class={["ui-minimal-app-shell__body-toggle", className]
    .filter(Boolean)
    .join(" ")}
  data-ui-part="body-toggle"
  data-side={side}
  aria-label={accessibleLabel}
  aria-pressed={effectivePressed}
  title={accessibleLabel}
  onclick={(event) => {
    if (controller.mobile.resolvedMode === "mobile") {
      if (mobilePressed) {
        controller.mobile.showMain();
        onclick?.(event);
      } else {
        onclick?.(event);
        queueMicrotask(() => {
          const mobilePanel = controller.mobile.panels.find(
            (panel) => panel.id === resolvedTarget,
          );
          controller.mobile.show(
            mobilePanel?.side ?? side,
            resolvedTarget,
            ref,
          );
        });
      }
    } else if (onclick) {
      onclick?.(event);
    } else if (targetPanel) {
      targetPanel.setOpen(!targetPanel.open);
    }
  }}
>
  {#if side === "left"}
    {#if effectivePressed}
      <PanelLeftCloseIcon data-ui-part="body-toggle-icon" aria-hidden="true" />
    {:else}
      <PanelLeftOpenIcon data-ui-part="body-toggle-icon" aria-hidden="true" />
    {/if}
  {:else if effectivePressed}
    <PanelRightCloseIcon data-ui-part="body-toggle-icon" aria-hidden="true" />
  {:else}
    <PanelRightOpenIcon data-ui-part="body-toggle-icon" aria-hidden="true" />
  {/if}
</Button>
