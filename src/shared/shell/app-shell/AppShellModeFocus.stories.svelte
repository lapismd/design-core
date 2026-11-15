<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { page } from "vitest/browser";
  import { expect, userEvent, waitFor, within } from "storybook/test";
  import { AppShellRoot } from "./index.js";
  import Fixture from "./AppShellModeFocus.stories.fixture.svelte";
  const { Story } = defineMeta({
    title: "Shell/App Shell",
    component: AppShellRoot,
    tags: ["!autodocs", "visual-pending"],
    parameters: { layout: "fullscreen" },
  });
  async function mode(canvas: HTMLElement, value: string) {
    await waitFor(() =>
      expect(canvas.querySelector('[data-shell-root="true"]')).toHaveAttribute(
        "data-display-mode",
        value,
      ),
    );
  }
</script>

<Story
  name="Responsive mode preserves main editor focus"
  play={async ({ canvas, canvasElement }) => {
    try {
      await page.viewport(1280, 800);
      await mode(canvasElement, "desktop");
      const input = canvas.getByRole("textbox", { name: "Main draft" });
      await userEvent.clear(input);
      await userEvent.type(input, "Retained main draft");
      for (const [width, height, value] of [
        [390, 844, "mobile"],
        [1280, 800, "desktop"],
      ] as const) {
        await page.viewport(width, height);
        await mode(canvasElement, value);
        await expect(input).toHaveFocus();
        await expect(input).toHaveValue("Retained main draft");
      }
    } finally {
      await page.viewport(1280, 800);
    }
  }}>{#snippet template()}<Fixture />{/snippet}</Story
>

<Story
  name="Responsive mode preserves portalled dialog focus and return target"
  play={async ({ canvas, canvasElement }) => {
    const body = within(document.body);
    try {
      await page.viewport(390, 844);
      await mode(canvasElement, "mobile");
      const trigger = canvas.getByRole("button", { name: "Edit draft" });
      await userEvent.click(trigger);
      const dialog = await body.findByRole("dialog", { name: "Edit draft" });
      const input = within(dialog).getByRole("textbox", {
        name: "Dialog draft",
      });
      await userEvent.type(input, "Retained dialog draft");
      await page.viewport(1280, 800);
      await mode(canvasElement, "desktop");
      await expect(input).toHaveFocus();
      await expect(input).toHaveValue("Retained dialog draft");
      await userEvent.keyboard("{Escape}");
      await waitFor(() => expect(trigger).toHaveFocus());
      await waitFor(() =>
        expect(body.queryByRole("dialog", { name: "Edit draft" })).toBeNull(),
      );
    } finally {
      await userEvent.keyboard("{Escape}");
      await page.viewport(1280, 800);
    }
  }}>{#snippet template()}<Fixture />{/snippet}</Story
>
