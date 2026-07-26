<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import TokenizedText from "./TokenizedText.svelte";

  const { Story } = defineMeta({
    title: "AI/Chat/Tokenized Text",
    component: TokenizedText,
    parameters: {
      docs: {
        description: {
          component:
            "Deterministic plain-text renderer that replaces serialized values with shared composer tokens.",
        },
      },
    },
  });
</script>

<Story name="Mentions in a response">
  {#snippet template()}
    <p data-story="tokenized-line">
      <TokenizedText
        text="@ada reviewed /release and approved it."
        tokens={[
          { value: "@ada", label: "@Ada", variant: "secondary" },
          { value: "/release", label: "release", variant: "outline" },
        ]}
      />
    </p>
  {/snippet}
</Story>

<style>
  :global([data-story="tokenized-line"]) {
    margin: 0;
    color: var(--foreground);
  }
</style>
