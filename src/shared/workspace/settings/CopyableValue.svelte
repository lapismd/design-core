<script lang="ts">
  import { onDestroy } from "svelte";
  import { Button } from "@lapismd/design-core/shadcn/button";
  import WorkspaceIcon from "../icon/WorkspaceIcon.svelte";
  import { shortenCopyableValue } from "./copyable-value.js";

  let {
    value,
    label = "value",
    emptyLabel = "None",
    leadingCharacters = 8,
    trailingCharacters = 4,
    class: className,
    testId,
  }: {
    value?: string | null;
    label?: string;
    emptyLabel?: string;
    leadingCharacters?: number;
    trailingCharacters?: number;
    class?: string;
    testId?: string;
  } = $props();

  let copied = $state(false);
  let failed = $state(false);
  let resetTimer: ReturnType<typeof setTimeout> | undefined;
  let displayValue = $derived(
    value
      ? shortenCopyableValue(value, leadingCharacters, trailingCharacters)
      : emptyLabel,
  );

  onDestroy(() => {
    if (resetTimer) clearTimeout(resetTimer);
  });

  async function copy(): Promise<void> {
    if (!value) return;
    copied = false;
    failed = false;
    try {
      const clipboard = globalThis.navigator?.clipboard;
      if (!clipboard?.writeText) throw new Error("Clipboard is unavailable");
      await clipboard.writeText(value);
      copied = true;
    } catch {
      failed = true;
    }
    if (resetTimer) clearTimeout(resetTimer);
    resetTimer = setTimeout(() => {
      copied = false;
      failed = false;
    }, 1_500);
  }
</script>

{#if value}
  <Button
    class={["ui-workspace-copyable-value", className].filter(Boolean).join(" ")}
    variant="ghost"
    size="xs"
    aria-label={`Copy full ${label}: ${value}`}
    title={`Copy full ${label}`}
    data-testid={testId}
    data-copied={copied || undefined}
    data-copy-failed={failed || undefined}
    onclick={() => void copy()}
  >
    <code>{displayValue}</code>
    <WorkspaceIcon
      name={copied ? "check" : failed ? "triangle-alert" : "copy"}
    />
  </Button>
{:else}
  <span
    class={["ui-workspace-copyable-value__empty", className]
      .filter(Boolean)
      .join(" ")}>{displayValue}</span
  >
{/if}
