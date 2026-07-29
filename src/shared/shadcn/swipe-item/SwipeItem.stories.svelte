<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import ArchiveIcon from "@lucide/svelte/icons/archive";
  import EllipsisIcon from "@lucide/svelte/icons/ellipsis";
  import StarIcon from "@lucide/svelte/icons/star";
  import Trash2Icon from "@lucide/svelte/icons/trash-2";
  import { Button } from "../button/index.js";
  import * as SwipeItem from "./index.js";
  import type { SwipeItemOpen } from "./types.js";

  const { Story } = defineMeta({
    title: "Shadcn/Actions/Swipe Item",
    component: SwipeItem.Root,
    parameters: {
      docs: {
        description: {
          component:
            "Touch- and mouse-friendly item that translates its content to reveal logical-edge actions, with an accessible click trigger and optional release-only full swipe.",
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
  let visualStartOpen = $state<SwipeItemOpen>("start");
  let visualEndOpen = $state<SwipeItemOpen>("end");
  let armedOpen = $state<SwipeItemOpen>(null);

  function resetFullSwipe() {
    fullSwipeOpen = null;
    fullSwipeCount = 0;
    fullSwipeResult = "Waiting for full swipe";
  }

  function dispatchTouch(
    target: EventTarget,
    type: "pointerdown" | "pointermove" | "pointerup",
    options: {
      pointerId: number;
      clientX: number;
      clientY: number;
    },
  ) {
    target.dispatchEvent(
      new PointerEvent(type, {
        bubbles: true,
        cancelable: true,
        pointerId: options.pointerId,
        pointerType: "touch",
        isPrimary: true,
        button: 0,
        clientX: options.clientX,
        clientY: options.clientY,
      }),
    );
  }
</script>

<Story
  name="Reveals end actions by click"
  tags={["visual-ready"]}
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
  tags={["visual-ready"]}
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
  tags={["visual-ready"]}
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
  tags={["visual-ready"]}
  play={async ({ canvas }) => {
    const content = canvas.getByTestId("full-swipe-content");
    const bounds = content.getBoundingClientRect();
    const pointerId = 81;
    const startX = bounds.left + bounds.width * 0.7;
    const y = bounds.top + bounds.height / 2;
    dispatchTouch(content, "pointerdown", {
      pointerId,
      clientX: startX,
      clientY: y,
    });
    dispatchTouch(document, "pointermove", {
      pointerId,
      clientX: startX - bounds.width * 1.5,
      clientY: y,
    });
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Waiting for full swipe",
    );
    dispatchTouch(document, "pointerup", {
      pointerId,
      clientX: startX - bounds.width * 1.5,
      clientY: y,
    });
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
    const bounds = content.getBoundingClientRect();
    const pointerId = 82;
    const startX = bounds.left + bounds.width * 0.7;
    const y = bounds.top + bounds.height / 2;
    dispatchTouch(content, "pointerdown", {
      pointerId,
      clientX: startX,
      clientY: y,
    });
    dispatchTouch(document, "pointermove", {
      pointerId,
      clientX: startX - bounds.width * 1.5,
      clientY: y,
    });
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
