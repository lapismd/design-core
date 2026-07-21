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
            "Committed Superlist browser captures of the Tasks UI Reference fixture list. Full-page Visual Delta targets — separate from Playwright component baselines under /visual-baselines/tasks/.",
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
  parameters={{ visualDelta: referenceVisualDelta("desktop-inbox") }}
>
  {#snippet template()}
    <TasksReferenceTarget target={getReferenceTarget("desktop-inbox")} />
  {/snippet}
</Story>

<Story
  name="Desktop — Today"
  parameters={{ visualDelta: referenceVisualDelta("desktop-today") }}
>
  {#snippet template()}
    <TasksReferenceTarget target={getReferenceTarget("desktop-today")} />
  {/snippet}
</Story>

<Story
  name="Desktop — Tasks"
  parameters={{ visualDelta: referenceVisualDelta("desktop-tasks") }}
>
  {#snippet template()}
    <TasksReferenceTarget target={getReferenceTarget("desktop-tasks")} />
  {/snippet}
</Story>

<Story
  name="Desktop — Updates"
  parameters={{ visualDelta: referenceVisualDelta("desktop-updates") }}
>
  {#snippet template()}
    <TasksReferenceTarget target={getReferenceTarget("desktop-updates")} />
  {/snippet}
</Story>

<Story
  name="Desktop — Lists"
  parameters={{ visualDelta: referenceVisualDelta("desktop-lists") }}
>
  {#snippet template()}
    <TasksReferenceTarget target={getReferenceTarget("desktop-lists")} />
  {/snippet}
</Story>

<Story
  name="Desktop — List detail"
  parameters={{ visualDelta: referenceVisualDelta("desktop-list-detail") }}
>
  {#snippet template()}
    <TasksReferenceTarget target={getReferenceTarget("desktop-list-detail")} />
  {/snippet}
</Story>

<Story
  name="Desktop — Task detail"
  parameters={{ visualDelta: referenceVisualDelta("desktop-task-detail") }}
>
  {#snippet template()}
    <TasksReferenceTarget target={getReferenceTarget("desktop-task-detail")} />
  {/snippet}
</Story>

<Story
  name="Tablet landscape — Inbox"
  parameters={{
    visualDelta: referenceVisualDelta("tablet-landscape-inbox"),
  }}
>
  {#snippet template()}
    <TasksReferenceTarget
      target={getReferenceTarget("tablet-landscape-inbox")}
    />
  {/snippet}
</Story>

<Story
  name="Tablet portrait — Inbox"
  parameters={{ visualDelta: referenceVisualDelta("tablet-portrait-inbox") }}
>
  {#snippet template()}
    <TasksReferenceTarget
      target={getReferenceTarget("tablet-portrait-inbox")}
    />
  {/snippet}
</Story>

<Story
  name="Mobile — Inbox"
  parameters={{ visualDelta: referenceVisualDelta("mobile-inbox") }}
>
  {#snippet template()}
    <TasksReferenceTarget target={getReferenceTarget("mobile-inbox")} />
  {/snippet}
</Story>

<Story
  name="Mobile — Task detail"
  parameters={{ visualDelta: referenceVisualDelta("mobile-task-detail") }}
>
  {#snippet template()}
    <TasksReferenceTarget target={getReferenceTarget("mobile-task-detail")} />
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
