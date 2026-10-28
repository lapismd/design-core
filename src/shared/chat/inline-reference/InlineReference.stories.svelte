<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, waitFor, within } from "storybook/test";
  import InlineReference from "./InlineReference.svelte";
  import Fixture from "./InlineReference.stories.fixture.svelte";
  import { Basic, Paired } from "./InlineReference.example-sources.js";
  const { Story } = defineMeta({
    title: "Chat/Inline Reference",
    component: InlineReference,
    tags: ["visual-pending"],
    parameters: {
      docs: { source: { code: Basic, language: "tsx", type: "code" } },
    },
  });
</script>

<Story
  name="Basic"
  args={{
    reference: {
      id: "alex",
      kind: "person",
      label: "Alex Morgan",
      href: "/people/alex",
      avatar: { id: "alex", name: "Alex Morgan" },
    },
  }}
/>
<Story
  name="Paired composer and preview"
  parameters={{
    docs: { source: { code: Paired, language: "tsx", type: "code" } },
  }}
  play={async ({ canvas, userEvent }) => {
    const preview = canvas.getByRole("region", { name: "Reference preview" });
    await waitFor(() =>
      expect(
        preview.querySelectorAll('[data-ui-component="reference-chip"]'),
      ).toHaveLength(4),
    );
    const alex = preview.querySelector<HTMLElement>(
      '[data-ui-component="reference-chip"] .ui-reference-chip__target',
    )!;
    await userEvent.click(alex);
    await expect(canvas.getByTestId("reference-opened")).toHaveTextContent(
      "alex",
    );
    await expect(preview.querySelector('img[alt=":lapis:"]')).toBeVisible();
    for (const link of preview.querySelectorAll(".ui-reference-chip__target"))
      expect(getComputedStyle(link).textDecorationLine).toBe("none");
    expect(
      getComputedStyle(
        preview.querySelector('img[alt=":lapis:"]')!.parentElement!,
      ).display,
    ).toBe("inline-flex");
    await expect(preview.querySelector("blockquote")).toHaveTextContent(
      "Quoted source stays intact.",
    );
    await expect(preview.querySelector("table")).toHaveTextContent("Cell");
    await expect(
      canvas.getByRole("region", { name: "Reference composer" }),
    ).toHaveTextContent("Quoted source stays intact.");
    await expect(
      canvas
        .getByRole("region", { name: "Reference composer" })
        .querySelector("table"),
    ).toHaveTextContent("Cell");
    await expect(preview.querySelector("code")).toHaveTextContent(
      "host-person:alex;",
    );
  }}>{#snippet template()}<Fixture />{/snippet}</Story
>
<Story
  name="Host token serialization"
  parameters={{
    docs: { source: { code: Paired, language: "tsx", type: "code" } },
  }}>{#snippet template()}<Fixture legacy />{/snippet}</Story
>
<Story
  name="Removable author chips"
  parameters={{
    docs: { source: { code: Paired, language: "tsx", type: "code" } },
  }}
  play={async ({ canvas, userEvent }) => {
    const composer = within(
      canvas.getByRole("region", { name: "Reference composer" }),
    );
    const repository = composer
      .getByRole("button", { name: "Remove Lapis Desktop" })
      .closest('[data-ui-component="reference-chip"]')!;
    expect(repository).toHaveAttribute("data-appearance", "mention");
    const line = canvas
      .getByRole("region", { name: "Reference composer" })
      .querySelector(".cm-line")!;
    expect(
      canvas
        .getByRole("region", { name: "Reference composer" })
        .querySelector(".cm-lineNumbers"),
    ).toBeNull();
    expect(
      getComputedStyle(line.closest(".cm-editor")!)
        .getPropertyValue("--file-line-width")
        .trim(),
    ).toBe("100%");
    const checkboxes = canvas
      .getByRole("region", { name: "Reference composer" })
      .querySelectorAll('input[type="checkbox"]');
    expect(checkboxes).toHaveLength(2);
    for (const checkbox of checkboxes) {
      const scroller = checkbox.closest(".cm-scroller")!;
      expect(checkbox.getBoundingClientRect().left).toBeGreaterThanOrEqual(
        scroller.getBoundingClientRect().left,
      );
      expect(checkbox.closest(".cm-task-line")).toHaveClass(
        "indented-wrapped-line",
      );
    }
    const text = [...line.childNodes].find(
      (node) =>
        node.nodeType === Node.TEXT_NODE && node.textContent?.includes("Ask"),
    )!;
    const plainRange = document.createRange();
    plainRange.selectNodeContents(text);
    const bottom = plainRange.getBoundingClientRect().bottom;
    for (const label of line.querySelectorAll(".ui-reference-chip__label")) {
      const labelRange = document.createRange();
      labelRange.selectNodeContents(label);
      expect(
        Math.abs(labelRange.getBoundingClientRect().bottom - bottom),
      ).toBeLessThanOrEqual(0.5);
    }
    const removes = await composer.findAllByRole("button", {
      name: "Remove Alex Morgan",
    });
    await userEvent.click(removes[0]!);
    await expect(canvas.getByTestId("reference-source")).not.toHaveTextContent(
      "[Alex Morgan]",
    );
    const preview = canvas.getByRole("region", { name: "Reference preview" });
    const chip = preview.querySelector<HTMLElement>(
      '[data-appearance="mention"]',
    )!;
    await expect(chip).toBeVisible();
    const label = chip.querySelector<HTMLElement>(".ui-reference-chip__label")!;
    expect(getComputedStyle(label).color).toBe(getComputedStyle(chip).color);
    expect(getComputedStyle(label).fontWeight).toBe("600");
    await expect(getComputedStyle(chip).backgroundColor).not.toBe(
      "rgba(0, 0, 0, 0)",
    );
  }}>{#snippet template()}<Fixture presentation="document" />{/snippet}</Story
>
<Story
  name="Author profile popover"
  parameters={{
    docs: { source: { code: Paired, language: "tsx", type: "code" } },
  }}
  play={async ({ canvas, userEvent }) => {
    const preview = within(
      canvas.getByRole("region", { name: "Reference preview" }),
    );
    const authors = await preview.findAllByRole("link", {
      name: /Alex Morgan/,
    });
    await userEvent.hover(authors[0]!);
    const card = await within(document.body).findByRole("group", {
      name: "About Alex Morgan",
    });
    await expect(card).toHaveTextContent("Repository principal");
    await expect(
      within(card).getByRole("button", { name: "Message" }),
    ).toBeDisabled();
  }}>{#snippet template()}<Fixture />{/snippet}</Story
>
