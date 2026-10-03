<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor, within } from "storybook/test";
  import ControlledNotificationsStory from "./ControlledNotificationsStory.svelte";
  const { Story } = defineMeta({
    title: "Workspace/Plugins/Notifications/Controlled",
    component: ControlledNotificationsStory,
    tags: ["!autodocs", "visual-pending"],
  });
</script>

<Story
  name="Controlled severity dismissal and actions"
  play={async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    await expect(page.getByRole("alert")).toHaveTextContent("Request failed");
    await expect(page.getByText("Connection interrupted")).toBeVisible();
    await userEvent.click(page.getByRole("button", { name: "Retry request" }));
    await expect(page.getByText("Action: error:retry")).toBeVisible();
    await userEvent.hover(page.getByText("Saved", { exact: true }));
    await expect(page.getByText("Timer: paused")).toBeVisible();
    await userEvent.unhover(page.getByText("Saved", { exact: true }));
    await expect(page.getByText("Timer: running")).toBeVisible();
    await userEvent.click(page.getByRole("button", { name: "Dismiss Saved" }));
    await expect(
      page.queryByText("Saved", { exact: true }),
    ).not.toBeInTheDocument();
  }}
/>

<Story
  name="Modal keyboard access"
  play={async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      page.getByRole("button", { name: "Open notification dialog" }),
    );
    const dialog = await page.findByRole("dialog", {
      name: "Notification test",
    });
    await waitFor(() =>
      expect(dialog.querySelector("[data-notification-toasts]")).not.toBeNull(),
    );
    const dismiss = within(dialog).getByRole("button", {
      name: "Dismiss Request failed",
    });
    for (
      let index = 0;
      index < 12 && canvasElement.ownerDocument.activeElement !== dismiss;
      index++
    )
      await userEvent.tab();
    await expect(dismiss).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await waitFor(() =>
      expect(page.queryByText("Request failed")).not.toBeInTheDocument(),
    );
    await expect(dialog).toBeVisible();
    await userEvent.click(page.getByRole("button", { name: "Finish" }));
    await expect(page.getByText("Connection interrupted")).toBeVisible();
  }}
/>
