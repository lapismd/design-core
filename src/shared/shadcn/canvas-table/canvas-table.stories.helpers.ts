import { expect, userEvent, waitFor, within } from "storybook/test";

type StoryContext = { canvasElement: HTMLElement };

export async function selectRows({ canvasElement }: StoryContext) {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("checkbox", { name: "Select row 2" }));
  await userEvent.click(canvas.getByRole("checkbox", { name: "Select row 4" }));
  await expect(canvas.getByLabelText("Selected rows")).toHaveTextContent(
    "2 selected",
  );
  await expect(
    canvas.getByRole("checkbox", { name: "Select all filtered rows" }),
  ).toHaveAttribute("aria-checked", "mixed");
  await userEvent.click(
    canvas.getByRole("checkbox", { name: "Select all filtered rows" }),
  );
  await expect(canvas.getByLabelText("Selected rows")).toHaveTextContent(
    "12 selected",
  );
}

export async function editCell({ canvasElement }: StoryContext) {
  const canvas = within(canvasElement);
  const grid = canvas.getByRole("grid");
  grid.focus();
  await userEvent.keyboard("{ArrowDown}{Enter}");
  const editor = await canvas.findByRole("textbox", { name: "Edit cell" });
  await userEvent.clear(editor);
  await userEvent.type(editor, "Changed{Enter}");
  await expect(canvas.getByLabelText("First data value")).toHaveTextContent(
    "Changed",
  );
  await userEvent.click(canvas.getByRole("button", { name: "Undo" }));
  await expect(canvas.getByLabelText("First data value")).toHaveTextContent(
    "Record 1",
  );
  await userEvent.click(canvas.getByRole("button", { name: "Redo" }));
  await expect(canvas.getByLabelText("First data value")).toHaveTextContent(
    "Changed",
  );
}

export async function filterRows({ canvasElement }: StoryContext) {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("checkbox", { name: "Select row 3" }));
  await userEvent.click(
    canvas.getByRole("button", { name: "Filter open rows" }),
  );
  await expect(
    canvas.queryByRole("checkbox", { name: "Select row 3" }),
  ).toBeNull();
  await userEvent.click(
    canvas.getByRole("checkbox", { name: "Select all filtered rows" }),
  );
  await expect(canvas.getByLabelText("Selected rows")).toHaveTextContent(
    "7 selected",
  );
  await userEvent.click(
    canvas.getByRole("checkbox", { name: "Select all filtered rows" }),
  );
  await expect(canvas.getByLabelText("Selected rows")).toHaveTextContent(
    "1 selected",
  );
}

export async function stableSelection({ canvasElement }: StoryContext) {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("checkbox", { name: "Select row 2" }));
  await userEvent.click(canvas.getByRole("button", { name: "Reverse rows" }));
  await expect(
    canvas.getByRole("checkbox", { name: "Select row 13" }),
  ).toBeChecked();
  await userEvent.click(
    canvas.getByRole("button", { name: "Remove selected externally" }),
  );
  await expect(canvas.getByLabelText("Selected rows")).toHaveTextContent(
    "0 selected",
  );
}

export async function resizeAndWrap({ canvasElement }: StoryContext) {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("button", { name: "Wrap text" }));
  await expect(
    canvas.getByRole("button", { name: "Wrap text" }),
  ).toHaveAttribute("aria-pressed", "true");
  await userEvent.click(canvas.getByRole("button", { name: "Column colours" }));
  await expect(
    canvas.getByRole("button", { name: "Column colours" }),
  ).toHaveAttribute("aria-pressed", "true");
  const address = canvas.getByRole("textbox", { name: "Cell address" });
  await userEvent.type(address, "B3{Enter}");
  await expect(address).toHaveValue("B3");
}

export async function teardown({ canvasElement }: StoryContext) {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("button", { name: "Toggle mounted" }));
  await waitFor(() => expect(canvas.queryByRole("grid")).toBeNull());
  await userEvent.click(canvas.getByRole("button", { name: "Toggle mounted" }));
  await expect(canvas.getByRole("grid")).toBeVisible();
}
