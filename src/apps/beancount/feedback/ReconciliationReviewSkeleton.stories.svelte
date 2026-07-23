<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect } from "storybook/test";
  import ReconciliationReviewSkeleton from "./ReconciliationReviewSkeleton.svelte";

  const { Story } = defineMeta({
    title: "Apps/Beancount/Feedback/Reconciliation Review Skeleton",
    component: ReconciliationReviewSkeleton,
    parameters: {
      docs: {
        description: {
          component:
            "UI-owned loading surface for reviewable bank-import matches. It preserves the grouped review hierarchy while candidate transactions load, rather than presenting a generic blank page.",
        },
      },
    },
  });
</script>

<Story
  name="Preserves the review hierarchy while loading"
  play={async ({ canvas }) => {
    await expect(
      canvas.getByLabelText("Loading reconciliation matches"),
    ).toHaveAttribute("aria-busy", "true");
  }}
>
  {#snippet template()}
    <div class="bc-reconciliation-review-skeleton-story">
      <ReconciliationReviewSkeleton />
    </div>
  {/snippet}
</Story>

<style>
  .bc-reconciliation-review-skeleton-story {
    max-width: 56rem;
    padding: var(--ui-beancount-space-4);
  }
</style>
