<script lang="ts">
  // Adapted from Mira preview/components/code.svelte; Apache-2.0.
  import { getContext, type Snippet } from "svelte";
  import { codeLanguageLabel } from "@lapismd/mira/preview";
  import { Button } from "../../shadcn/button/index.js";
  import CopyIcon from "@lucide/svelte/icons/copy";
  import CheckIcon from "@lucide/svelte/icons/check";
  import RichSourceReader from "./RichSourceReader.svelte";
  import { richSourceContext, type RichSourceContext } from "./rich-source.js";
  let {
    ref = $bindable(null),
    children,
    "data-transcript-from": from,
    "data-transcript-to": to,
    "data-transcript-language": language = "text",
  }: {
    ref?: HTMLElement | null;
    children?: Snippet;
    "data-transcript-from"?: number;
    "data-transcript-to"?: number;
    "data-transcript-language"?: string;
    [key: string]: unknown;
  } = $props();
  const context = getContext<RichSourceContext>(richSourceContext);
  let copied = $state(false);
</script>

{#if from !== undefined && to !== undefined}
  <div bind:this={ref} class="ui-transcript-rich-code">
    <div class="ui-transcript-rich-code-heading">
      <span>{codeLanguageLabel(`language-${language}`) || language}</span>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={copied ? "Copied code" : "Copy code"}
        onclick={async () => {
          await navigator.clipboard.writeText(
            context.block.text.slice(from!, to!),
          );
          copied = true;
        }}
      >
        {#if copied}<CheckIcon />{:else}<CopyIcon />{/if}
      </Button>
    </div>
    <RichSourceReader {from} {to} {language} label={`${language} code`} />
  </div>
{:else}<code bind:this={ref}>{@render children?.()}</code>{/if}
