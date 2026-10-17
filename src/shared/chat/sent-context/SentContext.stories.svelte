<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, within } from "storybook/test";
  import SentContext from "./SentContext.svelte";
  import Fixture from "./SentContext.stories.fixture.svelte";
  import { Basic, Acknowledgement } from "./SentContext.example-sources.js";
  const { Story } = defineMeta({
    title: "Chat/Sent Context",
    component: SentContext,
    tags: ["visual-pending"],
    parameters: {
      layout: "fullscreen",
      docs: { source: { code: Basic, language: "tsx", type: "code" } },
    },
  });
</script>

<Story name="Sent context above prompt"
  >{#snippet template()}<Fixture />{/snippet}</Story
>

<Story
  name="Queued context acknowledgement"
  parameters={{
    docs: { source: { code: Acknowledgement, language: "tsx", type: "code" } },
  }}
  play={async ({ canvas, canvasElement }) => {
    const article = canvas.getByRole("article", { name: "User message" });
    const inspector = article.querySelector(
      '[data-ui-component="sent-context"]',
    );
    const summary = canvas.getByRole("button", {
      name: "Queued context",
    });
    await expect(summary).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(summary);
    const nested = canvas.getByRole("button", {
      name: "<agent_context>",
    });
    await userEvent.click(nested);
    await userEvent.click(canvas.getByRole("button", { name: "<origin>" }));
    const heading = canvas.getByRole("heading", { name: "Captured task" });
    await expect(heading).toBeVisible();
    await expect(
      canvas.getByRole("link", { name: "safe links" }),
    ).toHaveProperty("href", "https://example.com/");
    await expect(
      canvas.queryByRole("button", { name: "<instructions>" }),
    ).toBeNull();
    await userEvent.click(
      canvas.getByRole("button", { name: "Acknowledge start" }),
    );
    await expect(summary).toHaveTextContent("Sent context");
    await expect(summary).toHaveAttribute("aria-expanded", "true");
    expect(article.querySelector('[data-ui-component="sent-context"]')).toBe(
      inspector,
    );
    expect(canvas.getByRole("button", { name: "<agent_context>" })).toBe(
      nested,
    );
    const toggle = canvas.getByRole("button", {
      name: "Show raw context",
    });
    toggle.focus();
    await userEvent.keyboard("{Enter}");
    await expect(toggle).toHaveFocus();
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    const raw = canvas.getByRole("region", {
      name: "Raw context",
    });
    await expect(raw).toHaveTextContent('"wireContext"');
    await expect(
      raw.querySelector('[data-ui-component="code-block"]'),
    ).toHaveAttribute("data-language", "json");
    await expect(heading).not.toBeVisible();
    await userEvent.click(summary);
    await userEvent.click(summary);
    const restored = canvas.getByRole("button", {
      name: "Show rendered context",
    });
    await expect(restored).toHaveAttribute("aria-pressed", "true");
    restored.focus();
    await userEvent.keyboard(" ");
    await expect(heading).toBeVisible();
    expect(canvas.getByRole("heading", { name: "Captured task" })).toBe(
      heading,
    );
    expect(
      inspector!.compareDocumentPosition(
        within(article).getByText("Please update the parser."),
      ) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).not.toBe(0);
    expect(
      canvasElement.querySelectorAll('[data-ui-component="sent-context"]'),
    ).toHaveLength(1);
  }}
>
  {#snippet template()}<Fixture
      initialDelivery="queued"
      acknowledge
    />{/snippet}
</Story>

<Story name="Unknown delivery"
  >{#snippet template()}<Fixture initialDelivery="unknown" />{/snippet}</Story
>
<Story name="Context not sent"
  >{#snippet template()}<Fixture initialDelivery="failed" />{/snippet}</Story
>
<Story name="Prepared context"
  >{#snippet template()}<Fixture initialDelivery="prepared" />{/snippet}</Story
>
<Story
  name="Empty context has no disclosure"
  play={async ({ canvasElement, canvas }) => {
    expect(
      canvasElement.querySelector('[data-ui-component="sent-context"]'),
    ).toBeNull();
    await expect(canvas.getByText("Please update the parser.")).toBeVisible();
  }}>{#snippet template()}<Fixture empty />{/snippet}</Story
>
<Story name="Narrow and scrollable"
  >{#snippet template()}<Fixture
      initialDelivery="unknown"
      narrow
      long
    />{/snippet}</Story
>
