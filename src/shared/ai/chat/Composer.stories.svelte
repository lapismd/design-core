<script module lang="ts">
  import PaperclipIcon from "@lucide/svelte/icons/paperclip";
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import { Button } from "@stevejuma/ui/shadcn/button";
  import Composer from "./Composer.svelte";
  import ComposerDrawer from "./ComposerDrawer.svelte";

  const { Story } = defineMeta({
    title: "AI/Chat/Composer",
    component: Composer,
    parameters: {
      docs: {
        description: {
          component:
            "Rich Svelte 5 composer shell with bindable value, slot snippets, submit/stop states, status, and focus delegation.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let submitted = $state("");
</script>

<Story
  name="Submits from the keyboard"
  play={async ({ canvas }) => {
    const input = canvas.getByRole("combobox", { name: "Message" });
    await userEvent.click(input);
    await userEvent.type(input, "Ship the release notes{Enter}");
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Ship the release notes",
    );
  }}
>
  {#snippet template()}
    <div data-story="composer-frame">
      <Composer
        onSubmit={(value) => {
          submitted = value;
        }}
      >
        {#snippet footerActions()}
          <Button variant="ghost" size="icon-sm" aria-label="Attach file">
            <PaperclipIcon aria-hidden="true" />
          </Button>
        {/snippet}
      </Composer>
      <output>{submitted || "Nothing submitted"}</output>
    </div>
  {/snippet}
</Story>

<Story name="Context drawer and warning">
  {#snippet template()}
    <div data-story="composer-frame">
      <Composer
        status={{ type: "warning", message: "Two files are still indexing." }}
        onSubmit={() => {}}
      >
        {#snippet drawer()}
          <ComposerDrawer count={2}>
            <p data-story="drawer-copy">release-notes.md and changelog.md</p>
          </ComposerDrawer>
        {/snippet}
        {#snippet headerContext()}
          <span data-story="model-label">Mira · fast</span>
        {/snippet}
      </Composer>
    </div>
  {/snippet}
</Story>

<style>
  :global([data-story="composer-frame"]) {
    display: flex;
    width: min(38rem, 90vw);
    flex-direction: column;
    gap: 0.75rem;
  }

  :global([data-story="composer-frame"] output),
  :global([data-story="drawer-copy"]),
  :global([data-story="model-label"]) {
    margin: 0;
    color: var(--muted-foreground);
    font-size: 0.75rem;
  }
</style>
