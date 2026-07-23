<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import QueryComposer from "./QueryComposer.svelte";

  const { Story } = defineMeta({
    title: "Apps/Beancount/Screens/Query Composer",
    component: QueryComposer,
    parameters: {
      docs: {
        description: {
          component:
            "A presentational BQL command bar. Hosts bind the query text and supply the evaluator/options callbacks; this component does not parse BQL, load saved queries, or own route state.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let query = $state("");
  let executed = $state("");
  let optionsOpened = $state(false);
</script>

<Story
  name="Executes an entered BQL query"
  play={async ({ canvas }) => {
    await userEvent.type(
      canvas.getByRole("textbox", { name: "BQL query" }),
      "SELECT account, sum(position) WHERE account ~ 'Assets'",
    );
    await userEvent.click(canvas.getByRole("button", { name: "Execute" }));
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "SELECT account",
    );

    await userEvent.click(
      canvas.getByRole("button", { name: "Query display options" }),
    );
    await expect(canvas.getByText("Options opened")).toBeVisible();
  }}
>
  {#snippet template()}
    <div class="bc-query-composer-story">
      <QueryComposer
        bind:value={query}
        onExecute={(value) => {
          executed = value;
        }}
        onOptions={() => {
          optionsOpened = true;
        }}
      />
      <output class="bc-query-composer-story__result" aria-live="polite">
        {executed || "No query executed"}
      </output>
      {#if optionsOpened}
        <p>Options opened</p>
      {/if}
    </div>
  {/snippet}
</Story>

<style>
  .bc-query-composer-story {
    display: grid;
    max-width: 72rem;
    gap: var(--ui-beancount-space-3);
    padding: var(--ui-beancount-space-5);
  }

  .bc-query-composer-story__result {
    color: var(--ui-beancount-muted-foreground);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
  }
</style>
