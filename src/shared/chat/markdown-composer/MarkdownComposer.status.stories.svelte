<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, within } from "storybook/test";
  import MarkdownComposer from "./MarkdownComposer.svelte";
  import Fixture from "./MarkdownComposer.status.stories.fixture.svelte";
  import {
    AttachedStatus,
    ErrorMetadata,
  } from "./MarkdownComposer.example-sources.js";
  const { Story } = defineMeta({
    title: "Chat/Markdown Composer",
    component: MarkdownComposer,
    tags: ["visual-pending"],
    parameters: {
      docs: { source: { code: AttachedStatus, language: "tsx", type: "code" } },
    },
  });
  async function verifyAttachedStatus({
    canvas,
    canvasElement,
  }: {
    canvas: ReturnType<typeof within>;
    canvasElement: HTMLElement;
  }) {
    const editor = canvas.getByRole("textbox", { name: "Message" });
    const body = editor.closest('[data-ui-part="body"]')!;
    const banner = canvasElement.querySelector(
      '[data-ui-component="composer-status-banner"]',
    )!;
    const frame = getComputedStyle(body);
    expect(parseFloat(frame.borderTopWidth)).toBeGreaterThan(0);
    expect(frame.backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
    if (banner.getAttribute("data-status") === "error")
      expect(getComputedStyle(banner).color).not.toBe(frame.color);
    if (banner.getAttribute("data-position") === "top")
      expect(banner.getBoundingClientRect().bottom).toBeGreaterThan(
        body.getBoundingClientRect().top,
      );
    else
      expect(body.getBoundingClientRect().bottom).toBeGreaterThan(
        banner.getBoundingClientRect().top,
      );
    const documentBorder = frame.borderTopWidth;
    const documentBackground = frame.backgroundColor;
    await userEvent.click(
      canvas.getByRole("button", { name: "Switch presentation" }),
    );
    expect(getComputedStyle(body).borderTopWidth).toBe(documentBorder);
    expect(getComputedStyle(body).backgroundColor).toBe(documentBackground);
    expect(editor).toHaveTextContent("Retain this exact draft.");
    await userEvent.click(
      canvas.getByRole("button", { name: "Switch presentation" }),
    );
    await userEvent.click(canvas.getByRole("button", { name: "Clear status" }));
    expect(getComputedStyle(body).borderTopWidth).toBe("0px");
    expect(editor).toHaveTextContent("Retain this exact draft.");
  }
  async function verifyMetadata(
    context: Parameters<typeof verifyAttachedStatus>[0],
  ) {
    const metadata = context.canvas.getByRole("group", {
      name: "Draft metadata",
    });
    expect(metadata).toBeVisible();
    const banner = metadata.closest(
      '[data-ui-component="composer-status-banner"]',
    )!;
    expect(getComputedStyle(metadata).fontSize).toBe(
      getComputedStyle(banner).fontSize,
    );
    expect(getComputedStyle(metadata).lineHeight).toBe(
      getComputedStyle(banner).lineHeight,
    );
    expect(context.canvas.getAllByRole("alert")).toHaveLength(1);
    await verifyAttachedStatus(context);
  }
</script>

<Story name="Document attached warning" play={verifyAttachedStatus}>
  {#snippet template()}<Fixture />{/snippet}
</Story>
<Story name="Document attached error" play={verifyAttachedStatus}>
  {#snippet template()}<Fixture kind="error" />{/snippet}
</Story>

<Story
  name="Document attached warning dark"
  globals={{ colorMode: "dark" }}
  play={verifyAttachedStatus}
>
  {#snippet template()}<Fixture />{/snippet}
</Story>
<Story
  name="Document attached error dark"
  globals={{ colorMode: "dark" }}
  play={verifyAttachedStatus}
>
  {#snippet template()}<Fixture kind="error" />{/snippet}
</Story>
<Story name="Document attached top status" play={verifyAttachedStatus}>
  {#snippet template()}<Fixture position="top" />{/snippet}
</Story>

<Story
  name="Document error metadata"
  parameters={{
    docs: { source: { code: ErrorMetadata, language: "tsx", type: "code" } },
  }}
  play={verifyMetadata}
>
  {#snippet template()}<Fixture kind="error" custom />{/snippet}
</Story>
<Story
  name="Document error metadata dark"
  parameters={{
    docs: { source: { code: ErrorMetadata, language: "tsx", type: "code" } },
  }}
  globals={{ colorMode: "dark" }}
  play={verifyMetadata}
>
  {#snippet template()}<Fixture kind="error" custom />{/snippet}
</Story>

<Story
  name="Document error Lapis dark"
  globals={{ colorMode: "dark", theme: "lapis" }}
  play={verifyAttachedStatus}
>
  {#snippet template()}<Fixture kind="error" lapisDark />{/snippet}
</Story>
