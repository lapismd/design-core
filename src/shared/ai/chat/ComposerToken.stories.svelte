<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import ComposerToken from "./ComposerToken.svelte";
  import type { ComposerTokenCustom } from "./types.js";

  const { Story } = defineMeta({
    title: "AI/Chat/Composer Token",
    component: ComposerToken,
    parameters: {
      docs: {
        description: {
          component:
            "Non-editable serialized token rendered with the local shadcn Badge primitive.",
        },
      },
    },
  });
</script>

<Story
  name="Badge config"
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/ai/chat/composer-token/badge-config-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
  tags={["visual-failed"]}
>
  {#snippet template()}
    <p data-story="token-line">
      Assign
      <ComposerToken
        id="mention-cindy"
        token={{ value: "@cindy", label: "@Cindy", variant: "secondary" }}
      />
      as a reviewer.
    </p>
  {/snippet}
</Story>

<Story
  name="Custom render"
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/ai/chat/composer-token/custom-render-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
  tags={["visual-failed"]}
>
  {#snippet template()}
    <p data-story="token-line">
      Review
      <ComposerToken
        id="custom-file"
        token={{
          value: "src/lib/auth.ts",
          render: customToken,
        }}
      />
      before merging.
    </p>
  {/snippet}
</Story>

{#snippet customToken(_token: ComposerTokenCustom)}
  <span data-story="custom-token">src/lib/auth.ts</span>
{/snippet}

<style>
  :global([data-story="token-line"]) {
    margin: 0;
    color: var(--foreground);
  }

  :global([data-story="custom-token"]) {
    display: inline-flex;
    border: 1px solid var(--border);
    border-radius: 999px;
    padding-inline: 0.5rem;
    color: var(--foreground);
    font-family: var(--font-mono);
    font-size: 0.75rem;
  }
</style>
