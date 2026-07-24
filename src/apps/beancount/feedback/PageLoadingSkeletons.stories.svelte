<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect } from "storybook/test";
  import AccountsPageSkeleton from "./AccountsPageSkeleton.svelte";
  import AiDockSkeleton from "./AiDockSkeleton.svelte";
  import BrandSettingsSkeleton from "./BrandSettingsSkeleton.svelte";
  import MerchantsPageSkeleton from "./MerchantsPageSkeleton.svelte";
  import QueryPageSkeleton from "./QueryPageSkeleton.svelte";
  import ResourceViewerSkeleton from "./ResourceViewerSkeleton.svelte";
  import ReviewImportsSkeleton from "./ReviewImportsSkeleton.svelte";
  import RulesPageSkeleton from "./RulesPageSkeleton.svelte";
  import SourcesPageSkeleton from "./SourcesPageSkeleton.svelte";

  const { Story } = defineMeta({
    title: "Apps/Beancount/Feedback/Page Loading Skeletons",
    component: AccountsPageSkeleton,
    parameters: {
      docs: {
        description: {
          component:
            "UI-owned application-specific loading compositions for accounts, settings, merchants, query results, resources, import review, rules, sources, and the AI dock. These are route- and surface-level feedback, not shared control placeholders: keep the eventual page hierarchy visible, mark the loading region busy, and use the narrowest matching composition.",
        },
      },
    },
  });
</script>

<Story
  name="Accounts"
  play={async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelector("[data-accounts-page-skeleton]"),
    ).toHaveAttribute("aria-busy", "true");
  }}
>
  {#snippet template()}
    <div class="bc-page-loading-skeletons__content">
      <AccountsPageSkeleton />
    </div>
  {/snippet}
</Story>

<Story
  name="AI dock"
  play={async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelector("[data-ai-dock-skeleton]"),
    ).toHaveAttribute("aria-busy", "true");
  }}
>
  {#snippet template()}
    <div class="bc-page-loading-skeletons__dock">
      <AiDockSkeleton />
    </div>
  {/snippet}
</Story>

<Story
  name="Brand settings"
  play={async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelector("[data-brand-settings-skeleton]"),
    ).toHaveAttribute("aria-busy", "true");
  }}
>
  {#snippet template()}
    <div class="bc-page-loading-skeletons__content">
      <BrandSettingsSkeleton />
    </div>
  {/snippet}
</Story>

<Story
  name="Merchants"
  play={async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelector("[data-merchants-page-skeleton]"),
    ).toHaveAttribute("aria-busy", "true");
  }}
>
  {#snippet template()}
    <div class="bc-page-loading-skeletons__content">
      <MerchantsPageSkeleton />
    </div>
  {/snippet}
</Story>

<Story
  name="Query results"
  play={async ({ canvas }) => {
    await expect(canvas.getByLabelText("Loading query page")).toHaveAttribute(
      "aria-busy",
      "true",
    );
  }}
>
  {#snippet template()}
    <div class="bc-page-loading-skeletons__route">
      <QueryPageSkeleton />
    </div>
  {/snippet}
</Story>

<Story
  name="Resource viewer"
  play={async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelector("[data-resource-viewer-skeleton]"),
    ).toHaveAttribute("aria-busy", "true");
  }}
>
  {#snippet template()}
    <div class="bc-page-loading-skeletons__resource">
      <ResourceViewerSkeleton />
    </div>
  {/snippet}
</Story>

<Story
  name="Import review"
  play={async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelector("[data-review-imports-skeleton]"),
    ).toHaveAttribute("aria-busy", "true");
  }}
>
  {#snippet template()}
    <div class="bc-page-loading-skeletons__content">
      <ReviewImportsSkeleton />
    </div>
  {/snippet}
</Story>

<Story
  name="Rules"
  play={async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelector("[data-rules-page-skeleton]"),
    ).toHaveAttribute("aria-busy", "true");
  }}
>
  {#snippet template()}
    <div class="bc-page-loading-skeletons__content">
      <RulesPageSkeleton />
    </div>
  {/snippet}
</Story>

<Story
  name="Sources"
  play={async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelector("[data-sources-page-skeleton]"),
    ).toHaveAttribute("aria-busy", "true");
  }}
>
  {#snippet template()}
    <div class="bc-page-loading-skeletons__content">
      <SourcesPageSkeleton />
    </div>
  {/snippet}
</Story>

<style>
  .bc-page-loading-skeletons__content {
    max-width: 56rem;
    padding: var(--ui-beancount-space-4);
  }

  .bc-page-loading-skeletons__dock,
  .bc-page-loading-skeletons__resource {
    border: 1px solid var(--ui-beancount-border);
    border-radius: var(--ui-beancount-radius-panel);
    background: var(--ui-beancount-surface-raised);
    padding: var(--ui-beancount-space-4);
    box-shadow: var(--ui-beancount-shadow-panel);
  }

  .bc-page-loading-skeletons__dock {
    width: 20rem;
  }

  .bc-page-loading-skeletons__route {
    max-width: 64rem;
    height: 34rem;
    overflow: hidden;
    border: 1px solid var(--ui-beancount-border);
    border-radius: var(--ui-beancount-radius-panel);
    background: var(--ui-beancount-surface);
  }

  .bc-page-loading-skeletons__resource {
    display: flex;
    max-width: 56rem;
    height: 20rem;
  }
</style>
