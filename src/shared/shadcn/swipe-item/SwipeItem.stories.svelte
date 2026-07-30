<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor } from "storybook/test";
  import ArchiveIcon from "@lucide/svelte/icons/archive";
  import EllipsisIcon from "@lucide/svelte/icons/ellipsis";
  import StarIcon from "@lucide/svelte/icons/star";
  import Trash2Icon from "@lucide/svelte/icons/trash-2";
  import { Button } from "../button/index.js";
  import * as SwipeItem from "./index.js";
  import { SWIPE_ITEM_WHEEL_IDLE_MS } from "./swipe-item-gesture.js";
  import type { SwipeItemOpen } from "./types.js";

  const { Story } = defineMeta({
    title: "Shadcn/Actions/Swipe Item",
    component: SwipeItem.Root,
    parameters: {
      docs: {
        description: {
          component:
            "Touch-, mouse-, and trackpad-friendly item that translates its content to reveal logical-edge actions, with an accessible click trigger and optional release-only full swipe.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let endOpen = $state<SwipeItemOpen>(null);
  let endResult = $state("No action selected");
  let bothOpen = $state<SwipeItemOpen>(null);
  let bothResult = $state("No action selected");
  let controlledOpen = $state<SwipeItemOpen>("end");
  let fullSwipeOpen = $state<SwipeItemOpen>(null);
  let fullSwipeResult = $state("Waiting for full swipe");
  let fullSwipeCount = $state(0);
  let wheelOpen = $state<SwipeItemOpen>(null);
  let wheelVerticalOpen = $state<SwipeItemOpen>(null);
  let visualStartOpen = $state<SwipeItemOpen>("start");
  let visualEndOpen = $state<SwipeItemOpen>("end");
  let armedOpen = $state<SwipeItemOpen>(null);

  function resetFullSwipe() {
    fullSwipeOpen = null;
    fullSwipeCount = 0;
    fullSwipeResult = "Waiting for full swipe";
  }

  async function waitForSwipeMeasurements(
    content: HTMLElement,
    actions: HTMLElement,
  ) {
    await waitFor(() => {
      expect(content.getBoundingClientRect().width).toBeGreaterThan(0);
      expect(actions.getBoundingClientRect().width).toBeGreaterThan(0);
    });
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => resolve()),
    );
  }

  async function dispatchWheelSequence(
    content: HTMLElement,
    deltas: Array<{ deltaX?: number; deltaY?: number }>,
  ) {
    for (const delta of deltas) {
      content.dispatchEvent(
        new WheelEvent("wheel", {
          deltaX: delta.deltaX ?? 0,
          deltaY: delta.deltaY ?? 0,
          bubbles: true,
          cancelable: true,
        }),
      );
    }
    await new Promise<void>((resolve) =>
      setTimeout(resolve, SWIPE_ITEM_WHEEL_IDLE_MS + 50),
    );
  }
</script>

<Story
  name="Reveals end actions by click"
  tags={["visual-approved"]}
  play={async ({ canvas }) => {
    const trigger = canvas.getByRole("button", {
      name: "Show message actions",
    });
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(
      canvas.getByRole("group", { name: "End actions" }),
    ).not.toHaveAttribute("aria-hidden", "true");
    await userEvent.click(canvas.getByRole("button", { name: "Archive" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("Archived");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  }}

  parameters={{
    visualDelta: {"images":["/visual-baselines/shadcn/swipe-item/reveals-end-actions-by-click-chromium-darwin.png"],"opacity":0.5,"colorInversion":false,"align":"canvas","placement":"right","passThresholdPercent":0.1},
  }}
>
  {#snippet template()}
    <div class="w-full max-w-md">
      <SwipeItem.Root bind:open={endOpen}>
        <SwipeItem.Actions
          side="end"
          aria-label="End actions"
          onFullSwipe={({ pointerType }) =>
            (endResult = `Archived with ${pointerType}`)}
        >
          <SwipeItem.Action
            onclick={() => (endResult = "Archived")}
            aria-label="Archive"
          >
            <ArchiveIcon data-icon="inline-start" />
            Archive
          </SwipeItem.Action>
          <SwipeItem.Action
            variant="destructive"
            onclick={() => (endResult = "Deleted")}
            aria-label="Delete"
          >
            <Trash2Icon data-icon="inline-start" />
            Delete
          </SwipeItem.Action>
        </SwipeItem.Actions>
        <SwipeItem.Content>
          <div class="flex min-h-16 items-center gap-3 px-4 py-3">
            <div class="min-w-0 flex-1">
              <div class="font-medium">Quarterly planning</div>
              <div class="text-muted-foreground truncate text-sm">
                Review the agenda and proposed milestones.
              </div>
            </div>
            <SwipeItem.Trigger
              side="end"
              aria-label="Show message actions"
              title="Show message actions"
            >
              <EllipsisIcon />
            </SwipeItem.Trigger>
          </div>
        </SwipeItem.Content>
      </SwipeItem.Root>
      <output class="text-muted-foreground mt-3 block text-sm">
        {endResult}
      </output>
    </div>
  {/snippet}
</Story>

<Story
  name="Leading and trailing actions"
  tags={["visual-approved"]}
  play={async ({ canvas }) => {
    const startTrigger = canvas.getByRole("button", {
      name: "Show priority actions",
    });
    const endTrigger = canvas.getByRole("button", {
      name: "Show edit actions",
    });
    await userEvent.click(startTrigger);
    await expect(startTrigger).toHaveAttribute("aria-expanded", "true");
    await userEvent.click(canvas.getByRole("button", { name: "Add star" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("Starred");
    await userEvent.click(endTrigger);
    await expect(endTrigger).toHaveAttribute("aria-expanded", "true");
    await userEvent.click(canvas.getByRole("button", { name: "Delete task" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("Deleted");
  }}

  parameters={{
    visualDelta: {"interactions":[{"id":"interaction-12-toHaveAttribute","label":"toHaveAttribute(\"aria-expanded\", \"true\")","src":"/visual-baselines/shadcn/swipe-item/leading-and-trailing-actions--interaction-12-toHaveAttribute-chromium-darwin.png"}]},
  }}
>
  {#snippet template()}
    <div class="w-full max-w-md">
      <SwipeItem.Root bind:open={bothOpen}>
        <SwipeItem.Actions side="start" aria-label="Priority actions">
          <SwipeItem.Action
            onclick={() => (bothResult = "Starred")}
            aria-label="Add star"
          >
            <StarIcon data-icon="inline-start" />
            Star
          </SwipeItem.Action>
        </SwipeItem.Actions>
        <SwipeItem.Actions side="end" aria-label="Edit actions">
          <SwipeItem.Action
            variant="destructive"
            onclick={() => (bothResult = "Deleted")}
            aria-label="Delete task"
          >
            <Trash2Icon data-icon="inline-start" />
            Delete
          </SwipeItem.Action>
        </SwipeItem.Actions>
        <SwipeItem.Content>
          <div class="flex min-h-16 items-center gap-2 px-3 py-3">
            <SwipeItem.Trigger
              side="start"
              aria-label="Show priority actions"
              title="Show priority actions"
            >
              <StarIcon />
            </SwipeItem.Trigger>
            <div class="min-w-0 flex-1">
              <div class="font-medium">Prepare release notes</div>
              <div
                class="text-muted-foreground text-sm"
                data-testid="gesture-ignore"
                data-swipe-item-gesture-ignore
              >
                Due tomorrow at 10:00
              </div>
            </div>
            <SwipeItem.Trigger
              side="end"
              aria-label="Show edit actions"
              title="Show edit actions"
            >
              <EllipsisIcon />
            </SwipeItem.Trigger>
          </div>
        </SwipeItem.Content>
      </SwipeItem.Root>
      <output class="text-muted-foreground mt-3 block text-sm">
        {bothResult}
      </output>
    </div>
  {/snippet}
</Story>

<Story
  name="Controlled and disabled states"
  tags={["visual-approved"]}
  play={async ({ canvas }) => {
    const closeButton = canvas.getByRole("button", {
      name: "Close controlled item",
    });
    await expect(
      canvas.getByRole("group", { name: "Controlled actions" }),
    ).not.toHaveAttribute("aria-hidden", "true");
    await userEvent.click(closeButton);
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Controlled item closed",
    );
    await expect(
      canvas.getByRole("button", { name: "Show disabled actions" }),
    ).toBeDisabled();
  }}

  parameters={{
    visualDelta: {"interactions":[{"id":"interaction-3-toHaveAttribute","label":"not.toHaveAttribute(\"aria-hidden\", \"true\")","src":"/visual-baselines/shadcn/swipe-item/controlled-and-disabled-states--interaction-3-toHaveAttribute-chromium-darwin.png"}]},
  }}
>
  {#snippet template()}
    <div class="flex w-full max-w-md flex-col gap-4">
      <SwipeItem.Root bind:open={controlledOpen}>
        <SwipeItem.Actions side="end" aria-label="Controlled actions">
          <SwipeItem.Action>Archive</SwipeItem.Action>
        </SwipeItem.Actions>
        <SwipeItem.Content>
          <div class="flex min-h-16 items-center gap-3 px-4 py-3">
            <div class="flex-1">Controlled item</div>
            <SwipeItem.Trigger side="end" aria-label="Show controlled actions">
              <EllipsisIcon />
            </SwipeItem.Trigger>
          </div>
        </SwipeItem.Content>
      </SwipeItem.Root>
      <Button
        variant="outline"
        onclick={() => (controlledOpen = null)}
        aria-label="Close controlled item"
      >
        Close controlled item
      </Button>
      <output class="text-muted-foreground text-sm">
        Controlled item {controlledOpen ? `${controlledOpen} open` : "closed"}
      </output>

      <SwipeItem.Root disabled>
        <SwipeItem.Actions side="end" aria-label="Disabled actions">
          <SwipeItem.Action>Archive</SwipeItem.Action>
        </SwipeItem.Actions>
        <SwipeItem.Content>
          <div class="flex min-h-16 items-center gap-3 px-4 py-3">
            <div class="flex-1">Disabled item</div>
            <SwipeItem.Trigger side="end" aria-label="Show disabled actions">
              <EllipsisIcon />
            </SwipeItem.Trigger>
          </div>
        </SwipeItem.Content>
      </SwipeItem.Root>
    </div>
  {/snippet}
</Story>

<Story
  name="Full swipe commits on release"
  tags={["visual-ready", "skip-visual"]}
  play={async ({ canvas }) => {
    const content = canvas.getByTestId("full-swipe-content");
    const actions = content
      .closest('[data-ui-part="root"]')
      ?.querySelector<HTMLElement>('[data-ui-part="actions"][data-side="end"]');
    await expect(actions).not.toBeNull();
    await waitForSwipeMeasurements(content, actions!);
    const bounds = content.getBoundingClientRect();
    const startX = bounds.left + bounds.width * 0.7;
    const y = bounds.top + bounds.height / 2;
    await userEvent.pointer([
      {
        keys: "[TouchA>]",
        target: content,
        coords: { clientX: startX, clientY: y },
      },
      {
        pointerName: "TouchA",
        target: content,
        coords: {
          clientX: startX - bounds.width * 1.5,
          clientY: y,
        },
      },
      {
        keys: "[/TouchA]",
        target: content,
        coords: {
          clientX: startX - bounds.width * 1.5,
          clientY: y,
        },
      },
    ]);
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Committed end with touch (1)",
    );
    await expect(content.closest('[data-ui-part="root"]')).toHaveAttribute(
      "data-state",
      "closed",
    );
  }}
>
  {#snippet template()}
    <div class="w-full max-w-md">
      <SwipeItem.Root bind:open={fullSwipeOpen}>
        <SwipeItem.Actions
          side="end"
          aria-label="Completion actions"
          onFullSwipe={({ side, pointerType }) => {
            fullSwipeCount += 1;
            fullSwipeResult = `Committed ${side} with ${pointerType} (${fullSwipeCount})`;
          }}
        >
          <SwipeItem.Action>Complete</SwipeItem.Action>
        </SwipeItem.Actions>
        <SwipeItem.Content data-testid="full-swipe-content">
          <div class="flex min-h-16 items-center gap-3 px-4 py-3">
            <div class="flex-1">Swipe fully to complete</div>
            <SwipeItem.Trigger side="end" aria-label="Show completion actions">
              <EllipsisIcon />
            </SwipeItem.Trigger>
          </div>
        </SwipeItem.Content>
      </SwipeItem.Root>
      <output class="text-muted-foreground mt-3 block text-sm">
        {fullSwipeResult}
      </output>
      <Button class="mt-3" variant="outline" onclick={resetFullSwipe}>
        Reset full swipe
      </Button>
    </div>
  {/snippet}
</Story>

<Story
  name="Trackpad wheel reveals end actions"
  play={async ({ canvas }) => {
    const content = canvas.getByTestId("wheel-content");
    const actions = content
      .closest('[data-ui-part="root"]')
      ?.querySelector<HTMLElement>('[data-ui-part="actions"][data-side="end"]');
    await expect(actions).not.toBeNull();
    await waitForSwipeMeasurements(content, actions!);
    const revealDistance = Math.max(
      96,
      actions!.getBoundingClientRect().width * 0.6,
    );
    await dispatchWheelSequence(
      content,
      Array.from({ length: 8 }, () => ({
        deltaX: revealDistance / 8,
        deltaY: 0,
      })),
    );
    await expect(
      canvas.getByRole("group", { name: "Wheel end actions" }),
    ).not.toHaveAttribute("aria-hidden", "true");
    await expect(
      canvas.getByRole("button", { name: "Show wheel actions" }),
    ).toHaveAttribute("aria-expanded", "true");
    await expect(content.closest('[data-ui-part="root"]')).toHaveAttribute(
      "data-open-side",
      "end",
    );
  }}

  parameters={{
    visualDelta: {"interactions":[{"id":"interaction-9-toHaveAttribute","label":"toHaveAttribute(\"aria-expanded\", \"true\")","src":"/visual-baselines/shadcn/swipe-item/trackpad-wheel-reveals-end-actions--interaction-9-toHaveAttribute-chromium-darwin.png"},{"id":"interaction-6-toHaveAttribute","label":"not.toHaveAttribute(\"aria-hidden\", \"true\")","src":"/visual-baselines/shadcn/swipe-item/trackpad-wheel-reveals-end-actions--interaction-6-toHaveAttribute-chromium-darwin.png"}]},
  }}

  tags={["visual-approved"]}
>
  {#snippet template()}
    <div class="w-full max-w-md">
      <SwipeItem.Root bind:open={wheelOpen}>
        <SwipeItem.Actions side="end" aria-label="Wheel end actions">
          <SwipeItem.Action aria-label="Archive">
            <ArchiveIcon data-icon="inline-start" />
            Archive
          </SwipeItem.Action>
        </SwipeItem.Actions>
        <SwipeItem.Content data-testid="wheel-content">
          <div class="flex min-h-16 items-center gap-3 px-4 py-3">
            <div class="min-w-0 flex-1">
              <div class="font-medium">Trackpad swipe target</div>
              <div class="text-muted-foreground text-sm">
                Horizontal wheel reveals end actions.
              </div>
            </div>
            <SwipeItem.Trigger side="end" aria-label="Show wheel actions">
              <EllipsisIcon />
            </SwipeItem.Trigger>
          </div>
        </SwipeItem.Content>
      </SwipeItem.Root>
    </div>
  {/snippet}
</Story>

<Story
  name="Vertical wheel does not reveal actions"
  play={async ({ canvas }) => {
    const content = canvas.getByTestId("wheel-vertical-content");
    const actions = content
      .closest('[data-ui-part="root"]')
      ?.querySelector<HTMLElement>('[data-ui-part="actions"][data-side="end"]');
    await expect(actions).not.toBeNull();
    await waitForSwipeMeasurements(content, actions!);
    await dispatchWheelSequence(
      content,
      Array.from({ length: 8 }, () => ({
        deltaX: 2,
        deltaY: 24,
      })),
    );
    await expect(
      canvas.getByRole("button", { name: "Show vertical wheel actions" }),
    ).toHaveAttribute("aria-expanded", "false");
    await expect(content.closest('[data-ui-part="root"]')).toHaveAttribute(
      "data-state",
      "closed",
    );
  }}

  tags={["skip-visual"]}
>
  {#snippet template()}
    <div class="w-full max-w-md">
      <SwipeItem.Root bind:open={wheelVerticalOpen}>
        <SwipeItem.Actions side="end" aria-label="Vertical wheel actions">
          <SwipeItem.Action aria-label="Archive">
            <ArchiveIcon data-icon="inline-start" />
            Archive
          </SwipeItem.Action>
        </SwipeItem.Actions>
        <SwipeItem.Content data-testid="wheel-vertical-content">
          <div class="flex min-h-16 items-center gap-3 px-4 py-3">
            <div class="min-w-0 flex-1">
              <div class="font-medium">Vertical scroll target</div>
              <div class="text-muted-foreground text-sm">
                Vertical-dominant wheel leaves the item closed.
              </div>
            </div>
            <SwipeItem.Trigger
              side="end"
              aria-label="Show vertical wheel actions"
            >
              <EllipsisIcon />
            </SwipeItem.Trigger>
          </div>
        </SwipeItem.Content>
      </SwipeItem.Root>
    </div>
  {/snippet}
</Story>

<Story
  name="Start actions open"
  tags={["visual-state", "visual-ready"]}
  play={async ({ canvas }) => {
    await expect(
      canvas.getByRole("group", { name: "Open start actions" }),
    ).not.toHaveAttribute("aria-hidden", "true");
    await expect(
      canvas.getByRole("button", { name: "Show open start actions" }),
    ).toHaveAttribute("aria-expanded", "true");
  }}
>
  {#snippet template()}
    <div class="w-full max-w-md">
      <SwipeItem.Root bind:open={visualStartOpen}>
        <SwipeItem.Actions side="start" aria-label="Open start actions">
          <SwipeItem.Action>
            <StarIcon data-icon="inline-start" />
            Star
          </SwipeItem.Action>
        </SwipeItem.Actions>
        <SwipeItem.Content>
          <div class="flex min-h-16 items-center gap-3 px-4 py-3">
            <SwipeItem.Trigger
              side="start"
              aria-label="Show open start actions"
            >
              <StarIcon />
            </SwipeItem.Trigger>
            <div class="min-w-0 flex-1">
              <div class="font-medium">Start actions revealed</div>
              <div class="text-muted-foreground text-sm">
                Content shifts toward the logical end.
              </div>
            </div>
          </div>
        </SwipeItem.Content>
      </SwipeItem.Root>
    </div>
  {/snippet}
</Story>

<Story
  name="End actions open"
  tags={["visual-state", "visual-ready"]}
  play={async ({ canvas }) => {
    await expect(
      canvas.getByRole("group", { name: "Open end actions" }),
    ).not.toHaveAttribute("aria-hidden", "true");
    await expect(
      canvas.getByRole("button", { name: "Show open end actions" }),
    ).toHaveAttribute("aria-expanded", "true");
  }}
>
  {#snippet template()}
    <div class="w-full max-w-md">
      <SwipeItem.Root bind:open={visualEndOpen}>
        <SwipeItem.Actions side="end" aria-label="Open end actions">
          <SwipeItem.Action variant="destructive">
            <Trash2Icon data-icon="inline-start" />
            Delete
          </SwipeItem.Action>
        </SwipeItem.Actions>
        <SwipeItem.Content>
          <div class="flex min-h-16 items-center gap-3 px-4 py-3">
            <div class="min-w-0 flex-1">
              <div class="font-medium">End actions revealed</div>
              <div class="text-muted-foreground text-sm">
                Content shifts toward the logical start.
              </div>
            </div>
            <SwipeItem.Trigger side="end" aria-label="Show open end actions">
              <EllipsisIcon />
            </SwipeItem.Trigger>
          </div>
        </SwipeItem.Content>
      </SwipeItem.Root>
    </div>
  {/snippet}
</Story>

<Story
  name="Full swipe armed"
  tags={["visual-state", "visual-ready"]}
  play={async ({ canvas }) => {
    const content = canvas.getByTestId("armed-content");
    const actions = content
      .closest('[data-ui-part="root"]')
      ?.querySelector<HTMLElement>('[data-ui-part="actions"][data-side="end"]');
    await expect(actions).not.toBeNull();
    await waitForSwipeMeasurements(content, actions!);
    const bounds = content.getBoundingClientRect();
    const startX = bounds.left + bounds.width * 0.7;
    const y = bounds.top + bounds.height / 2;
    await userEvent.pointer([
      {
        keys: "[TouchA>]",
        target: content,
        coords: { clientX: startX, clientY: y },
      },
      {
        pointerName: "TouchA",
        target: content,
        coords: {
          clientX: startX - bounds.width * 1.5,
          clientY: y,
        },
      },
    ]);
    await expect(content.closest('[data-ui-part="root"]')).toHaveAttribute(
      "data-armed-side",
      "end",
    );
  }}
>
  {#snippet template()}
    <div class="w-full max-w-md">
      <SwipeItem.Root bind:open={armedOpen}>
        <SwipeItem.Actions
          side="end"
          aria-label="Armed actions"
          onFullSwipe={() => {}}
        >
          <SwipeItem.Action variant="destructive">
            <Trash2Icon data-icon="inline-start" />
            Release to delete
          </SwipeItem.Action>
        </SwipeItem.Actions>
        <SwipeItem.Content data-testid="armed-content">
          <div class="flex min-h-16 items-center gap-3 px-4 py-3">
            <div class="flex-1">Full swipe threshold preview</div>
            <SwipeItem.Trigger side="end" aria-label="Show armed actions">
              <EllipsisIcon />
            </SwipeItem.Trigger>
          </div>
        </SwipeItem.Content>
      </SwipeItem.Root>
    </div>
  {/snippet}
</Story>
