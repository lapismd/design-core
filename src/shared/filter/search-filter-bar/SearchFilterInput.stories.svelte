<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor, within } from "storybook/test";
  import SearchFilterInput from "./SearchFilterInput.svelte";
  import SearchFilterCustomLanguageHarness from "./SearchFilterCustomLanguageHarness.svelte";
  import { createDemoLedgerFilterSyntax } from "../demo-ledger-filter-syntax.js";

  const { Story } = defineMeta({
    title: "Filter/Search Filter Bar",
    component: SearchFilterInput,
    parameters: {
      docs: {
        description: {
          component:
            "Compact controlled query input shared by SearchFilterBar and dense filter rows.",
        },
        source: {
          language: "tsx",
          type: "code",
          code: `<SearchFilterInput
  value={query}
  inputMode="filter-query"
  density="compact"
  filterSyntax={syntax}
  onValueChange={(next) => (query = next)}
/>`,
        },
      },
    },
  });

  const syntax = createDemoLedgerFilterSyntax();
</script>

<script lang="ts">
  let query = $state("");
</script>

<Story
  name="Compact query autocomplete"
  tags={["visual-pending", "test"]}
  play={async ({ canvas, canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    const searchbox = canvas.getByRole("searchbox", {
      name: "Filter transactions",
    });
    await userEvent.click(searchbox);
    await waitFor(() =>
      expect(page.getByRole("option", { name: /account/i })).toBeVisible(),
    );
    await userEvent.type(searchbox, "payee ");
    await waitFor(() =>
      expect(page.getByRole("option", { name: /matches/i })).toBeVisible(),
    );
    const portal = canvasElement.ownerDocument.querySelector(
      '[data-ui-component="search-filter-bar-tooltip-layer"]',
    );
    await expect(portal?.parentElement).toBe(canvasElement.ownerDocument.body);
    await expect(canvas.getByRole("status")).toHaveTextContent("payee");
    await userEvent.keyboard("{Escape}");
  }}
>
  {#snippet template()}
    <div data-testid="compact-query-story" style="width: 15rem; padding: 1rem;">
      <SearchFilterInput
        value={query}
        inputMode="filter-query"
        density="compact"
        filterSyntax={syntax}
        ariaLabel="Filter transactions"
        error={query === "(" ? "Invalid query" : null}
        onValueChange={(next) => {
          query = next;
        }}
      />
      <output>{query}</output>
    </div>
  {/snippet}
</Story>

<Story
  name="Custom language retains draft and updates completions"
  tags={["visual-pending", "test"]}
  parameters={{
    docs: {
      source: {
        language: "tsx",
        type: "code",
        code: `import { SearchFilterInput } from "@lapismd/design-core/filter";
import { StreamLanguage } from "@codemirror/language";

const language = StreamLanguage.define({
  token(stream) {
    if (stream.eatSpace()) return null;
    if (stream.match(/[a-z_]+/)) return "variableName";
    stream.next();
    return null;
  },
});

<SearchFilterInput value={query} inputMode="custom"
  editorExtensions={[language]} ariaLabel="Custom query"
  onValueChange={(next) => (query = next)}
  onClearSearch={() => { query = ""; }} />`,
      },
    },
  }}
  play={async ({ canvas, canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    const input = canvas.getByRole("searchbox", { name: "Custom query" });
    await expect(
      canvasElement.querySelector(".custom-query-symbol"),
    ).not.toBeNull();
    await expect(
      canvasElement.querySelector(".cv-search-filter-bar__predicate-chip"),
    ).toBeNull();
    await userEvent.click(input);
    await userEvent.keyboard("{End}x");
    await waitFor(() =>
      expect(page.getByRole("option", { name: /trunk/ })).toBeVisible(),
    );
    await userEvent.keyboard("{Escape}");
    await userEvent.click(
      canvas.getByRole("button", { name: "Change completions" }),
    );
    await expect(
      canvas.getByRole("status", { name: "Query value" }),
    ).toHaveTextContent('description:"rebase"');
    await userEvent.keyboard("{Alt>}z{/Alt}");
    await expect(
      canvas.getByRole("status", { name: "Query value" }),
    ).toHaveTextContent('description:"rebase"');
    await expect(
      canvas.getByRole("status", { name: "Query value" }),
    ).not.toHaveTextContent("x");
    await userEvent.keyboard("{End}x");
    await waitFor(() =>
      expect(page.getByRole("option", { name: /parents/ })).toBeVisible(),
    );
    await userEvent.keyboard("{Escape}");
    await userEvent.click(canvas.getByRole("button", { name: "Clear search" }));
    await expect(
      canvas.getByRole("status", { name: "Query value" }),
    ).toHaveTextContent("");
    await userEvent.click(input);
    await userEvent.type(input, "first");
    await userEvent.keyboard("{Escape}{Enter}");
    await userEvent.keyboard("invalid");
    await userEvent.keyboard("{Escape}");
    await expect(input).toHaveAttribute("aria-multiline", "true");
    await expect(canvasElement.querySelectorAll(".cm-line").length).toBe(2);
    await expect(
      canvas.getByRole("status", { name: "Query value" }).textContent,
    ).toBe("first\ninvalid");
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(canvas.getByRole("alert")).toHaveTextContent(
      "Invalid custom query",
    );
    const pill = canvasElement.querySelector(
      ".cv-search-filter-bar__search-pill",
    )!;
    const styles =
      canvasElement.ownerDocument.defaultView!.getComputedStyle(pill);
    await expect(styles.boxShadow).toBe("none");
    await expect(styles.borderTopColor).toBe("rgba(0, 0, 0, 0)");
    await expect(
      parseFloat(
        canvasElement.ownerDocument.defaultView!.getComputedStyle(
          canvas.getByRole("alert"),
        ).marginTop,
      ),
    ).toBeGreaterThan(0);
  }}
>
  {#snippet template()}<SearchFilterCustomLanguageHarness />{/snippet}
</Story>
