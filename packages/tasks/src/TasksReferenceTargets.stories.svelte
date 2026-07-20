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
            "Committed sanitised evidence from the reference research pass. These are target captures for structure and interaction, not implementation assets or visual-regression baselines.",
        },
      },
    },
  });
</script>

<script lang="ts">
  import { getReferenceTarget } from "./lib/story-data.js";
</script>

<Story name="Desktop — Inbox">
  {#snippet template()}
    <TasksReferenceTarget target={getReferenceTarget("desktop-inbox")} />
  {/snippet}
</Story>

<Story name="Desktop — Today">
  {#snippet template()}
    <TasksReferenceTarget target={getReferenceTarget("desktop-today")} />
  {/snippet}
</Story>

<Story name="Desktop — Tasks">
  {#snippet template()}
    <TasksReferenceTarget target={getReferenceTarget("desktop-tasks")} />
  {/snippet}
</Story>

<Story name="Desktop — Updates">
  {#snippet template()}
    <TasksReferenceTarget target={getReferenceTarget("desktop-updates")} />
  {/snippet}
</Story>

<Story name="Desktop — Lists">
  {#snippet template()}
    <TasksReferenceTarget target={getReferenceTarget("desktop-lists")} />
  {/snippet}
</Story>

<Story name="Desktop — List detail">
  {#snippet template()}
    <TasksReferenceTarget target={getReferenceTarget("desktop-list-detail")} />
  {/snippet}
</Story>

<Story name="Desktop — Task detail">
  {#snippet template()}
    <TasksReferenceTarget target={getReferenceTarget("desktop-task-detail")} />
  {/snippet}
</Story>

<Story name="Tablet landscape — Inbox">
  {#snippet template()}
    <TasksReferenceTarget
      target={getReferenceTarget("tablet-landscape-inbox")}
    />
  {/snippet}
</Story>

<Story name="Tablet portrait — Inbox">
  {#snippet template()}
    <TasksReferenceTarget
      target={getReferenceTarget("tablet-portrait-inbox")}
    />
  {/snippet}
</Story>

<Story name="Mobile — Inbox">
  {#snippet template()}
    <TasksReferenceTarget target={getReferenceTarget("mobile-inbox")} />
  {/snippet}
</Story>

<Story name="Interaction — Select then open detail">
  {#snippet template()}
    <TasksReferenceTarget target={getReferenceTarget("task-open-motion")} />
  {/snippet}
</Story>

<Story name="Interaction — Mobile row swipe">
  {#snippet template()}
    <TasksReferenceTarget target={getReferenceTarget("mobile-swipe-motion")} />
  {/snippet}
</Story>
