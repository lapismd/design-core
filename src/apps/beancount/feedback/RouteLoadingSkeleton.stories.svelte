<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect } from "storybook/test";
  import RouteLoadingSkeleton from "./RouteLoadingSkeleton.svelte";

  const { Story } = defineMeta({
    title: "Apps/Beancount/Feedback/Route Loading Skeleton",
    component: RouteLoadingSkeleton,
    parameters: {
      docs: {
        description: {
          component:
            "UI-owned route-level loading feedback. It keeps the page structure visible while data is loading and selects a query-specific layout for the query route. Use it at route boundaries rather than replacing an individual control with a page skeleton.",
        },
      },
    },
  });
</script>

<Story
  name="Shows a conventional ledger page"
  play={async ({ canvasElement }) => {
    const skeleton = canvasElement.querySelector(
      "[data-route-loading-skeleton]",
    );
    await expect(skeleton).toHaveAttribute("aria-busy", "true");
  }}
>
  {#snippet template()}
    <div class="bg-background h-[34rem] overflow-hidden rounded-xl border">
      <RouteLoadingSkeleton routePath="/journal" />
    </div>
  {/snippet}
</Story>

<Story
  name="Shows the query result layout"
  play={async ({ canvas }) => {
    await expect(canvas.getByLabelText("Loading query page")).toHaveAttribute(
      "aria-busy",
      "true",
    );
  }}
>
  {#snippet template()}
    <div class="bg-background h-[34rem] overflow-hidden rounded-xl border">
      <RouteLoadingSkeleton routePath="/query?query=balance" />
    </div>
  {/snippet}
</Story>
