<script lang="ts">
  import { Button } from "../../shadcn/button/index.js";
  import CodeXmlIcon from "@lucide/svelte/icons/code-xml";
  let {
    raw,
    label,
    onToggle,
  }: { raw: boolean; label: string; onToggle: (opener: HTMLElement) => void } =
    $props();
</script>

<span class="ui-transcript-raw-toggle">
  <Button
    variant="ghost"
    size="icon-sm"
    aria-label={label}
    title={label}
    aria-pressed={raw}
    onclick={(event) => onToggle(event.currentTarget)}
  >
    <CodeXmlIcon size={15} />
  </Button>
</span>

<style>
  .ui-transcript-raw-toggle {
    flex: none;
    opacity: 0;
  }
  :global(.ui-transcript-tool-heading:hover) .ui-transcript-raw-toggle,
  :global(.ui-transcript-tool-heading:focus-within) .ui-transcript-raw-toggle,
  :global(.ui-transcript-tool-panel header:hover) .ui-transcript-raw-toggle,
  :global(.ui-transcript-tool-panel header:focus-within)
    .ui-transcript-raw-toggle,
  .ui-transcript-raw-toggle:focus-within {
    opacity: 1;
  }
  @media (hover: none) {
    .ui-transcript-raw-toggle {
      opacity: 1;
    }
  }
</style>
