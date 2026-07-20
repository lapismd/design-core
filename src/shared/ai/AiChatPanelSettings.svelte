<script lang="ts">
  import PanelRightIcon from "@lucide/svelte/icons/panel-right";
  import PictureInPicture2Icon from "@lucide/svelte/icons/picture-in-picture-2";
  import XIcon from "@lucide/svelte/icons/x";
  import { Button } from "@stevejuma/ui/shadcn/button";
  import type { AiChatPlacement, AiChatVisibility } from "./types.js";

  let {
    placement = $bindable<AiChatPlacement>("right"),
    visibility = $bindable<AiChatVisibility>("expanded"),
    onCollapse = () => {},
    onHide = () => {},
  }: {
    placement?: AiChatPlacement;
    visibility?: AiChatVisibility;
    onCollapse?: () => void;
    onHide?: () => void;
  } = $props();
</script>

<div data-ui-component="ai-chat-panel-settings" data-ui-part="root">
  <Button
    type="button"
    variant={placement === "right" ? "secondary" : "ghost"}
    size="icon-sm"
    data-ui-part="button"
    aria-label="Dock AI to the right"
    title="Dock right"
    onclick={() => {
      placement = "right";
      if (visibility === "hidden") visibility = "expanded";
    }}
  >
    <PanelRightIcon />
  </Button>
  <Button
    type="button"
    variant={placement === "floating" ? "secondary" : "ghost"}
    size="icon-sm"
    data-ui-part="button"
    aria-label="Float AI chat"
    title="Float"
    onclick={() => {
      placement = "floating";
      if (visibility === "hidden") visibility = "expanded";
    }}
  >
    <PictureInPicture2Icon />
  </Button>
  <Button
    type="button"
    variant="ghost"
    size="icon-sm"
    data-ui-part="button"
    aria-label="Collapse AI chat"
    title="Collapse"
    onclick={onCollapse}
  >
    <XIcon />
  </Button>
  <Button
    type="button"
    variant="ghost"
    size="icon-sm"
    data-ui-part="sr-only"
    aria-label="Hide AI chat"
    onclick={onHide}
  >
    Hide
  </Button>
</div>

<style>
  :global([data-ui-component="ai-chat-panel-settings"][data-ui-part="root"]) {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  :global([data-ui-component="ai-chat-panel-settings"] [data-ui-part="button"] svg) {
    width: 1rem;
    height: 1rem;
  }

  :global([data-ui-component="ai-chat-panel-settings"] [data-ui-part="sr-only"]) {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
</style>
