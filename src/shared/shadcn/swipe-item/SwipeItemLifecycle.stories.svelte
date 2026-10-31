<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor } from "storybook/test";
  import * as SwipeItem from "./index.js";
  import Fixture from "./SwipeItemLifecycle.stories.fixture.svelte";

  const { Story } = defineMeta({
    title: "Shadcn/Actions/Swipe Item",
    component: SwipeItem.Root,
    tags: ["!autodocs", "visual-pending"],
  });

  async function measurements(content: HTMLElement) {
    await waitFor(() => {
      expect(content.getBoundingClientRect().width).toBeGreaterThan(0);
      const actions = content
        .closest('[data-ui-part="root"]')
        ?.querySelector('[data-ui-part="actions"]');
      expect(actions?.getBoundingClientRect().width).toBeGreaterThan(0);
    });
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => resolve()),
    );
  }
</script>

<Story
  name="Action removes its root synchronously"
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Select row action" }),
    );
    await expect(canvas.queryByTestId("lifetime-item")).not.toBeInTheDocument();
    await expect(canvas.getByRole("status")).toHaveTextContent(/^action$/);
  }}>{#snippet template()}<Fixture />{/snippet}</Story
>

<Story
  name="Keyboard action removes its root synchronously"
  play={async ({ canvas }) => {
    canvas.getByRole("button", { name: "Select row action" }).focus();
    await userEvent.keyboard("{Enter}");
    await expect(canvas.queryByTestId("lifetime-item")).not.toBeInTheDocument();
    await expect(canvas.getByRole("status")).toHaveTextContent(/^action$/);
  }}>{#snippet template()}<Fixture />{/snippet}</Story
>

<Story
  name="Action removes itself before the pane closes"
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Select row action" }),
    );
    await expect(
      canvas.queryByRole("button", { name: "Select row action" }),
    ).not.toBeInTheDocument();
    await expect(canvas.getByTestId("lifetime-item")).toHaveAttribute(
      "data-state",
      "closed",
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      /^action,closed$/,
    );
  }}>{#snippet template()}<Fixture behavior="remove-action" />{/snippet}</Story
>

<Story
  name="Prevented selection keeps the pane open"
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Select row action" }),
    );
    await expect(canvas.getByTestId("lifetime-item")).toHaveAttribute(
      "data-state",
      "open",
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(/^action$/);
  }}>{#snippet template()}<Fixture behavior="prevent" />{/snippet}</Story
>

<Story
  name="Disabled close on select keeps the pane open"
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Select row action" }),
    );
    await expect(canvas.getByTestId("lifetime-item")).toHaveAttribute(
      "data-state",
      "open",
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(/^action$/);
  }}>{#snippet template()}<Fixture behavior="keep-open" />{/snippet}</Story
>

<Story
  name="Live selection closes after its handler"
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Select row action" }),
    );
    await expect(canvas.getByTestId("lifetime-item")).toHaveAttribute(
      "data-state",
      "closed",
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      /^action,closed$/,
    );
  }}>{#snippet template()}<Fixture behavior="live" />{/snippet}</Story
>

<Story
  name="Close notification may remove the root"
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Select row action" }),
    );
    await expect(canvas.queryByTestId("lifetime-item")).not.toBeInTheDocument();
    await expect(canvas.getByRole("status")).toHaveTextContent(
      /^action,closed$/,
    );
  }}
  >{#snippet template()}<Fixture
      behavior="close-removes-root"
    />{/snippet}</Story
>

<Story
  name="Full pointer swipe removes its root synchronously"
  play={async ({ canvas }) => {
    const content = canvas.getByTestId("lifetime-content");
    await measurements(content);
    const bounds = content.getBoundingClientRect();
    const x = bounds.left + bounds.width * 0.7;
    const y = bounds.top + bounds.height / 2;
    await userEvent.pointer([
      {
        keys: "[TouchA>]",
        target: content,
        coords: { clientX: x, clientY: y },
      },
      {
        pointerName: "TouchA",
        target: content,
        coords: { clientX: x - bounds.width * 1.5, clientY: y },
      },
      {
        keys: "[/TouchA]",
        target: content,
        coords: { clientX: x - bounds.width * 1.5, clientY: y },
      },
    ]);
    await waitFor(() =>
      expect(canvas.queryByTestId("lifetime-item")).not.toBeInTheDocument(),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(/^full:touch$/);
  }}>{#snippet template()}<Fixture behavior="full-pointer" />{/snippet}</Story
>

<Story
  name="Full wheel swipe removes its root synchronously"
  play={async ({ canvas }) => {
    const content = canvas.getByTestId("lifetime-content");
    await measurements(content);
    content.dispatchEvent(
      new WheelEvent("wheel", {
        deltaX: content.getBoundingClientRect().width * 2,
        deltaY: 0,
        bubbles: true,
        cancelable: true,
      }),
    );
    await waitFor(() =>
      expect(canvas.queryByTestId("lifetime-item")).not.toBeInTheDocument(),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(/^full:wheel$/);
  }}>{#snippet template()}<Fixture behavior="full-wheel" />{/snippet}</Story
>
