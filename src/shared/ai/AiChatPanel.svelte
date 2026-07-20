<script lang="ts">
  import SparklesIcon from "@lucide/svelte/icons/sparkles";
  import AiChatDock from "./AiChatDock.svelte";
  import AiChatPanelSettings from "./AiChatPanelSettings.svelte";
  import AiChatTranscript from "./AiChatTranscript.svelte";
  import AiPromptInput from "./AiPromptInput.svelte";
  import type {
    AiChatMessage,
    AiChatPlacement,
    AiChatVisibility,
    AiReviewChangeSummary,
  } from "./types.js";

  let {
    messages = [],
    visibility = $bindable<AiChatVisibility>("expanded"),
    placement = $bindable<AiChatPlacement>("right"),
    disabled = false,
    label = "AI chat",
    loading = false,
    error = null,
    reviewChanges = [],
    openSignal = 0,
    onSend = () => {},
    onExpand = () => {
      visibility = "expanded";
    },
    onPopOut = () => {
      placement = "floating";
      visibility = "expanded";
    },
  }: {
    messages?: AiChatMessage[];
    visibility?: AiChatVisibility;
    placement?: AiChatPlacement;
    disabled?: boolean;
    label?: string;
    loading?: boolean;
    error?: string | null;
    reviewChanges?: AiReviewChangeSummary[];
    openSignal?: number;
    onSend?: (text: string) => void;
    onExpand?: () => void;
    onPopOut?: () => void;
  } = $props();

  let draft = $state("");

  $effect(() => {
    if (openSignal > 0) {
      visibility = "expanded";
    }
  });

  function handleExpand() {
    visibility = "expanded";
    onExpand();
  }
</script>

<AiChatDock
  {placement}
  {visibility}
  {label}
  onExpand={handleExpand}
  {onPopOut}
>
  <div
    data-ui-component="ai-chat-panel"
    data-ui-part="root"
    data-placement={placement}
    data-testid="ai-chat-panel"
  >
    <header data-ui-component="ai-chat-panel" data-ui-part="header">
      <SparklesIcon />
      <p>{label}</p>
      <AiChatPanelSettings
        bind:placement
        bind:visibility
        onCollapse={() => (visibility = "collapsed")}
        onHide={() => (visibility = "hidden")}
      />
    </header>
    <AiChatTranscript {messages} {loading} {error} {reviewChanges} />
    <AiPromptInput bind:value={draft} {disabled} {onSend} />
  </div>
</AiChatDock>

<style>
  :global([data-ui-component="ai-chat-panel"][data-ui-part="root"]) {
    --ui-ai-radius: 0.75rem;
    --ui-ai-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
    display: flex;
    min-height: 0;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid var(--border);
    background: color-mix(in oklab, var(--background) 90%, transparent);
    box-shadow: var(--ui-ai-shadow);
    backdrop-filter: blur(8px);
  }

  :global([data-ui-component="ai-chat-panel"][data-ui-part="root"][data-placement="right"]) {
    width: 100%;
    height: 100%;
    min-height: 100%;
    border-radius: 0;
    border-block-width: 0;
    border-right-width: 0;
  }

  :global([data-ui-component="ai-chat-panel"][data-ui-part="root"][data-placement="floating"]) {
    max-height: min(58vh, 430px);
    border-radius: var(--ui-ai-radius);
  }

  :global([data-ui-component="ai-chat-panel"][data-ui-part="header"]) {
    display: flex;
    height: 2.5rem;
    flex-shrink: 0;
    align-items: center;
    gap: 0.5rem;
    border-bottom: 1px solid var(--border);
    padding-inline: 0.5rem;
  }

  :global([data-ui-component="ai-chat-panel"][data-ui-part="header"] svg) {
    width: 1rem;
    height: 1rem;
    flex-shrink: 0;
  }

  :global([data-ui-component="ai-chat-panel"][data-ui-part="header"] p) {
    min-width: 0;
    flex: 1 1 auto;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.875rem;
    font-weight: 500;
  }
</style>
