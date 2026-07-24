<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import IngestionReviewToolbar from "./IngestionReviewToolbar.svelte";

  const { Story } = defineMeta({
    title: "Apps/Beancount/Tables/Ingestion Review Toolbar",
    component: IngestionReviewToolbar,
    parameters: {
      docs: {
        description: {
          component:
            "Controlled Records-header actions aligned to Fava. The application owns source selection, review-ledger navigation, acceptance, syncing, AI enrichment, and all mutations; this component only renders affordances and reports requests.",
        },
      },
    },
  });

  const sourceOptions = [
    { value: "all", label: "All connections" },
    { value: "lunch-flow", label: "Lunch Flow" },
  ];
</script>

<script lang="ts">
  let sourceId = $state("all");
  let groupsCollapsedAll = $state(false);
  let action = $state("");
</script>

<Story
  name="Requests record-review header actions"
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Accept 1 ready transaction" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent("Accept 1");

    await userEvent.click(
      canvas.getByRole("button", { name: "Next connection" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Source: Lunch Flow",
    );

    await userEvent.click(
      canvas.getByRole("button", { name: "Collapse all date groups" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Collapse all date groups",
    );

    await userEvent.click(
      canvas.getByRole("button", { name: "Review merchants" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Review merchants",
    );

    await userEvent.click(canvas.getByRole("button", { name: "Edit sources" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("Edit sources");
  }}
>
  {#snippet template()}
    <div class="bc-ingestion-review-toolbar-story">
      <IngestionReviewToolbar
        acceptCount={1}
        canAccept={true}
        canOpenLedger={true}
        {sourceId}
        {sourceOptions}
        {groupsCollapsedAll}
        canForceRefetch={true}
        canRerunAi={true}
        onAccept={() => {
          action = "Accept 1";
        }}
        onOpenLedger={() => {
          action = "Open active review ledger";
        }}
        onSourceChange={(value) => {
          sourceId = value;
          action = `Source: ${sourceOptions.find((option) => option.value === value)?.label}`;
        }}
        onToggleCollapseGroups={() => {
          groupsCollapsedAll = !groupsCollapsedAll;
          action = groupsCollapsedAll
            ? "Collapse all date groups"
            : "Expand all date groups";
        }}
        onOpenMerchants={() => {
          action = "Review merchants";
        }}
        onOpenAccounts={() => {
          action = "Open Accounts";
        }}
        onForceRefetch={() => {
          action = "Force re-fetch";
        }}
        onRerunAi={() => {
          action = "Re-run AI enrichment";
        }}
        onEditSources={() => {
          action = "Edit sources";
        }}
      />
      <output
        class="bc-ingestion-review-toolbar-story__status"
        aria-live="polite"
      >
        {action}
      </output>
    </div>
  {/snippet}
</Story>

<Story name="Explains unavailable record actions">
  {#snippet template()}
    <div class="bc-ingestion-review-toolbar-story">
      <IngestionReviewToolbar
        {sourceOptions}
        sourceId="all"
        onSourceChange={() => {}}
      />
    </div>
  {/snippet}
</Story>

<style>
  .bc-ingestion-review-toolbar-story {
    padding: var(--ui-beancount-space-5);
  }

  .bc-ingestion-review-toolbar-story__status {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }
</style>
