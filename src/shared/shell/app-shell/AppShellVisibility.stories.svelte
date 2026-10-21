<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor, within } from "storybook/test";
  import Fixture from "./AppShellVisibility.stories.fixture.svelte";

  const { Story } = defineMeta({
    title: "Shell/App Shell",
    component: Fixture,
    tags: ["!autodocs", "visual-pending"],
  });

  async function roundTrip(canvasElement: HTMLElement, closed: boolean) {
    const canvas = within(canvasElement);
    const sidebar = canvasElement.querySelector<HTMLElement>(
      '[aria-label="Visibility details"]',
    )!;
    const toggle = canvas.getByRole("button", {
      name: "Toggle consumer visibility",
    });
    const assertRestored = () => {
      expect(sidebar.dataset.state).toBe(closed ? "closed" : "expanded");
      expect(sidebar.hidden).toBe(closed);
      if (closed) expect(sidebar.getBoundingClientRect().width).toBe(0);
      else expect(sidebar.getBoundingClientRect().width).toBe(280);
    };
    await waitFor(assertRestored);
    await userEvent.click(toggle);
    await waitFor(() => expect(sidebar.hidden).toBe(true));
    await userEvent.click(toggle);
    await waitFor(assertRestored);
    const control = canvas.getByRole("button", {
      name: "Toggle visibility details",
    });
    await userEvent.click(control);
    await waitFor(() => expect(sidebar.hidden).toBe(!closed));
    await userEvent.click(control);
    await waitFor(assertRestored);
  }
</script>

<Story
  name="Closed sidebar retains zero width after consumer hide and show"
  play={async ({ canvasElement }) => roundTrip(canvasElement, true)}
/>
<Story
  name="Open sidebar retains its width after consumer hide and show"
  args={{ initiallyClosed: false }}
  play={async ({ canvasElement }) => roundTrip(canvasElement, false)}
/>
