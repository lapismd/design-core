<!-- Adapted from jj-store 3be80ad2104f StoreAgentSentContext; Apache-2.0, LapisMD contributors. -->
<script lang="ts">
  import * as Collapsible from "../../shadcn/collapsible/index.js";
  import { Button } from "../../shadcn/button/index.js";
  import { CodeBlock } from "../../shadcn/code-block/index.js";
  import { ScrollArea } from "../../shadcn/scroll-area/index.js";
  import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
  import CodeXmlIcon from "@lucide/svelte/icons/code-xml";
  import PromptContext from "../prompt-context/PromptContext.svelte";
  import type { SentContextProps } from "./sent-context.types.js";
  import "./sent-context.css";

  let {
    content,
    delivery = "prepared",
    rawContent,
    rawLanguage = "json",
    open = $bindable(false),
    raw = $bindable(false),
    onOpenChange,
    onRawChange,
    markdown,
    class: className,
    ...rest
  }: SentContextProps = $props();
  const labels = {
    sent: "Sent context",
    queued: "Queued context",
    failed: "Context not sent",
    unknown: "Context delivery unknown",
    prepared: "Prepared context",
  } as const;
</script>

{#if content.trim()}
  <div
    {...rest}
    class={["ui-sent-context", className]}
    data-ui-component="sent-context"
    data-delivery={delivery}
  >
    <Collapsible.Root bind:open onOpenChange={(value) => onOpenChange?.(value)}>
      <div class="ui-sent-context__heading">
        <Collapsible.Trigger>
          {#snippet child({ props })}
            <Button
              {...props}
              variant="secondary"
              size="xs"
              class="ui-sent-context__trigger"
            >
              <span>{labels[delivery]}</span>
              <ChevronRightIcon data-icon="inline-end" aria-hidden="true" />
            </Button>
          {/snippet}
        </Collapsible.Trigger>
        {#if open}
          <span class="ui-sent-context__toggle" data-active={raw}>
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label={raw ? "Show rendered context" : "Show raw context"}
              title={raw ? "Show rendered context" : "Show raw context"}
              aria-pressed={raw}
              onclick={() => {
                raw = !raw;
                onRawChange?.(raw);
              }}
            >
              <CodeXmlIcon aria-hidden="true" />
            </Button>
          </span>
        {/if}
      </div>
      <Collapsible.Content forceMount>
        {#snippet child({ props })}
          <section
            {...props}
            hidden={!open}
            aria-label="Application context for this message"
            class="ui-sent-context__panel"
          >
            <ScrollArea class="ui-sent-context__scroll" scrollStrategy="styled">
              <div hidden={raw}>
                <PromptContext {...markdown} {content} compact fullWidth />
              </div>
              {#if raw}
                <div role="region" aria-label="Raw context">
                  <CodeBlock
                    code={rawContent ?? content}
                    language={rawContent === undefined
                      ? "plaintext"
                      : rawLanguage}
                    size="sm"
                    width="100%"
                    container="section"
                    hasLanguageLabel={false}
                    isWrapped
                  />
                </div>
              {/if}
            </ScrollArea>
          </section>
        {/snippet}
      </Collapsible.Content>
    </Collapsible.Root>
  </div>
{/if}
