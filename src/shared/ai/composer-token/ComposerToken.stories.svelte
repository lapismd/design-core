<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import ComposerToken from "./ComposerToken.svelte";
  import type { ComposerTokenCustom } from "../types.js";

  const { Story } = defineMeta({
    title: "AI/Chat/Composer Token",
    component: ComposerToken,
    parameters: {
      docs: {
        description: {
          component:
            "Renders a single token chip outside the contentEditable input. Wraps a badge config or custom render function in the correct data-astryx-token span so the token serializes properly and stays visually consistent with tokens inside the composer."}}}});
</script>

<Story
  name="Badge config"
  exportName="BadgeConfig"
  parameters={{
    docs: {
      description: {
        story:
          "Token chip rendered from a badge config so serialization and visual chrome stay consistent with tokens inside the composer input."}},
    visualDelta: {
      images: [
        "/visual-baselines/ai/composer-token/badge-config-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right"
    }}}
  tags={["visual-approved"]}
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
  exportName="CustomRender"
  parameters={{
    docs: {
      description: {
        story:
          "Token chip with a custom render function, still wrapped in the token span required for serialization and consistent styling."}},
    visualDelta: {
      images: [
        "/visual-baselines/ai/composer-token/custom-render-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right"
    }}}
  tags={["visual-approved"]}
>
  {#snippet template()}
    <p data-story="token-line">
      Review
      <ComposerToken
        id="custom-file"
        token={{
          value: "src/lib/auth.ts",
          render: customToken}}
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
