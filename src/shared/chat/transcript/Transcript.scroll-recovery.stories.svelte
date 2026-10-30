<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor } from "storybook/test";
  import Transcript from "./Transcript.svelte";
  import Fixture from "./Transcript.scroll-recovery.stories.fixture.svelte";
  const { Story } = defineMeta({
    title: "Chat/Transcript",
    component: Transcript,
    tags: ["visual-pending", "!autodocs"],
  });
  async function verify({
    canvas,
    canvasElement,
  }: {
    canvas: ReturnType<typeof import("storybook/test").within>;
    canvasElement: HTMLElement;
  }) {
    const region = canvas.getByRole("region", {
      name: "Agent chat body",
    }) as HTMLElement;
    const viewport = region.querySelector<HTMLElement>(
      '[data-ui-part="scroll-area-viewport"]',
    )!;
    viewport.scrollTop = 0;
    const latest = await canvas.findByRole("button", {
      name: "Scroll to latest",
    });
    await userEvent.click(canvas.getByRole("button", { name: "Run session" }));
    await waitFor(() =>
      expect(latest).toHaveAccessibleName("Scroll to latest (session running)"),
    );
    expect(
      latest.querySelectorAll('[data-ui-part="activity-dot"]'),
    ).toHaveLength(3);
    const top = viewport.scrollTop;
    await userEvent.click(
      canvas.getByRole("button", { name: "Append response" }),
    );
    await waitFor(() => expect(viewport.scrollTop).toBe(top));
    const composer = canvas.getByRole("textbox", { name: "Message" });
    if (canvasElement.querySelector('[data-conversation-view="classic"]'))
      expect(latest.getBoundingClientRect().bottom).toBeLessThan(
        composer.getBoundingClientRect().top,
      );
    await userEvent.click(latest);
    await waitFor(() =>
      expect(
        viewport.scrollHeight - viewport.clientHeight - viewport.scrollTop,
      ).toBeLessThanOrEqual(8),
    );
    expect(composer).toHaveFocus();
    await userEvent.click(
      canvas.getByRole("button", { name: "Resize captured output" }),
    );
    await waitFor(() =>
      expect(
        viewport.scrollHeight - viewport.clientHeight - viewport.scrollTop,
      ).toBeLessThanOrEqual(8),
    );
    await waitFor(() =>
      expect(
        canvas.queryByRole("button", { name: /^Scroll to latest/ }),
      ).toBeNull(),
    );
    await userEvent.click(
      canvas.getByRole("button", { name: "Append response" }),
    );
    await waitFor(() =>
      expect(
        viewport.scrollHeight - viewport.clientHeight - viewport.scrollTop,
      ).toBeLessThanOrEqual(8),
    );
    viewport.scrollTop = 0;
    await canvas.findByRole("button", { name: /^Scroll to latest/ });
    await userEvent.click(
      canvas.getByRole("button", { name: "Finish session" }),
    );
    await waitFor(() =>
      expect(latest.querySelector('[data-ui-part="activity-dot"]')).toBeNull(),
    );
    expect(latest).toHaveAccessibleName("Scroll to latest");
  }
</script>

<Story name="Document scroll recovery" play={verify}>
  {#snippet template()}<Fixture view="document" />{/snippet}
</Story>
<Story name="Classic scroll recovery" play={verify}>
  {#snippet template()}<Fixture view="classic" />{/snippet}
</Story>
<Story name="Document delayed scroll recovery" play={verify}>
  {#snippet template()}<Fixture view="document" delayedScroll />{/snippet}
</Story>
<Story name="Classic delayed scroll recovery" play={verify}>
  {#snippet template()}<Fixture view="classic" delayedScroll />{/snippet}
</Story>
