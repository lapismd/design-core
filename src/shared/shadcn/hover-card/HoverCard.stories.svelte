<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor, within } from "storybook/test";
  import { Button } from "../button/index.js";
  import * as HoverCard from "./index.js";

  const source = `<script lang="ts">
  import * as HoverCard from "@lapismd/design-core/shadcn/hover-card";
<${"/"}script>

<HoverCard.Root>
  <HoverCard.Trigger>
    {#snippet child({ props })}
      <button {...props} type="button">Inspect profile</button>
    {/snippet}
  </HoverCard.Trigger>
  <HoverCard.Content>
    <p>@lapismd</p>
    <a href="#hover-card-details">Open details</a>
  </HoverCard.Content>
</HoverCard.Root>`;

  const { Story } = defineMeta({
    title: "Shadcn/Overlays/Hover Card",
    component: HoverCard.Root,
    parameters: {
      docs: {
        description: {
          component:
            "Interactive hover and keyboard-focus preview using Bits UI LinkPreview defaults: 700ms to open and 300ms to close.",
        },
        source: { code: source, language: "html", type: "code" },
      },
    },
  });

  const sleep = (milliseconds: number) =>
    new Promise((resolve) => setTimeout(resolve, milliseconds));
</script>

<Story
  name="Interactive preview"
  tags={["visual-pending", "test"]}
  play={async ({ canvas, canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: "Inspect profile" });

    await userEvent.hover(trigger);
    await sleep(550);
    await expect(page.queryByRole("link", { name: "Open details" })).toBeNull();
    await waitFor(
      () =>
        expect(page.getByRole("link", { name: "Open details" })).toBeVisible(),
      { timeout: 700 },
    );

    const details = page.getByRole("link", { name: "Open details" });
    await userEvent.unhover(trigger);
    await userEvent.hover(details);
    await sleep(350);
    await expect(details).toBeVisible();

    await userEvent.unhover(details);
    await waitFor(
      () =>
        expect(page.queryByRole("link", { name: "Open details" })).toBeNull(),
      {
        timeout: 800,
      },
    );

    trigger.focus();
    await expect(trigger).toHaveFocus();
    await waitFor(
      () =>
        expect(page.getByRole("link", { name: "Open details" })).toBeVisible(),
      { timeout: 1_000 },
    );
    await userEvent.keyboard("{Escape}");
  }}
>
  {#snippet template()}
    <div class="ui-hover-card-story">
      <HoverCard.Root>
        <HoverCard.Trigger>
          {#snippet child({ props })}
            <Button {...props} variant="outline">Inspect profile</Button>
          {/snippet}
        </HoverCard.Trigger>
        <HoverCard.Content class="ui-hover-card-story__content">
          <strong>@lapismd</strong>
          <p>Reusable workspace and application UI primitives.</p>
          <a id="hover-card-details" href="#hover-card-details">Open details</a>
        </HoverCard.Content>
      </HoverCard.Root>
    </div>
  {/snippet}
</Story>

<Story
  name="Constrained overlay"
  tags={["visual-pending", "test"]}
  parameters={{
    docs: { source: { code: source, language: "html", type: "code" } },
  }}
>
  {#snippet template()}
    <div class="ui-hover-card-story ui-hover-card-story--constrained">
      <div class="ui-hover-card-story__pane">
        <HoverCard.Root>
          <HoverCard.Trigger>
            {#snippet child({ props })}
              <Button {...props} variant="outline">Preview across pane</Button>
            {/snippet}
          </HoverCard.Trigger>
          <HoverCard.Content class="ui-hover-card-story__wide-content">
            <strong>Topmost preview</strong>
            <p>This content crosses the pane boundary without being clipped.</p>
            <button type="button">Interactive action</button>
          </HoverCard.Content>
        </HoverCard.Root>
      </div>
      <div class="ui-hover-card-story__editor" data-testid="adjacent-editor">
        Adjacent editor surface
      </div>
    </div>
  {/snippet}
</Story>

<style>
  .ui-hover-card-story {
    min-height: 18rem;
    padding: 4rem;
    background: var(--ui-workspace-background, var(--background));
  }

  :global(.ui-hover-card-story__content) {
    display: grid;
    gap: 0.5rem;
  }

  :global(.ui-hover-card-story__content p),
  :global(.ui-hover-card-story__wide-content p) {
    margin: 0;
  }

  .ui-hover-card-story--constrained {
    position: relative;
    display: grid;
    grid-template-columns: 11rem minmax(0, 1fr);
    min-height: 24rem;
    padding: 0;
    overflow: hidden;
  }

  .ui-hover-card-story__pane {
    display: grid;
    place-items: center;
    overflow: hidden;
    border-right: 1px solid var(--ui-workspace-border, var(--border));
  }

  .ui-hover-card-story__editor {
    position: relative;
    z-index: var(--ui-workspace-overlay-z-index, 50);
    padding: 2rem;
    background: var(--ui-workspace-muted, var(--muted));
  }

  :global(.ui-hover-card-story__wide-content) {
    display: grid;
    width: min(26rem, calc(100vw - 2rem));
    gap: 0.5rem;
  }
</style>
