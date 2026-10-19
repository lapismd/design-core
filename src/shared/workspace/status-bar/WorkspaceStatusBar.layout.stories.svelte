<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor, within } from "storybook/test";
  import WorkspaceStatusBar from "./WorkspaceStatusBar.svelte";
  import StatusFooterStory from "./StatusFooterStory.svelte";
  import * as exampleSources from "./WorkspaceStatusBar.example-sources.js";

  const { Story } = defineMeta({
    title: "Workspace/Components/Status Bar",
    component: WorkspaceStatusBar,
    tags: ["visual-pending"],
    parameters: {
      layout: "fullscreen",
      docs: {
        source: { code: exampleSources.Footer, language: "tsx", type: "code" },
      },
    },
  });
</script>

<Story name="Footer design review">
  {#snippet template()}<StatusFooterStory review={true} />{/snippet}
</Story>

<Story
  name="Stable full-width footer"
  play={async ({ canvas, canvasElement }) => {
    const root = canvasElement.querySelector<HTMLElement>(
      "[data-app-shell-root]",
    )!;
    const footer = canvas.getByLabelText("Workspace status");
    await waitFor(() =>
      expect(root).toHaveAttribute("data-app-shell-ready", "true"),
    );
    expect(footer.getBoundingClientRect().width).toBeCloseTo(
      root.getBoundingClientRect().width,
      0,
    );
    const initial = footer.getBoundingClientRect();
    await waitFor(() =>
      expect(canvas.getByRole("button", { name: "notes-vault" })).toBeVisible(),
    );
    const repository = canvas
      .getByRole("button", { name: "notes-vault" })
      .getBoundingClientRect();
    await userEvent.click(
      canvas.getByRole("button", { name: "Start short task" }),
    );
    const centre = footer.querySelector<HTMLElement>(
      '[data-ui-part="center"]',
    )!;
    await expect(
      within(footer).getByRole("button", { name: /Indexing notes/ }),
    ).toBeVisible();
    expect(centre.getBoundingClientRect().width).toBe(384);
    expect(
      centre.getBoundingClientRect().left +
        centre.getBoundingClientRect().width / 2,
    ).toBeCloseTo(
      root.getBoundingClientRect().left +
        root.getBoundingClientRect().width / 2,
      0,
    );
    await userEvent.click(
      canvas.getByRole("button", { name: "Use long message" }),
    );
    await expect(within(centre).getByRole("button")).toHaveTextContent(
      /Synchronizing/,
    );
    expect(footer.getBoundingClientRect().height).toBe(initial.height);
    expect(footer.getBoundingClientRect().width).toBe(initial.width);
    expect(
      canvas
        .getByRole("button", { name: "notes-vault" })
        .getBoundingClientRect().left,
    ).toBe(repository.left);
    expect(
      root
        .querySelector<HTMLElement>(
          '[data-ui-component="app-shell-desktop-layout"]',
        )!
        .getBoundingClientRect().bottom,
    ).toBeCloseTo(initial.top, 0);
    await userEvent.click(
      canvas.getByRole("button", { name: "Complete task" }),
    );
    await waitFor(() => expect(centre.querySelector("button")).toBeNull());
    expect(centre.getBoundingClientRect().width).toBe(384);
  }}
>
  {#snippet template()}<StatusFooterStory />{/snippet}
</Story>

<Story
  name="Overflow retains custom controls"
  play={async ({ canvas, canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await waitFor(() =>
      expect(
        canvas.getByRole("button", { name: "Custom status counter" }),
      ).toBeVisible(),
    );
    const original = canvas.getByRole("button", {
      name: "Custom status counter",
    });
    await expect(canvas.getByLabelText("Custom lifecycle")).toHaveTextContent(
      "1 mounts / 0 disposals",
    );
    await userEvent.click(
      canvas.getByRole("button", { name: "Constrain footer" }),
    );
    await waitFor(() =>
      expect(
        canvas.getByRole("button", { name: "More left status items" }),
      ).toBeVisible(),
    );
    const more = canvas.getByRole("button", { name: "More left status items" });
    await expect(more).toBeVisible();
    await userEvent.click(more);
    const counter = body.getByRole("button", { name: "Custom status counter" });
    await expect(counter).toBeVisible();
    expect(counter).toBe(original);
    await userEvent.click(counter);
    await expect(canvas.getByLabelText("Custom lifecycle")).toHaveTextContent(
      "1 mounts / 0 disposals / 1 clicks",
    );
    await userEvent.keyboard("{Escape}");
    await expect(more).toHaveFocus();
    await userEvent.click(more);
    await expect(
      body.getByRole("button", { name: "Custom status counter" }),
    ).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await userEvent.click(
      canvas.getByRole("button", { name: "Remove custom status" }),
    );
    await expect(canvas.getByLabelText("Custom lifecycle")).toHaveTextContent(
      "1 mounts / 1 disposals",
    );
  }}
>
  {#snippet template()}<StatusFooterStory />{/snippet}
</Story>

<Story
  name="Settings from collapsed-sidebar ribbon"
  play={async ({ canvas, canvasElement }) => {
    const ribbon = canvas.getByLabelText("left ribbon");
    const button = within(ribbon).getByRole("button", {
      name: "Settings",
    });
    await expect(button).toBeVisible();
    await userEvent.click(button);
    const body = within(canvasElement.ownerDocument.body);
    await expect(body.getByRole("dialog", { name: "Settings" })).toBeVisible();
    await userEvent.click(body.getByRole("button", { name: "Close settings" }));
    await expect(button).toHaveFocus();
  }}
>
  {#snippet template()}<StatusFooterStory />{/snippet}
</Story>

<Story
  name="Explicit shell composition"
  play={async ({ canvas, canvasElement }) => {
    const root = canvasElement.querySelector<HTMLElement>(
      "[data-app-shell-root]",
    )!;
    const footer = canvas.getByLabelText("Workspace status");
    expect(footer.getBoundingClientRect().width).toBeCloseTo(
      root.getBoundingClientRect().width,
      0,
    );
    expect(footer.getBoundingClientRect().bottom).toBeCloseTo(
      root.getBoundingClientRect().bottom,
      0,
    );
  }}
>
  {#snippet template()}<StatusFooterStory manual={true} />{/snippet}
</Story>
