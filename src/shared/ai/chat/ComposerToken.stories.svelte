<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import ComposerToken from "./ComposerToken.svelte";

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

<Story name="Badge token">
  {#snippet template()}
    <p data-story="token-line">
      Ask
      <ComposerToken
        id="mention-ada"
        token={{ value: "@ada", label: "@Ada", variant: "secondary" }}
      />
      about the release.
    </p>
  {/snippet}
</Story>

<style>
  :global([data-story="token-line"]) {
    margin: 0;
    color: var(--foreground);
  }
</style>
