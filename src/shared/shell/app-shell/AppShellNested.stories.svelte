<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor, within } from "storybook/test";
  import Fixture from "./AppShellNested.stories.fixture.svelte";
  const { Story } = defineMeta({
    title: "Shell/App Shell",
    component: Fixture,
    tags: ["!autodocs", "visual-pending"],
  });
  async function interact(canvasElement: HTMLElement) {
    const c = within(canvasElement),
      button = await c.findByRole("button", { name: "Nested content action" });
    await waitFor(() => {
      const rect = button.getBoundingClientRect();
      const hit = document.elementFromPoint(
        rect.x + rect.width / 2,
        rect.y + rect.height / 2,
      );
      expect(button.contains(hit)).toBe(true);
    });
    await userEvent.click(button);
    await expect(c.getByText("Nested action activated")).toBeVisible();
    const roots = canvasElement.querySelectorAll('[data-ui-part="root"]');
    const inner = roots[1]!,
      main = inner.querySelector('[data-ui-part="main"]')!;
    const a = inner.getBoundingClientRect(),
      b = main.getBoundingClientRect();
    expect(b.left).toBeGreaterThanOrEqual(a.left);
    expect(b.right).toBeLessThanOrEqual(a.right);
  }
</script>

<Story
  name="Nested mobile shell inside desktop root"
  play={async ({ canvasElement }) => interact(canvasElement)}
/>
<Story
  name="Nested desktop shell inside mobile root"
  args={{ outer: "mobile", inner: "desktop" }}
  play={async ({ canvasElement }) => interact(canvasElement)}
/>
