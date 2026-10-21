<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor } from "storybook/test";
  import MarkdownComposer from "./MarkdownComposer.svelte";
  import ComposerDrawer from "../../ai/composer-drawer/ComposerDrawer.svelte";
  import { Button } from "../../shadcn/button/index.js";
  const { Story } = defineMeta({
    title: "Chat/Markdown Composer",
    component: MarkdownComposer,
    tags: ["visual-pending", "!autodocs"],
  });
</script>

<script lang="ts">
  let collapsed = $state(false);
  let value = $state("Retain this draft.");
  let count = $state(2);
</script>

<Story
  name="Attached drawer shares the framed composer"
  play={async ({ canvas, canvasElement }) => {
    const collapse = await canvas.findByRole("button", {
      name: "Collapse Attachments",
    });
    const composer = canvasElement.querySelector(
      '[data-ui-component="ai-chat-composer"]',
    )!;
    const drawer = canvasElement.querySelector<HTMLElement>(
      '[data-ui-component="ai-chat-composer-drawer"]',
    )!;
    const body = composer.querySelector<HTMLElement>(
      ':scope > [data-ui-part="body"]',
    )!;
    expect(drawer.closest('[data-ui-component="ai-chat-composer"]')).toBe(
      composer,
    );
    expect(body.getBoundingClientRect().top).toBeLessThan(
      drawer.getBoundingClientRect().bottom,
    );
    expect(
      parseFloat(getComputedStyle(body).borderTopLeftRadius),
    ).toBeGreaterThan(0);
    await userEvent.click(collapse);
    await waitFor(() =>
      expect(
        body.getBoundingClientRect().top - drawer.getBoundingClientRect().top,
      ).toBeLessThanOrEqual(36),
    );
    await userEvent.click(
      canvas.getByRole("button", { name: "Expand Attachments" }),
    );
    await userEvent.click(
      canvas.getByRole("button", { name: "Remove attachment" }),
    );
    expect(canvas.getByText("1 files")).toBeVisible();
    expect(canvas.getByRole("textbox", { name: "Message" })).toHaveTextContent(
      "Retain this draft.",
    );
  }}
>
  {#snippet template()}
    <MarkdownComposer
      bind:value
      disabled
      interactiveDrawerWhenDisabled
      onSubmit={() => {}}
    >
      {#snippet drawer()}
        <ComposerDrawer bind:collapsed {count} label="Attachments">
          <span>{count} files</span><Button onclick={() => count--}
            >Remove attachment</Button
          >
        </ComposerDrawer>
      {/snippet}
    </MarkdownComposer>
  {/snippet}
</Story>
