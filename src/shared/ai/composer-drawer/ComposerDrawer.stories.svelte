<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import AtSignIcon from "@lucide/svelte/icons/at-sign";
  import PaperclipIcon from "@lucide/svelte/icons/paperclip";
  import XIcon from "@lucide/svelte/icons/x";
  import { Badge } from "@lapismd/design-core/shadcn/badge";
  import { Button } from "@lapismd/design-core/shadcn/button";
  import Composer from "../composer/Composer.svelte";
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
  let selectedDisabledFeedback = $state<string | null>(null);

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

{#snippet removableToken(label: string)}
  <span data-ui-part="attachment-chip">
    <span>{label}</span>
    <button
      type="button"
      data-ui-part="attachment-remove"
      aria-label={`Remove ${label}`}
    >
      <XIcon aria-hidden="true" />
    </button>
  </span>
{/snippet}

<Story
  name="ASTRYX showcase"
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/ai/composer-drawer/astryx-showcase-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
  tags={["visual-pending"]}
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
              {@render removableToken(file)}
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
  name="Feedback while disabled"
  exportName="FeedbackWhileDisabled"
  parameters={{
    docs: {
      description: {
        story:
          "A consumer may keep a feedback drawer interactive while the composer body is disabled during an active agent turn.",
      },
    },
    visualDelta: {
      images: [
        "/visual-baselines/ai/composer-drawer/feedback-while-disabled-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
  tags={["visual-pending"]}
  play={async ({ canvas }) => {
    const choice = canvas.getByRole("button", { name: /Yes, proceed/ });
    await expect(choice).toBeEnabled();
    await userEvent.click(choice);
    await expect(choice).toHaveAttribute("data-selected", "true");
  }}
>
  {#snippet template()}
    <div data-story="drawer-composer">
      <Composer
        value=""
        disabled
        interactiveDrawerWhenDisabled
        onSubmit={() => {}}
      >
        {#snippet drawer()}
          <ComposerDrawer count={1} label="User feedback requested">
            <div data-ui-part="feedback-list" data-story="feedback-list">
              <strong>Do you want to proceed?</strong>
              <button
                type="button"
                data-ui-part="feedback-option"
                data-selected={selectedDisabledFeedback === "yes"}
                onclick={() => {
                  selectedDisabledFeedback = "yes";
                }}
              >
                <Badge
                  variant={selectedDisabledFeedback === "yes"
                    ? "default"
                    : "secondary"}>A</Badge
                >
                Yes, proceed
              </button>
            </div>
          </ComposerDrawer>
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
      images: ["/visual-baselines/ai/composer-drawer/attachments-chromium.png"],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
  tags={["visual-pending"]}
  play={async ({ canvas, canvasElement }) => {
    const chip = canvas
      .getByText("quarterly-report.pdf")
      .closest('[data-ui-part="attachment-chip"]') as HTMLElement | null;
    const remove = canvas.getByRole("button", {
      name: "Remove quarterly-report.pdf",
    });
    const drawer = canvasElement.querySelector(
      '[data-ui-component="ai-chat-composer-drawer"]',
    ) as HTMLElement | null;
    expect(chip).not.toBeNull();
    expect(drawer).not.toBeNull();
    const rest = getComputedStyle(chip!);
    expect(rest.backgroundColor).not.toBe(
      getComputedStyle(drawer!).backgroundColor,
    );
    expect(rest.borderTopLeftRadius).not.toBe("999px");
    await userEvent.hover(chip!);
    expect(getComputedStyle(chip!).backgroundColor).not.toBe(rest.backgroundColor);
    const removeRest = getComputedStyle(remove).backgroundColor;
    await userEvent.hover(remove);
    expect(getComputedStyle(remove).backgroundColor).not.toBe(removeRest);
  }}
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
            {@render removableToken("quarterly-report.pdf")}
            {@render removableToken("budget-forecast.xlsx")}
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
      images: ["/visual-baselines/ai/composer-drawer/collapsible-chromium.png"],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
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
              {@render removableToken(file)}
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
      images: ["/visual-baselines/ai/composer-drawer/feedback-chromium.png"],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
  tags={["visual-approved"]}
  play={async ({ canvas, canvasElement }) => {
    const option = canvas.getByRole("button", { name: "A Yes" });
    const selectedOption = canvas.getByRole("button", {
      name: /don’t ask again/,
    });
    const drawer = canvasElement.querySelector(
      '[data-ui-component="ai-chat-composer-drawer"]',
    ) as HTMLElement | null;
    expect(drawer).not.toBeNull();
    const drawerFill = getComputedStyle(drawer!).backgroundColor;
    const rest = getComputedStyle(option).backgroundColor;
    const { page } = await import("vitest/browser");
    await page.elementLocator(option).hover();
    const hovered = getComputedStyle(option).backgroundColor;
    expect(hovered).not.toBe(rest);
    expect(hovered).not.toBe(drawerFill);
    const selectedRest = getComputedStyle(selectedOption).backgroundColor;
    await userEvent.click(selectedOption);
    await expect(selectedOption).toHaveAttribute("data-selected", "true");
    const selected = getComputedStyle(selectedOption).backgroundColor;
    expect(selected).not.toBe(selectedRest);
    expect(selected).not.toBe(drawerFill);
  }}
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
            <div data-ui-part="feedback-list" data-story="feedback-list">
              <strong>Do you want to proceed?</strong>
              {#each [{ key: "A", label: "Yes" }, { key: "B", label: "Yes, and don’t ask again for `git add` commands" }, { key: "C", label: "No, and tell me what to do differently" }] as option (option.key)}
                <button
                  type="button"
                  data-ui-part="feedback-option"
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
        "/visual-baselines/ai/composer-drawer/with-progress-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
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
              {@render removableToken(file)}
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
    await expect(canvas.getByText(/release-notes\.md/)).toBeVisible();
  }}
  parameters={{
    visualDelta: {
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
  tags={["visual-pending"]}
>
  {#snippet template()}
    <div data-story="drawer-composer">
      <Composer value="" placeholder="Type a message..." onSubmit={() => {}}>
        {#snippet drawer()}
          <ComposerDrawer bind:collapsed count={2}>
            {@render removableToken("release-notes.md")}
            {@render removableToken("changelog.md")}
          </ComposerDrawer>
        {/snippet}
      </Composer>
    </div>
  {/snippet}
</Story>

<style>
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

  :global([data-story="feedback-list"] strong) {
    padding: 0.375rem;
    font-size: 0.875rem;
  }
</style>
