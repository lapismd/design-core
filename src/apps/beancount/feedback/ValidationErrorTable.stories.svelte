<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import ValidationErrorTable from "./ValidationErrorTable.svelte";

  const { Story } = defineMeta({
    tags: ["skip-visual"],
    title: "Apps/Beancount/Feedback/Validation Error Table",
    component: ValidationErrorTable,
    parameters: {
      docs: {
        description: {
          component:
            "An actionable, data-driven ledger validation table. Supply normalized errors and handle line navigation in the application; this component deliberately has no parser, store, or route dependency.",
        },
      },
    },
  });

  const errors = [
    {
      id: "duplicate-open",
      line: 3,
      message: "Duplicate open directive for Assets:Cash",
      entity: "2026-01-02 open Assets:Cash",
      href: "/editor?line=3",
    },
    {
      id: "unknown-account",
      line: 14,
      message: "Unknown account Expenses:Travel:Flights",
      entity: "  Expenses:Travel:Flights  325.00 GBP",
      href: "/editor?line=14",
    },
  ];
</script>

<script lang="ts">
  let selectedLine = $state<string | number | undefined>();
</script>

<Story
  name="Links errors to their source location"
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("link", { name: "3" }));
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Opening line 3",
    );
  }}
>
  {#snippet template()}
    <div class="bc-validation-error-table-story">
      <ValidationErrorTable
        {errors}
        onNavigate={(error) => {
          selectedLine = error.line;
        }}
      />
      <output
        class="bc-validation-error-table-story__status"
        aria-live="polite"
      >
        {selectedLine ? `Opening line ${selectedLine}` : "No error selected"}
      </output>
    </div>
  {/snippet}
</Story>

<Story
  name="Shows a calm empty state"
  play={async ({ canvas }) => {
    await expect(canvas.getByText("No validation errors")).toBeVisible();
  }}
>
  {#snippet template()}
    <div class="bc-validation-error-table-story">
      <ValidationErrorTable errors={[]} />
    </div>
  {/snippet}
</Story>

<Story
  name="Frames a compact route empty state"
  play={async ({ canvas }) => {
    await expect(canvas.getByText("No records")).toBeVisible();
  }}
>
  {#snippet template()}
    <div class="bc-validation-error-table-story">
      <ValidationErrorTable
        errors={[]}
        emptyVariant="compact"
        emptyTitle="No records"
      />
    </div>
  {/snippet}
</Story>

<style>
  .bc-validation-error-table-story {
    max-width: 64rem;
    padding: var(--ui-beancount-space-5);
  }

  .bc-validation-error-table-story__status {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }
</style>
