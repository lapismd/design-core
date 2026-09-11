<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor, within } from "storybook/test";
  import DialogFrame from "./DialogFrame.svelte";
  import Example from "./DialogFrameExample.svelte";
  import source from "./DialogFrameExample.svelte?raw";
  const { Story } = defineMeta({
    title: "UI Forms/Layout/Dialog Frame",
    component: DialogFrame,
    tags: ["visual-pending"],
    parameters: {
      docs: { source: { code: source, language: "tsx", type: "code" } },
    },
  });
  async function verify({
    canvas,
    canvasElement,
  }: {
    canvas: ReturnType<typeof within>;
    canvasElement: HTMLElement;
  }) {
    const trigger = canvas.getByRole("button", { name: "Edit record" });
    await userEvent.click(trigger);
    const dialog = within(canvasElement.ownerDocument.body).getByRole(
      "dialog",
      { name: "Edit record" },
    );
    const firstField = within(dialog).getByRole("textbox", { name: "Field 1" });
    await userEvent.type(firstField, "Updated record");
    expect(firstField).toBeInTheDocument();
    expect(firstField).toHaveFocus();
    expect(firstField).toHaveValue("Updated record");
    expect(within(dialog).getByText("Editing Updated record")).toBeVisible();
    const close = within(dialog).getByRole("button", {
      name: "Close",
    });
    expect(close.getBoundingClientRect().width).toBe(32);
    expect(
      close.querySelector("svg")!.getBoundingClientRect().width,
    ).toBeLessThanOrEqual(16);
    expect(parseFloat(getComputedStyle(close).borderRadius)).toBeGreaterThan(0);
    // Native CSS hover/focus is covered by tests/shadcn/dialog-frame.spec.ts.
    const footer = dialog.querySelector<HTMLElement>(
      '[data-ui-part="dialog-frame-footer"]',
    )!;
    const viewport = dialog.querySelector<HTMLElement>(
      '[data-ui-part="scroll-area-viewport"]',
    )!;
    expect(viewport.scrollHeight).toBeGreaterThan(viewport.clientHeight);
    const top = footer.getBoundingClientRect().top;
    viewport.scrollTop = viewport.scrollHeight;
    await waitFor(() => expect(viewport.scrollTop).toBeGreaterThan(0));
    expect(footer.getBoundingClientRect().top).toBeCloseTo(top, 0);
    expect(dialog.getBoundingClientRect().right).toBeLessThanOrEqual(
      window.innerWidth - 15,
    );
    expect(dialog.getBoundingClientRect().bottom).toBeLessThanOrEqual(
      window.innerHeight - 15,
    );
    await userEvent.click(close);
    await waitFor(() => expect(trigger).toHaveFocus());
  }
</script>

<Story name="Pinned footer" play={verify}
  >{#snippet template()}<Example />{/snippet}</Story
>
<Story name="Dark" globals={{ colorMode: "dark" }} play={verify}
  >{#snippet template()}<Example />{/snippet}</Story
>

<Story name="Pointer surface">{#snippet template()}<Example />{/snippet}</Story>
