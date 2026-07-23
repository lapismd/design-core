<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import DashboardSection from "./DashboardSection.svelte";

  const { Story } = defineMeta({
    title: "Apps/Beancount/Dashboard/Dashboard Section",
    component: DashboardSection,
    parameters: {
      docs: {
        description: {
          component:
            "A controlled dashboard card disclosure for grouping a chart, table, or summary. Keep the dashboard's open-state preference in the parent when it should persist; the section owns its visual hierarchy and accessible trigger only.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let open = $state(true);
</script>

<Story
  name="Collapses a dashboard insight"
  play={async ({ canvas }) => {
    const trigger = canvas.getByRole("button", {
      name: "Cash flow Monthly spending",
    });
    await userEvent.click(trigger);
    await expect(
      canvas.queryByText("Groceries are below budget."),
    ).not.toBeInTheDocument();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  }}
>
  {#snippet template()}
    <div class="max-w-3xl p-5">
      <DashboardSection
        id="monthly-spending-content"
        title="Monthly spending"
        eyebrow="Cash flow"
        bind:open
      >
        <p class="text-muted-foreground p-5 text-sm">
          Groceries are below budget.
        </p>
      </DashboardSection>
    </div>
  {/snippet}
</Story>
