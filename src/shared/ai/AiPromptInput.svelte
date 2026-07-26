<script lang="ts">
  import Composer from "./chat/Composer.svelte";

  let {
    value = $bindable(""),
    disabled = false,
    placeholder = "Ask the assistant…",
    onSend = () => {},
  }: {
    value?: string;
    disabled?: boolean;
    placeholder?: string;
    onSend?: (text: string) => void;
  } = $props();
</script>

<div data-ui-component="ai-prompt-input" data-ui-part="root">
  <Composer
    bind:value
    {disabled}
    {placeholder}
    density="compact"
    onSubmit={onSend}
  />
</div>

<style>
  :global([data-ui-component="ai-prompt-input"][data-ui-part="root"]) {
    position: relative;
    z-index: 10;
    flex-shrink: 0;
    margin: 0.5rem;
    overflow: visible;
  }

  :global(
      [data-ui-component="ai-prompt-input"]
        > [data-ui-component="ai-chat-composer"]
    ) {
    min-height: 5rem;
  }
</style>
