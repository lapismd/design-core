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
            "A presentational BQL command bar. Hosts bind the query text and supply evaluator/format callbacks; this component does not parse BQL, load saved queries, or own route state.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let query = $state("");
  let executed = $state("");
  let cleared = $state("");

  function formatQuery(value: string) {
    return value
      .trim()
      .replace(/\s+/g, " ")
      .replace(/^select\s+/i, "SELECT ")
      .replace(/\s+from\s+/i, " FROM ");
  }
</script>

<Story
  name="Executes an entered BQL query"
  play={async ({ canvas }) => {
    await userEvent.type(
      canvas.getByRole("textbox", { name: "BQL query" }),
      "select account from open",
    );
    await userEvent.click(canvas.getByRole("button", { name: "Format query" }));
    await expect(
      canvas.getByRole("textbox", { name: "BQL query" }),
    ).toHaveValue("SELECT account FROM open");
    await userEvent.click(canvas.getByRole("button", { name: "Clear query" }));
    await expect(
      canvas.getByRole("textbox", { name: "BQL query" }),
    ).toHaveValue("");
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Cleared SELECT account FROM open",
    );
    await userEvent.type(
      canvas.getByRole("textbox", { name: "BQL query" }),
      "SELECT account FROM open",
    );
    await userEvent.click(canvas.getByRole("button", { name: "Execute" }));
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "SELECT account",
    );
  }}
>
  {#snippet template()}
    <div class="bc-query-composer-story">
      <QueryComposer
        bind:value={query}
        onExecute={(value) => {
          executed = value;
        }}
        onFormat={(value) => {
          query = formatQuery(value);
        }}
        onClear={(value) => {
          cleared = `Cleared ${value}`;
        }}
      />
      <output class="bc-query-composer-story__result" aria-live="polite">
        {executed || cleared || "No query executed"}
      </output>
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
