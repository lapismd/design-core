<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import ToolCalls from "./ToolCalls.svelte";

  const editDiffText = `--- a/src/utils/formatDate.ts
+++ b/src/utils/formatDate.ts
@@ -8,7 +8,11 @@
-export function formatDate(date: Date): string {
-  return date.toLocaleDateString();
-}
+export function formatDate(
+  date: Date,
+  locale = 'en-US',
+  options?: Intl.DateTimeFormatOptions,
+): string {
+  return new Intl.DateTimeFormat(locale, options).format(date);
+}`;

  const testOutputText = `$ yarn test
 PASS  src/utils/formatDate.test.ts
 PASS  src/components/DatePicker.test.tsx

Test Suites: 2 passed, 2 total
Tests:       14 passed, 14 total
Time:        1.8s`;

  const { Story } = defineMeta({
    title: "AI/Chat/Tool Calls",
    component: ToolCalls,
    parameters: {
      docs: {
        description: {
          component:
            "ChatToolCalls displays tool or function call invocations from an LLM response. Pass an array of calls and the component handles the rest: a single call renders inline, while multiple calls collapse into a summary with the latest call visible at the surface. Use it anywhere an AI agent shows what actions it took.",
        },
      },
    },
  });
</script>

<Story
  name="ASTRYX showcase"
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/ai/chat/tool-calls/astryx-showcase-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
  tags={["visual-approved"]}
>
  {#snippet template()}
    <ToolCalls
      defaultExpanded
      calls={[
        {
          name: "bash",
          target: "git diff --stat",
          status: "complete",
          duration: "340ms",
        },
        {
          name: "read",
          target: "src/utils/formatDate.ts",
          status: "complete",
          duration: "45ms",
        },
        {
          name: "edit",
          target: "src/utils/formatDate.ts",
          status: "complete",
          duration: "120ms",
          additions: 12,
          deletions: 3,
        },
      ]}
    />
  {/snippet}
</Story>

<Story
  name="Statuses"
  exportName="Statuses"
  parameters={{
    docs: {
      description: {
        story:
          "All four status states (pending, running, complete, and error) shown together in a single group.",
      },
    },
    visualDelta: {
      images: [
        "/visual-baselines/ai/chat/tool-calls/statuses-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
  tags={["visual-approved"]}
>
  {#snippet template()}
    <ToolCalls
      defaultExpanded
      calls={[
        {
          id: "pending",
          name: "bash",
          target: "yarn build",
          status: "pending",
        },
        { id: "running", name: "bash", target: "yarn test", status: "running" },
        {
          id: "complete",
          name: "edit",
          target: "src/App.tsx",
          status: "complete",
          duration: "120ms",
          additions: 8,
          deletions: 2,
        },
        {
          id: "error",
          name: "bash",
          target: "yarn lint",
          status: "error",
          duration: "0.8s",
          errorMessage: "3 lint errors found",
        },
      ]}
    />
  {/snippet}
</Story>

<Story
  name="Simple"
  exportName="Simple"
  parameters={{
    docs: {
      description: {
        story:
          "A single inline tool call above a collapsible multi-call group with diff stats. Shows both layouts side by side.",
      },
    },
    visualDelta: {
      images: [
        "/visual-baselines/ai/chat/tool-calls/simple-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
  tags={["visual-approved"]}
>
  {#snippet template()}
    <div data-story="tool-stack">
      <ToolCalls
        calls={[
          {
            name: "bash",
            target: "git status",
            status: "complete",
            duration: "1.2s",
          },
        ]}
      />
      <ToolCalls
        defaultExpanded
        calls={[
          {
            name: "read",
            target: "src/components/DataGrid.tsx",
            status: "complete",
            duration: "30ms",
          },
          {
            name: "edit",
            target: "src/components/DataGrid.tsx",
            status: "complete",
            duration: "85ms",
            additions: 24,
            deletions: 8,
          },
          {
            name: "edit",
            target: "src/components/DataGrid.test.tsx",
            status: "complete",
            duration: "60ms",
            additions: 45,
          },
        ]}
      />
    </div>
  {/snippet}
</Story>

<Story
  name="Expandable"
  exportName="Expandable"
  parameters={{
    docs: {
      description: {
        story:
          "Tool calls with expandable result details showing diffs and command output in code blocks. Click a row to reveal its result.",
      },
    },
    visualDelta: {
      images: [
        "/visual-baselines/ai/chat/tool-calls/expandable-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
  tags={["visual-approved"]}
>
  {#snippet template()}
    {#snippet editDiff()}
      <pre data-story="tool-code">{editDiffText}</pre>
    {/snippet}
    {#snippet testOutput()}
      <pre data-story="tool-code">{testOutputText}</pre>
    {/snippet}
    <ToolCalls
      defaultExpanded
      calls={[
        {
          name: "edit",
          target: "src/utils/formatDate.ts",
          status: "complete",
          duration: "85ms",
          node: "cli:remote-server",
          additions: 6,
          deletions: 3,
          detail: editDiff,
        },
        {
          name: "bash",
          target: "yarn test",
          status: "complete",
          duration: "1.8s",
          node: "cli:remote-server",
          detail: testOutput,
        },
        {
          name: "web_search",
          target: "Intl.DateTimeFormat locale options",
          status: "complete",
          duration: "1.2s",
        },
      ]}
    />
  {/snippet}
</Story>

<Story
  name="Expands call details"
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Show details for Read file" }),
    );
    await expect(canvas.getByText("Loaded 84 lines")).toBeVisible();
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/ai/chat/tool-calls/expands-call-details-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
  tags={["visual-approved"]}
>
  {#snippet template()}
    {#snippet readDetail()}
      <p data-story="tool-detail">Loaded 84 lines</p>
    {/snippet}
    <ToolCalls
      expanded
      calls={[
        {
          id: "read",
          name: "Read file",
          target: "release-notes.md",
          status: "complete",
          duration: "42 ms",
          detail: readDetail,
        },
        {
          id: "edit",
          name: "Update changelog",
          status: "running",
          additions: 12,
          deletions: 3,
        },
        {
          id: "test",
          name: "Run checks",
          status: "error",
          errorMessage: "One visual comparison failed.",
        },
      ]}
    />
  {/snippet}
</Story>

<Story
  name="Collapsed summary"
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/ai/chat/tool-calls/collapsed-summary-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
  tags={["visual-approved"]}
>
  {#snippet template()}
    <ToolCalls
      calls={[
        { name: "Search files", status: "pending" },
        { name: "Read source", status: "complete" },
      ]}
    />
  {/snippet}
</Story>

<style>
  :global([data-story="tool-detail"]) {
    margin: 0;
  }

  :global([data-story="tool-stack"]) {
    display: flex;
    width: min(36rem, 90vw);
    flex-direction: column;
    gap: 1rem;
  }

  :global([data-story="tool-code"]) {
    max-height: 50vh;
    overflow: auto;
    margin: 0;
    border-radius: 0.5rem;
    background: var(--muted);
    padding: 0.75rem;
    color: var(--foreground);
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    white-space: pre;
  }
</style>
