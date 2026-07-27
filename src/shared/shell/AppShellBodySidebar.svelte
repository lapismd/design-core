<script module lang="ts">
  let nextBodyPanelId = 0;
</script>

<script lang="ts">
  import { untrack } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import type { WithElementRef } from "../../lib/utils.js";
  import { ScrollArea } from "../shadcn/scroll-area/index.js";
  import { useAppShell } from "./app-shell-context.svelte.js";
  import { useAppShellBody } from "./app-shell-body-context.svelte.js";
  import type { AppShellSide } from "./app-shell-controller.svelte.js";
  import { appShellTeleport } from "./app-shell-teleport.js";

  let {
    ref = $bindable(null),
    open = $bindable(true),
    side,
    panelId,
    label,
    mobileLabel,
    tabindex: _tabindex,
    class: className,
    children,
    ...restProps
  }: WithElementRef<HTMLAttributes<HTMLElement>> & {
    /** Whether this consumer-owned body region occupies desktop body space. */
    open?: boolean;
    /** The side of the main body occupied by this local region. */
    side: AppShellSide;
    /** Stable target id for body toggles and the mobile edge selector. */
    panelId?: string;
    /** Accessible landmark name. Defaults from `side`. */
    label?: string;
    /** Mobile edge selector label. Defaults to the accessible landmark label. */
    mobileLabel?: string;
  } = $props();

  const controller = useAppShell();
  const body = useAppShellBody();
  const generatedPanelId = `body-panel-${++nextBodyPanelId}`;

  if (body.layout !== "regions") {
    throw new Error(
      'AppShell.Body.Sidebar requires AppShell.Body layout="regions"',
    );
  }

  let resolvedPanelId = $derived(panelId?.trim() || generatedPanelId);
  let accessibleLabel = $derived(
    label ?? (side === "left" ? "Left body sidebar" : "Right body sidebar"),
  );
  let mobileMode = $derived(controller.mobile.resolvedMode === "mobile");
  let mobileActive = $derived(
    !mobileMode || controller.mobile.activePanelId(side) === resolvedPanelId,
  );

  $effect(() => {
    const registration = {
      id: resolvedPanelId,
      side,
      get open() {
        return open;
      },
      setOpen(nextOpen: boolean) {
        open = nextOpen;
      },
    };
    return untrack(() => body.registerPanel(registration));
  });

  $effect(() => {
    const registration = {
      id: resolvedPanelId,
      side,
      kind: "body-sidebar" as const,
      get label() {
        return mobileLabel ?? accessibleLabel;
      },
      get element() {
        return ref;
      },
    };
    return untrack(() => controller.mobile.registerPanel(registration));
  });
</script>

<aside
  bind:this={ref}
  use:appShellTeleport={{
    enabled: mobileMode,
    target: controller.mobile.getPanelHost(side),
  }}
  {...restProps}
  tabindex="-1"
  hidden={!mobileMode && !open}
  class={["ui-minimal-app-shell__body-sidebar", className]
    .filter(Boolean)
    .join(" ")}
  data-ui-component="app-shell"
  data-ui-part="body-sidebar"
  data-side={side}
  data-open={open}
  data-mobile-panel-id={resolvedPanelId}
  data-mobile-panel-active={mobileActive || undefined}
  aria-label={accessibleLabel}
  aria-hidden={(mobileMode && !mobileActive) || (!mobileMode && !open)}
  inert={(mobileMode && !mobileActive) || (!mobileMode && !open)}
>
  <ScrollArea
    type="auto"
    class="ui-minimal-app-shell__body-sidebar-scroll-area"
  >
    {@render children?.()}
  </ScrollArea>
</aside>
