<script module lang="ts">
  import AtSignIcon from "@lucide/svelte/icons/at-sign";
  import MicIcon from "@lucide/svelte/icons/mic";
  import PaperclipIcon from "@lucide/svelte/icons/paperclip";
  import SettingsIcon from "@lucide/svelte/icons/settings";
  import SparklesIcon from "@lucide/svelte/icons/sparkles";
  import XIcon from "@lucide/svelte/icons/x";
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { Button } from "@stevejuma/ui/shadcn/button";
  import { expect, userEvent } from "storybook/test";
  import Composer from "./Composer.svelte";
  import ComposerDrawer from "./ComposerDrawer.svelte";
  import ComposerInput from "./ComposerInput.svelte";

  const { Story } = defineMeta({
    title: "AI/Chat/Composer",
    component: Composer,
    parameters: {
      docs: {
        description: {
          component:
            "Rich Svelte 5 composer shell with the same drawer, header, input, footer, send, elevation, streaming, and validation variants documented by ASTRYX.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let submitted = $state("");
  let fullFeaturedStreaming = $state(false);
  let streaming = $state(false);
</script>

{#snippet removableToken(label: string)}
  <span data-story="attachment-token">
    <span>{label}</span>
    <button type="button" aria-label={`Remove ${label}`}>
      <XIcon aria-hidden="true" />
    </button>
  </span>
{/snippet}

{#snippet footerControls()}
  <Button variant="ghost" size="sm">
    <SparklesIcon aria-hidden="true" />
    Auto
  </Button>
  <Button variant="ghost" size="sm">
    <SettingsIcon aria-hidden="true" />
    Settings
  </Button>
{/snippet}

<Story name="ASTRYX showcase">
  {#snippet template()}
    <div data-story="composer-reference">
      <Composer placeholder="Type a message…" onSubmit={() => {}} />
    </div>
  {/snippet}
</Story>

<Story name="Attachments">
  {#snippet template()}
    <div data-story="composer-reference">
      <Composer onSubmit={() => {}}>
        {#snippet drawer()}
          <ComposerDrawer count={6}>
            {@render removableToken("feature-prd.docx")}
            {@render removableToken("2026-roadmap.pdf")}
            {@render removableToken("user-flow.fig")}
            {@render removableToken("launch-plan.docx")}
            {@render removableToken("user-feedback.csv")}
            {@render removableToken("analytics-kpis.csv")}
          </ComposerDrawer>
        {/snippet}
      </Composer>
    </div>
  {/snippet}
</Story>

<Story name="Flat">
  {#snippet template()}
    <div data-story="composer-reference" data-with-label>
      <p>
        elevation="none" — flat, with a text-input-style border and focus ring
      </p>
      <Composer elevation="none" onSubmit={() => {}}>
        {#snippet footerActions()}{@render footerControls()}{/snippet}
        {#snippet sendActions()}
          <Button variant="ghost" size="icon-sm" aria-label="Microphone">
            <MicIcon aria-hidden="true" />
          </Button>
        {/snippet}
      </Composer>
    </div>
  {/snippet}
</Story>

<Story name="Footer actions">
  {#snippet template()}
    <div data-story="composer-reference" data-with-label>
      <p>Model selector and settings dropdowns</p>
      <Composer onSubmit={() => {}}>
        {#snippet footerActions()}{@render footerControls()}{/snippet}
        {#snippet sendActions()}
          <Button variant="ghost" size="icon-sm" aria-label="Microphone">
            <MicIcon aria-hidden="true" />
          </Button>
        {/snippet}
      </Composer>
    </div>
  {/snippet}
</Story>

<Story name="Full featured">
  {#snippet template()}
    <div data-story="composer-reference" data-with-label>
      <p>All slots populated</p>
      <Composer
        placeholder="Ask me anything..."
        isStopShown={fullFeaturedStreaming}
        onSubmit={() => {
          fullFeaturedStreaming = true;
        }}
        onStop={() => {
          fullFeaturedStreaming = false;
        }}
      >
        {#snippet drawer()}
          <ComposerDrawer count={5}>
            {@render removableToken("design-spec.pdf")}
            {@render removableToken("requirements.docx")}
            {@render removableToken("wireframes.fig")}
            {@render removableToken("api-spec.yaml")}
            {@render removableToken("user-research.csv")}
          </ComposerDrawer>
        {/snippet}
        {#snippet headerActions()}
          <Button variant="ghost" size="icon-sm" aria-label="Mention">
            <AtSignIcon aria-hidden="true" />
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="Attach file">
            <PaperclipIcon aria-hidden="true" />
          </Button>
        {/snippet}
        {#snippet headerContext()}
          <label data-story="context-progress">
            <span>Context window</span>
            <progress aria-label="Context window" value="50" max="100"
            ></progress>
          </label>
        {/snippet}
        {#snippet input()}
          <ComposerInput style="min-height: 2.75rem" />
        {/snippet}
        {#snippet footerActions()}{@render footerControls()}{/snippet}
        {#snippet sendActions()}
          <Button variant="ghost" size="icon-sm" aria-label="Microphone">
            <MicIcon aria-hidden="true" />
          </Button>
        {/snippet}
      </Composer>
    </div>
  {/snippet}
</Story>

<Story name="Simple">
  {#snippet template()}
    <div data-story="composer-reference">
      <Composer onSubmit={() => {}} />
    </div>
  {/snippet}
</Story>

<Story name="Streaming">
  {#snippet template()}
    <div data-story="composer-reference" data-with-label>
      <p>
        {streaming
          ? "Streaming — click stop to cancel"
          : "Send a message to start streaming"}
      </p>
      <Composer
        value={streaming ? "" : "Click the send button to start streaming."}
        isStopShown={streaming}
        onSubmit={() => {
          streaming = true;
        }}
        onStop={() => {
          streaming = false;
        }}
        placeholder="Send a message to start streaming..."
      />
    </div>
  {/snippet}
</Story>

<Story name="Validation">
  {#snippet template()}
    <div data-story="composer-validation">
      <section>
        <p>Error message (with top position)</p>
        <Composer
          statusPosition="top"
          status={{
            type: "error",
            message: "Failed to send message. Please try again.",
          }}
          onSubmit={() => {}}
        />
      </section>
      <section>
        <p>Warning message (with bottom position)</p>
        <Composer
          status={{
            type: "warning",
            message: "Context window is 90% full.",
          }}
          onSubmit={() => {}}
        />
      </section>
    </div>
  {/snippet}
</Story>

<Story
  name="Submits from the keyboard"
  play={async ({ canvas }) => {
    const input = canvas.getByRole("combobox", { name: "Message" });
    await userEvent.click(input);
    await userEvent.type(input, "Ship the release notes{Enter}");
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Ship the release notes",
    );
  }}
>
  {#snippet template()}
    <div data-story="composer-reference" data-with-label>
      <Composer
        onSubmit={(value) => {
          submitted = value;
        }}
      >
        {#snippet footerActions()}
          <Button variant="ghost" size="icon-sm" aria-label="Attach file">
            <PaperclipIcon aria-hidden="true" />
          </Button>
        {/snippet}
      </Composer>
      <output aria-live="polite">
        {submitted || "Nothing submitted"}
      </output>
    </div>
  {/snippet}
</Story>

<style>
  :global([data-story="composer-reference"]) {
    display: flex;
    width: min(28.125rem, 90vw);
    flex-direction: column;
    gap: 0.5rem;
  }

  :global([data-story="composer-reference"] > p),
  :global([data-story="composer-validation"] p),
  :global([data-story="composer-reference"] output) {
    margin: 0;
    color: var(--muted-foreground);
    font-size: 0.75rem;
    line-height: 1rem;
  }

  :global([data-story="composer-validation"]) {
    display: flex;
    width: min(28.125rem, 90vw);
    flex-direction: column;
    gap: 1rem;
  }

  :global([data-story="composer-validation"] section) {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  :global([data-story="attachment-token"]) {
    display: inline-flex;
    max-width: 100%;
    align-items: center;
    gap: 0.25rem;
    border: 1px solid var(--border);
    border-radius: 999px;
    background: var(--secondary);
    padding: 0.125rem 0.25rem 0.125rem 0.5rem;
    color: var(--secondary-foreground);
    font-size: 0.75rem;
    line-height: 1rem;
  }

  :global([data-story="attachment-token"] button) {
    display: grid;
    width: 1rem;
    height: 1rem;
    place-items: center;
    border: 0;
    border-radius: 50%;
    background: transparent;
    padding: 0;
    color: inherit;
  }

  :global([data-story="attachment-token"] svg) {
    width: 0.75rem;
    height: 0.75rem;
  }

  :global([data-story="context-progress"]) {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }

  :global([data-story="context-progress"] progress) {
    width: 5rem;
    height: 0.25rem;
  }
</style>
