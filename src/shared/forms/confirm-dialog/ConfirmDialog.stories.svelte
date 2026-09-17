<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, fn, userEvent, waitFor, within } from "storybook/test";
  import ConfirmDialog from "./ConfirmDialog.svelte";
  import source from "./ConfirmDialogExample.svelte?raw";
  const { Story } = defineMeta({
    title: "UI Forms/Layout/Confirm Dialog",
    component: ConfirmDialog,
    tags: ["visual-pending"],
    parameters: {
      docs: {
        source: {
          code: source,
          language: "tsx",
          type: "code",
        },
      },
    },
  });
</script>

<Story
  name="Failure and retry"
  args={{
    open: true,
    title: "Remove record?",
    description: "This removes the selected record.",
    confirmLabel: "Remove",
    destructive: true,
    onConfirm: fn(async () => {
      throw new Error("Unable to remove record");
    }),
  }}
  play={async ({ canvasElement, args }) => {
    const body = within(canvasElement.ownerDocument.body);
    const dialog = body.getByRole("alertdialog");
    expect(dialog.getBoundingClientRect().width).toBeLessThanOrEqual(448);
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Remove" }),
    );
    await expect(within(dialog).getByRole("alert")).toHaveTextContent(
      "Unable to remove record",
    );
    let finish: (() => void) | undefined;
    (args.onConfirm as ReturnType<typeof fn>).mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Remove" }),
    );
    await expect(
      within(dialog).getByRole("button", { name: "Working…" }),
    ).toBeDisabled();
    await expect(
      within(dialog).getByRole("button", { name: "Cancel" }),
    ).toBeDisabled();
    await userEvent.keyboard("{Escape}");
    expect(dialog).toBeVisible();
    expect(args.onConfirm).toHaveBeenCalledTimes(2);
    finish?.();
    await waitFor(() =>
      expect(body.queryByRole("alertdialog")).not.toBeInTheDocument(),
    );
  }}
/>
<Story
  name="Cancel"
  args={{
    open: true,
    title: "Remove record?",
    description: "This removes the selected record.",
    onConfirm: fn(),
    onCancel: fn(),
  }}
  play={async ({ canvasElement, args }) => {
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(body.getByRole("button", { name: "Cancel" }));
    expect(args.onConfirm).not.toHaveBeenCalled();
    expect(args.onCancel).toHaveBeenCalledTimes(1);
  }}
/>
