<script lang="ts">
  import { CommentComposer, type CommentComposerSource } from "../index.js";
  import { Avatar } from "../../shadcn/avatar/index.js";
  import { Button } from "../../shadcn/button/index.js";
  let {
    scenario = "code",
  }: {
    scenario?:
      | "code"
      | "markdown"
      | "inline"
      | "disabled"
      | "pending"
      | "unavailable"
      | "narrow";
  } = $props();
  let value = $state("show me contents of this file");
  let result = $state("No action requested");
  let submitted = $state("");
  let alternate = $state(false);
  const source = $derived<CommentComposerSource | undefined>(
    scenario === "inline"
      ? undefined
      : {
          label: alternate
            ? "Selected code"
            : scenario === "markdown"
              ? "Project update"
              : ".gitignore",
          quote: alternate
            ? "const café = '🦀';\n  return café;"
            : scenario === "markdown"
              ? "Please review the **configuration** and the `build` command."
              : ".gitignore",
          kind: scenario === "markdown" ? "markdown" : "code",
          available: scenario !== "unavailable",
        },
  );
</script>

<div class="comment-composer-review" data-narrow={scenario === "narrow"}>
  <h2>{scenario === "inline" ? "Inline comment" : "Reply to a selection"}</h2>
  <p>A captured quote with a compact comment draft, following jj-store.</p>
  <CommentComposer
    bind:value
    emojis={scenario === "inline"
      ? [{ emoji: "🎉", name: "celebration" }]
      : undefined}
    {...source === undefined ? {} : { source }}
    disabled={scenario === "disabled"}
    pending={scenario === "pending"}
    onSubmit={(snapshot) => {
      submitted = snapshot;
      result = "Submission requested";
    }}
    onDismiss={() => {
      result = "Dismiss requested; draft retained";
    }}
    onRemove={() => {
      result = "Removal requested";
    }}
    onNavigateSource={() => {
      result = `Source requested: ${source?.label}`;
    }}
  >
    {#snippet avatar()}<Avatar
        name="Alex Morgan"
        size="sm"
        decorative
      />{/snippet}
  </CommentComposer>
  <div class="comment-composer-review__controls">
    <Button variant="outline" size="sm" onclick={() => (alternate = !alternate)}
      >Switch source context</Button
    >
  </div>
  <output aria-live="polite" data-testid="comment-result">{result}</output>
  <dl>
    <dt>Controlled draft</dt>
    <dd data-testid="comment-draft">{value}</dd>
    <dt>Submitted snapshot</dt>
    <dd data-testid="comment-submitted">{submitted || "(none)"}</dd>
  </dl>
</div>

<style>
  .comment-composer-review {
    display: grid;
    gap: 1rem;
    width: min(100%, 48rem);
    padding: 1.5rem;
    margin-inline: auto;
  }
  .comment-composer-review[data-narrow="true"] {
    max-width: 22rem;
    padding: 0.75rem;
  }
  h2,
  p,
  dl,
  dd {
    margin: 0;
  }
  h2 {
    font-size: 1rem;
  }
  p,
  dt,
  output {
    color: var(--muted-foreground);
    font-size: 0.8125rem;
  }
  dl {
    display: grid;
    gap: 0.5rem;
  }
  dd {
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    font-size: 0.8125rem;
  }
</style>
