<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";

  const { Story } = defineMeta({
    title: "Visual Delta/Readiness Fixture",
    tags: ["test", "visual-delta-self-test"],
    parameters: {
      docs: {
        description: {
          component:
            "Manager-only readiness fixture. It is excluded from product visual captures without supplying a provisional baseline.",
        },
      },
    },
  });
</script>

<Story
  name="Delayed missing baseline"
  play={async ({ canvasElement }) => {
    canvasElement.dataset.visualDeltaDelayedMissing = "pending";
    await new Promise((resolve) => window.setTimeout(resolve, 6_000));
    canvasElement.dataset.visualDeltaDelayedMissing = "complete";
    await expect(
      within(canvasElement).getByTestId("delayed-missing-subject"),
    ).toBeInTheDocument();
  }}

  tags={["skip-visual"]}
>
  {#snippet template()}
    <div data-testid="delayed-missing-subject">
      Delayed story without a baseline
    </div>
  {/snippet}
</Story>
