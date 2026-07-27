<script lang="ts">
  import PanelLeftCloseIcon from "@lucide/svelte/icons/panel-left-close";
  import PanelLeftOpenIcon from "@lucide/svelte/icons/panel-left-open";
  import PanelRightCloseIcon from "@lucide/svelte/icons/panel-right-close";
  import PanelRightOpenIcon from "@lucide/svelte/icons/panel-right-open";
  import type { HTMLButtonAttributes } from "svelte/elements";
  import { Button } from "../shadcn/button/index.js";
  import { useAppShellBody } from "./app-shell-body-context.svelte.js";
  import { useAppShell } from "./app-shell-context.svelte.js";
  import type { AppShellSide } from "./app-shell-controller.svelte.js";

  let {
    ref = $bindable(null),
    side,
    pressed = false,
    label,
    class: className,
    ...restProps
  }: HTMLButtonAttributes & {
    ref?: HTMLButtonElement | null;
    /** Body corner occupied by this consumer-controlled sidebar action. */
    side: AppShellSide;
    /** Whether the corresponding body sidebar is currently mounted. */
    pressed?: boolean;
    /** Accessible action name. Defaults from `side` and `pressed`. */
    label?: string;
  } = $props();

  useAppShell();
  const body = useAppShellBody();

  if (body.layout !== "regions") {
    throw new Error(
      'AppShell.Body.Toggle requires AppShell.Body layout="regions"',
    );
  }

  let accessibleLabel = $derived(
    label ?? `${pressed ? "Hide" : "Show"} ${side} body sidebar`,
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
  aria-pressed={pressed}
  title={accessibleLabel}
>
  {#if side === "left"}
    {#if pressed}
      <PanelLeftCloseIcon data-ui-part="body-toggle-icon" aria-hidden="true" />
    {:else}
      <PanelLeftOpenIcon data-ui-part="body-toggle-icon" aria-hidden="true" />
    {/if}
  {:else if pressed}
    <PanelRightCloseIcon data-ui-part="body-toggle-icon" aria-hidden="true" />
  {:else}
    <PanelRightOpenIcon data-ui-part="body-toggle-icon" aria-hidden="true" />
  {/if}
</Button>
