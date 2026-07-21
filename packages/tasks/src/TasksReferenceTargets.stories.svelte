<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import TasksReferenceTarget from "./components/TasksReferenceTarget.svelte";

  const { Story } = defineMeta({
    title: "Tasks/Reference Targets",
    component: TasksReferenceTarget,
    tags: ["skip-visual"],
    parameters: {
      layout: "fullscreen",
      docs: {
        description: {
          component:
            "Committed Superlist Visual Delta captures (DSF 3). Pages are full-viewport; component entries are subject-clipped. Production stories resolve overlays via capture-matrix.json.",
        },
      },
    },
  });
</script>

<script lang="ts">
  import {
    getReferenceTarget,
    referenceVisualDelta,
  } from "./lib/story-data.js";
</script>

<Story
  name="Desktop — Inbox"
  parameters={{ visualDelta: referenceVisualDelta("page-desktop-inbox") }}
>
  {#snippet template()}
    <TasksReferenceTarget target={getReferenceTarget("page-desktop-inbox")} />
  {/snippet}
</Story>

<Story
  name="Desktop — Today"
  parameters={{ visualDelta: referenceVisualDelta("page-desktop-today") }}
>
  {#snippet template()}
    <TasksReferenceTarget target={getReferenceTarget("page-desktop-today")} />
  {/snippet}
</Story>

<Story
  name="Desktop — Tasks"
  parameters={{ visualDelta: referenceVisualDelta("page-desktop-tasks") }}
>
  {#snippet template()}
    <TasksReferenceTarget target={getReferenceTarget("page-desktop-tasks")} />
  {/snippet}
</Story>

<Story
  name="Desktop — Updates"
  parameters={{ visualDelta: referenceVisualDelta("page-desktop-updates") }}
>
  {#snippet template()}
    <TasksReferenceTarget target={getReferenceTarget("page-desktop-updates")} />
  {/snippet}
</Story>

<Story
  name="Desktop — Lists"
  parameters={{ visualDelta: referenceVisualDelta("page-desktop-lists") }}
>
  {#snippet template()}
    <TasksReferenceTarget target={getReferenceTarget("page-desktop-lists")} />
  {/snippet}
</Story>

<Story
  name="Desktop — List detail"
  parameters={{ visualDelta: referenceVisualDelta("page-desktop-list-detail") }}
>
  {#snippet template()}
    <TasksReferenceTarget
      target={getReferenceTarget("page-desktop-list-detail")}
    />
  {/snippet}
</Story>

<Story
  name="Desktop — Task detail"
  parameters={{ visualDelta: referenceVisualDelta("page-desktop-task-detail") }}
>
  {#snippet template()}
    <TasksReferenceTarget
      target={getReferenceTarget("page-desktop-task-detail")}
    />
  {/snippet}
</Story>

<Story
  name="Tablet landscape — Inbox"
  parameters={{
    visualDelta: referenceVisualDelta("page-tablet-landscape-inbox"),
  }}
>
  {#snippet template()}
    <TasksReferenceTarget
      target={getReferenceTarget("page-tablet-landscape-inbox")}
    />
  {/snippet}
</Story>

<Story
  name="Tablet portrait — Inbox"
  parameters={{
    visualDelta: referenceVisualDelta("page-tablet-portrait-inbox"),
  }}
>
  {#snippet template()}
    <TasksReferenceTarget
      target={getReferenceTarget("page-tablet-portrait-inbox")}
    />
  {/snippet}
</Story>

<Story
  name="Mobile — Inbox"
  parameters={{ visualDelta: referenceVisualDelta("page-mobile-inbox") }}
>
  {#snippet template()}
    <TasksReferenceTarget target={getReferenceTarget("page-mobile-inbox")} />
  {/snippet}
</Story>

<Story
  name="Mobile — Task detail"
  parameters={{ visualDelta: referenceVisualDelta("page-mobile-task-detail") }}
>
  {#snippet template()}
    <TasksReferenceTarget
      target={getReferenceTarget("page-mobile-task-detail")}
    />
  {/snippet}
</Story>

<Story
  name="Component — Task row"
  parameters={{ visualDelta: referenceVisualDelta("comp-task-row-default") }}
>
  {#snippet template()}
    <TasksReferenceTarget
      target={getReferenceTarget("comp-task-row-default")}
    />
  {/snippet}
</Story>

<Story
  name="Component — Task detail rail"
  parameters={{ visualDelta: referenceVisualDelta("comp-detail-open") }}
>
  {#snippet template()}
    <TasksReferenceTarget target={getReferenceTarget("comp-detail-open")} />
  {/snippet}
</Story>

<Story
  name="Interaction — Select then open detail"
  parameters={{ visualDelta: referenceVisualDelta("task-open-motion") }}
>
  {#snippet template()}
    <TasksReferenceTarget target={getReferenceTarget("task-open-motion")} />
  {/snippet}
</Story>

<Story
  name="Interaction — Mobile row swipe"
  parameters={{ visualDelta: referenceVisualDelta("mobile-swipe-motion") }}
>
  {#snippet template()}
    <TasksReferenceTarget target={getReferenceTarget("mobile-swipe-motion")} />
  {/snippet}
</Story>
