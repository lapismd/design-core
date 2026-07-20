<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import TasksReferenceTarget from "./components/TasksReferenceTarget.svelte";

  const { Story } = defineMeta({
    title: "Tasks/Live Reference",
    component: TasksReferenceTarget,
    tags: ["skip-visual"],
    parameters: {
      layout: "fullscreen",
      docs: {
        description: {
          component:
            "Local-only live Superlist captures under `.reference-artifacts/live-chrome/`. These PNGs are gitignored and must never be committed — they may contain real account or list content. Use Visual Delta here for review; production stories keep synthetic `referenceVisualDelta` targets.",
        },
      },
    },
  });
</script>

<script lang="ts">
  import {
    getLiveReferenceTarget,
    liveReferenceVisualDelta,
  } from "./lib/story-data.js";
</script>

<Story
  name="Desktop — Inbox"
  exportName="DesktopInbox"
  parameters={{ visualDelta: liveReferenceVisualDelta("desktop-inbox") }}
>
  {#snippet template()}
    <TasksReferenceTarget target={getLiveReferenceTarget("desktop-inbox")} />
  {/snippet}
</Story>

<Story
  name="Desktop — Today"
  exportName="DesktopToday"
  parameters={{ visualDelta: liveReferenceVisualDelta("desktop-today") }}
>
  {#snippet template()}
    <TasksReferenceTarget target={getLiveReferenceTarget("desktop-today")} />
  {/snippet}
</Story>

<Story
  name="Desktop — Tasks"
  exportName="DesktopTasks"
  parameters={{ visualDelta: liveReferenceVisualDelta("desktop-tasks") }}
>
  {#snippet template()}
    <TasksReferenceTarget target={getLiveReferenceTarget("desktop-tasks")} />
  {/snippet}
</Story>

<Story
  name="Desktop — Updates"
  exportName="DesktopUpdates"
  parameters={{ visualDelta: liveReferenceVisualDelta("desktop-updates") }}
>
  {#snippet template()}
    <TasksReferenceTarget target={getLiveReferenceTarget("desktop-updates")} />
  {/snippet}
</Story>

<Story
  name="Desktop — Lists"
  exportName="DesktopLists"
  parameters={{ visualDelta: liveReferenceVisualDelta("desktop-lists") }}
>
  {#snippet template()}
    <TasksReferenceTarget target={getLiveReferenceTarget("desktop-lists")} />
  {/snippet}
</Story>

<Story
  name="Desktop — List detail"
  exportName="DesktopListDetail"
  parameters={{ visualDelta: liveReferenceVisualDelta("desktop-list-detail") }}
>
  {#snippet template()}
    <TasksReferenceTarget
      target={getLiveReferenceTarget("desktop-list-detail")}
    />
  {/snippet}
</Story>

<Story
  name="Desktop — Task detail"
  exportName="DesktopTaskDetail"
  parameters={{ visualDelta: liveReferenceVisualDelta("desktop-task-detail") }}
>
  {#snippet template()}
    <TasksReferenceTarget
      target={getLiveReferenceTarget("desktop-task-detail")}
    />
  {/snippet}
</Story>

<Story
  name="Tablet landscape — Inbox"
  exportName="TabletLandscapeInbox"
  parameters={{
    visualDelta: liveReferenceVisualDelta("tablet-landscape-inbox"),
  }}
>
  {#snippet template()}
    <TasksReferenceTarget
      target={getLiveReferenceTarget("tablet-landscape-inbox")}
    />
  {/snippet}
</Story>

<Story
  name="Tablet portrait — Inbox"
  exportName="TabletPortraitInbox"
  parameters={{
    visualDelta: liveReferenceVisualDelta("tablet-portrait-inbox"),
  }}
>
  {#snippet template()}
    <TasksReferenceTarget
      target={getLiveReferenceTarget("tablet-portrait-inbox")}
    />
  {/snippet}
</Story>

<Story
  name="Mobile — Inbox"
  exportName="MobileInbox"
  parameters={{ visualDelta: liveReferenceVisualDelta("mobile-inbox") }}
>
  {#snippet template()}
    <TasksReferenceTarget target={getLiveReferenceTarget("mobile-inbox")} />
  {/snippet}
</Story>

<Story
  name="Mobile — Task detail"
  exportName="MobileTaskDetail"
  parameters={{ visualDelta: liveReferenceVisualDelta("mobile-task-detail") }}
>
  {#snippet template()}
    <TasksReferenceTarget
      target={getLiveReferenceTarget("mobile-task-detail")}
    />
  {/snippet}
</Story>
