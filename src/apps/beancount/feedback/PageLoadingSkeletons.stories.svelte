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
    <div class="max-w-4xl p-4">
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
    <div class="bg-card w-80 rounded-xl border p-4 shadow-sm">
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
    <div class="max-w-4xl p-4">
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
    <div class="max-w-4xl p-4">
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
    <div
      class="bg-background h-[34rem] max-w-5xl overflow-hidden rounded-xl border"
    >
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
    <div class="bg-card flex h-80 max-w-4xl rounded-xl border p-4 shadow-sm">
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
    <div class="max-w-4xl p-4">
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
    <div class="max-w-4xl p-4">
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
    <div class="max-w-4xl p-4">
      <SourcesPageSkeleton />
    </div>
  {/snippet}
</Story>
