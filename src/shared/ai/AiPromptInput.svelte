<script lang="ts">
  import ArrowUpIcon from "@lucide/svelte/icons/arrow-up";
  import { Button } from "@stevejuma/ui/shadcn/button";
  import { Textarea } from "@stevejuma/ui/shadcn/textarea";

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

  const canSend = $derived(!disabled && value.trim().length > 0);

  function submit() {
    if (!canSend) return;
    const text = value.trim();
    value = "";
    onSend(text);
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  }
</script>

<div data-ui-component="ai-prompt-input" data-ui-part="root">
  <div data-ui-component="ai-prompt-input" data-ui-part="composer">
    <Textarea
      {value}
      {placeholder}
      {disabled}
      rows={3}
      data-ui-part="textarea"
      oninput={(event) => {
        value = (event.currentTarget as HTMLTextAreaElement).value;
      }}
      onkeydown={handleKeydown}
    />
    <Button
      type="button"
      size="icon-sm"
      data-ui-part="send"
      aria-label="Send message"
      disabled={!canSend}
      onclick={submit}
    >
      <ArrowUpIcon />
    </Button>
  </div>
</div>

<style>
  :global([data-ui-component="ai-prompt-input"][data-ui-part="root"]) {
    position: relative;
    z-index: 10;
    flex-shrink: 0;
    margin: 0.5rem;
    overflow: visible;
  }

  :global([data-ui-component="ai-prompt-input"][data-ui-part="composer"]) {
    position: relative;
    overflow: hidden;
    border: 1px solid var(--border);
    border-radius: 0.75rem;
    background: color-mix(in oklab, var(--background) 95%, transparent);
    box-shadow: none;
  }

  :global([data-ui-component="ai-prompt-input"] [data-ui-part="textarea"]) {
    min-height: 4rem;
    resize: none;
    border: 0;
    padding-right: 3rem;
    box-shadow: none;
  }

  :global([data-ui-component="ai-prompt-input"] [data-ui-part="textarea"]:focus-visible) {
    box-shadow: none;
    outline: none;
  }

  :global([data-ui-component="ai-prompt-input"] [data-ui-part="send"]) {
    position: absolute;
    right: 0.5rem;
    bottom: 0.5rem;
  }

  :global([data-ui-component="ai-prompt-input"] [data-ui-part="send"] svg) {
    width: 1rem;
    height: 1rem;
  }
</style>
