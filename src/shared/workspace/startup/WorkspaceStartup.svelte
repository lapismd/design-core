<script lang="ts" module>
  import type { WorkspaceAction } from "../core/types.js";

  export type WorkspaceStartupTaskStatus =
    | "pending"
    | "active"
    | "complete"
    | "failed";

  export interface WorkspaceStartupTask {
    id: string;
    label: string;
    status: WorkspaceStartupTaskStatus;
  }

  export interface WorkspaceStartupFailure {
    title: string;
    description: string;
    detail?: string;
    actions?: WorkspaceAction[];
  }

  export interface WorkspaceStartupProps {
    title?: string;
    tasks?: WorkspaceStartupTask[];
    failure?: WorkspaceStartupFailure | null;
    class?: string;
  }
</script>

<script lang="ts">
  import { Button } from "../../shadcn/button/index.js";
  import { Progress } from "../../shadcn/progress/index.js";
  import WorkspaceIcon from "../icon/WorkspaceIcon.svelte";
  import "./WorkspaceStartup.css";

  let {
    title = "Starting workspace",
    tasks = [],
    failure = null,
    class: className = "",
  }: WorkspaceStartupProps = $props();

  let failedTask = $derived(tasks.find((task) => task.status === "failed"));
  let activeIndex = $derived.by(() => {
    const running = tasks.findIndex(
      (task) => task.status === "active" || task.status === "failed",
    );
    if (running >= 0) return running;
    const pending = tasks.findIndex((task) => task.status === "pending");
    return pending >= 0 ? pending : Math.max(0, tasks.length - 1);
  });
  let currentStep = $derived(tasks.length === 0 ? 0 : activeIndex + 1);
  let progress = $derived(
    tasks.length === 0
      ? 0
      : tasks.every((task) => task.status === "complete")
        ? 100
        : Math.max(8, (currentStep / tasks.length) * 100),
  );
  let activeTask = $derived(tasks[activeIndex]);
  let hasFailure = $derived(failure !== null || failedTask !== undefined);
</script>

<section
  class={["ui-workspace-startup", className].filter(Boolean).join(" ")}
  data-ui-component="workspace-startup"
  data-ui-part="root"
  data-state={hasFailure ? "failed" : "loading"}
  aria-label={title}
>
  {#if hasFailure}
    <div
      class="ui-workspace-startup__failure"
      data-ui-part="failure"
      role="alert"
    >
      <div class="ui-workspace-startup__failure-header">
        <span
          class="ui-workspace-startup__failure-icon"
          data-ui-part="failure-icon"
        >
          <WorkspaceIcon name="triangle-alert" />
        </span>
        <div class="ui-workspace-startup__failure-copy">
          <h1 class="ui-workspace-startup__title" data-ui-part="title">
            {failure?.title ?? "Workspace startup failed"}
          </h1>
          <p
            class="ui-workspace-startup__failure-description"
            data-ui-part="failure-description"
          >
            {failure?.description ??
              `The workspace stopped while ${failedTask?.label ?? "starting"}.`}
          </p>
        </div>
      </div>

      {#if failedTask}
        <div
          class="ui-workspace-startup__failure-summary"
          data-ui-part="failure-summary"
        >
          <strong>{failedTask.label}</strong>
          <span>Last startup step</span>
        </div>
      {/if}

      {#if failure?.detail}
        <details
          class="ui-workspace-startup__failure-detail"
          data-ui-part="failure-detail"
        >
          <summary>Error details</summary>
          <pre>{failure.detail}</pre>
        </details>
      {/if}

      {#if failure?.actions?.length}
        <div
          class="ui-workspace-startup__failure-actions"
          data-ui-part="failure-actions"
        >
          {#each failure.actions as action, index (action.id)}
            <Button
              variant={index === 0 ? "default" : "outline"}
              disabled={action.disabled}
              onclick={(event) => void action.onSelect(event)}
            >
              {action.label}
            </Button>
          {/each}
        </div>
      {/if}
    </div>
  {:else}
    <div class="ui-workspace-startup__loading" data-ui-part="loading">
      <h1 class="ui-workspace-startup__title" data-ui-part="title">
        {title}
      </h1>
      <p
        class="ui-workspace-startup__message"
        data-ui-part="message"
        role="status"
        aria-live="polite"
      >
        {activeTask?.label ?? "Preparing workspace"}
      </p>

      {#if tasks.length}
        <p class="ui-workspace-startup__step" data-ui-part="step">
          Step {currentStep} of {tasks.length}
        </p>
      {/if}

      <Progress
        class="ui-workspace-startup__progress"
        value={progress}
        aria-label="Startup progress"
      />

      {#if tasks.length}
        <ol class="ui-workspace-startup__tasks" data-ui-part="tasks">
          {#each tasks as task, index (task.id)}
            <li
              class="ui-workspace-startup__task"
              data-ui-part="task"
              data-status={task.status}
              aria-current={task.status === "active" ? "step" : undefined}
            >
              <span
                class="ui-workspace-startup__task-state"
                data-ui-part="task-state"
              >
                {#if task.status === "complete"}
                  Done
                {:else if task.status === "active"}
                  Now
                {:else if task.status === "failed"}
                  Failed
                {:else}
                  {index + 1}
                {/if}
              </span>
              <span class="ui-workspace-startup__task-label">
                {task.label}
              </span>
            </li>
          {/each}
        </ol>
      {/if}
    </div>
  {/if}
</section>
