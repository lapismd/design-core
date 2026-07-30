<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import AtSignIcon from "@lucide/svelte/icons/at-sign";
  import PaperclipIcon from "@lucide/svelte/icons/paperclip";
  import { Badge } from "@stevejuma/ui/shadcn/badge";
  import { Button } from "@stevejuma/ui/shadcn/button";
  import Composer from "./Composer.svelte";
  import ComposerDrawer from "./ComposerDrawer.svelte";

  const { Story } = defineMeta({
    title: "AI/Chat/Composer Drawer",
    component: ComposerDrawer,
    parameters: {
      docs: {
        description: {
          component:
            "Collapsible drawer panel that sits above the chat input inside ChatComposer. Pass it to the composer's drawer slot to show attachments, context chips, or any supplementary content. When count is provided the drawer gains a collapse toggle: collapsed state shows a badge and label, expanded state shows all children.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let collapsed = $state(true);
  let showcaseCollapsed = $state(false);
  let collapsibleCollapsed = $state(false);
  let progressCollapsed = $state(false);
  let feedbackCollapsed = $state(false);
  let selectedFeedback = $state<string | null>(null);

  const showcaseFiles = [
    "design-spec.pdf",
    "api-schema.json",
    "screenshot.png",
    "meeting-notes.md",
  ];

  const collapsibleFiles = [
    ...showcaseFiles,
    "test-results.csv",
    "deploy-log.txt",
  ];
</script>

<Story
  name="ASTRYX showcase"
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/ai/chat/composer-drawer/astryx-showcase-chromium-darwin.png",
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
    <div data-story="drawer-composer">
      <Composer value="" placeholder="Type a message..." onSubmit={() => {}}>
        {#snippet drawer()}
          <ComposerDrawer
            bind:collapsed={showcaseCollapsed}
            count={4}
            label="Attachments"
          >
            {#each showcaseFiles as file (file)}
              <Badge variant="secondary">{file} ×</Badge>
            {/each}
          </ComposerDrawer>
        {/snippet}
        {#snippet headerActions()}
          <Button size="icon-sm" variant="ghost" aria-label="Attach">
            <PaperclipIcon aria-hidden="true" />
          </Button>
        {/snippet}
      </Composer>
    </div>
  {/snippet}
</Story>

<Story
  name="Attachments"
  exportName="Attachments"
  parameters={{
    docs: {
      description: {
        story:
          "Drawer with two rows: a scrollable carousel of image thumbnails and a row of removable file tokens. Omit count to keep the drawer always expanded.",
      },
    },
    visualDelta: {
      images: [
        "/visual-baselines/ai/chat/composer-drawer/attachments-chromium-darwin.png",
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
    <div data-story="drawer-composer">
      <Composer value="" placeholder="Type a message..." onSubmit={() => {}}>
        {#snippet drawer()}
          <ComposerDrawer>
            <div data-story="attachment-grid">
              {#each ["valley.jpg", "mountain.jpg", "puppy.jpg", "bridge.jpg", "lakeside.jpg"] as file (file)}
                <span role="img" aria-label={file}>{file}</span>
              {/each}
            </div>
            <Badge variant="secondary">quarterly-report.pdf ×</Badge>
            <Badge variant="secondary">budget-forecast.xlsx ×</Badge>
          </ComposerDrawer>
        {/snippet}
      </Composer>
    </div>
  {/snippet}
</Story>

<Story
  name="Collapsible"
  exportName="Collapsible"
  parameters={{
    docs: {
      description: {
        story:
          "Drawer with many items and a collapse toggle. Pass count to enable the toggle; collapsed state shows a badge with the total count and a label.",
      },
    },
    visualDelta: {
      images: [
        "/visual-baselines/ai/chat/composer-drawer/collapsible-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
  tags={["visual-pending"]}
>
  {#snippet template()}
    <div data-story="drawer-composer">
      <Composer value="" onSubmit={() => {}}>
        {#snippet drawer()}
          <ComposerDrawer
            bind:collapsed={collapsibleCollapsed}
            count={6}
            label="Files"
          >
            {#each collapsibleFiles as file (file)}
              <Badge variant="secondary">{file} ×</Badge>
            {/each}
          </ComposerDrawer>
        {/snippet}
      </Composer>
    </div>
  {/snippet}
</Story>

<Story
  name="Feedback"
  exportName="Feedback"
  parameters={{
    docs: {
      description: {
        story:
          "Chat composer drawer with a feedback prompt and selectable lettered options. Use for user confirmation workflows that require explicit action before proceeding.",
      },
    },
    visualDelta: {
      images: [
        "/visual-baselines/ai/chat/composer-drawer/feedback-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
  tags={["visual-pending"]}
>
  {#snippet template()}
    <div data-story="drawer-composer">
      <Composer value="" onSubmit={() => {}}>
        {#snippet drawer()}
          <ComposerDrawer
            bind:collapsed={feedbackCollapsed}
            count={1}
            label="User feedback requested"
          >
            <div data-story="feedback-list">
              <strong>Do you want to proceed?</strong>
              {#each [{ key: "A", label: "Yes" }, { key: "B", label: "Yes, and don’t ask again for `git add` commands" }, { key: "C", label: "No, and tell me what to do differently" }] as option (option.key)}
                <button
                  type="button"
                  data-selected={selectedFeedback === option.key}
                  onclick={() => {
                    selectedFeedback = option.key;
                  }}
                >
                  <Badge
                    variant={selectedFeedback === option.key
                      ? "default"
                      : "secondary"}>{option.key}</Badge
                  >
                  {option.label}
                </button>
              {/each}
            </div>
          </ComposerDrawer>
        {/snippet}
      </Composer>
    </div>
  {/snippet}
</Story>

<Story
  name="With progress"
  exportName="WithProgress"
  parameters={{
    docs: {
      description: {
        story:
          "Drawer paired with a context progress bar in the header. Show context window usage when attachments consume part of the available token budget.",
      },
    },
    visualDelta: {
      images: [
        "/visual-baselines/ai/chat/composer-drawer/with-progress-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
  tags={["visual-pending"]}
>
  {#snippet template()}
    <div data-story="drawer-composer">
      <Composer value="" onSubmit={() => {}}>
        {#snippet drawer()}
          <ComposerDrawer
            bind:collapsed={progressCollapsed}
            count={3}
            label="Attachments"
          >
            {#each showcaseFiles.slice(0, 3) as file (file)}
              <Badge variant="secondary">{file} ×</Badge>
            {/each}
          </ComposerDrawer>
        {/snippet}
        {#snippet headerActions()}
          <Button size="icon-sm" variant="ghost" aria-label="Mention">
            <AtSignIcon aria-hidden="true" />
          </Button>
          <Button size="icon-sm" variant="ghost" aria-label="Attach">
            <PaperclipIcon aria-hidden="true" />
          </Button>
        {/snippet}
        {#snippet headerContext()}
          <progress value="42" max="100" aria-label="Context usage"></progress>
        {/snippet}
      </Composer>
    </div>
  {/snippet}
</Story>

<Story
  name="Expands attached context"
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Expand Attached context" }),
    );
    await expect(canvas.getByText("release-notes.md")).toBeVisible();
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/ai/chat/composer-drawer/expands-attached-context-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
  tags={["visual-pending"]}
>
  {#snippet template()}
    <div data-story="drawer-frame">
      <ComposerDrawer bind:collapsed count={2}>
        <p>release-notes.md</p>
        <p>changelog.md</p>
      </ComposerDrawer>
    </div>
  {/snippet}
</Story>

<style>
  :global([data-story="drawer-frame"]) {
    width: min(34rem, 90vw);
    border: 1px solid var(--border);
    border-radius: 0.75rem;
  }

  :global([data-story="drawer-composer"]) {
    width: min(30rem, 90vw);
  }

  :global([data-story="attachment-grid"]) {
    display: flex;
    width: 100%;
    gap: 0.25rem;
    overflow: hidden;
  }

  :global([data-story="attachment-grid"] > span) {
    display: grid;
    width: 4.5rem;
    height: 3.5rem;
    flex: 0 0 auto;
    place-items: center;
    border-radius: 0.5rem;
    background: var(--muted);
    color: var(--muted-foreground);
    font-size: 0.625rem;
  }

  :global([data-story="feedback-list"]) {
    display: flex;
    width: 100%;
    flex-direction: column;
    gap: 0.25rem;
  }

  :global([data-story="feedback-list"] strong) {
    padding: 0.375rem;
    font-size: 0.875rem;
  }

  :global([data-story="feedback-list"] button) {
    display: flex;
    width: 100%;
    align-items: center;
    gap: 0.5rem;
    border: 0;
    border-radius: 0.5rem;
    background: transparent;
    padding: 0.375rem;
    color: var(--foreground);
    text-align: left;
  }

  :global([data-story="feedback-list"] button[data-selected="true"]) {
    background: var(--accent);
  }

  :global([data-story="drawer-frame"] p) {
    margin: 0.25rem 0;
    font-size: 0.75rem;
  }
</style>
