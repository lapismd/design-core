import { expect, test } from "@playwright/test";

const story = (id: string) =>
  "/iframe.html?id=shadcn-data-display-canvas-table--" + id + "&viewMode=story";

test("rich row targets retain selection when synthetic pointers omit coordinates", async ({
  page,
}) => {
  await page.goto(story("large-rich-table"));
  const cell = page
    .getByRole("grid")
    .locator('[data-rich-row-id="3"][data-rich-column="0"]');
  await cell.dispatchEvent("pointerdown", {
    button: 0,
    pointerId: 1,
    clientX: 0,
    clientY: 0,
  });
  await expect(
    page.getByRole("checkbox", { name: "Select row 3", exact: true }),
  ).toBeChecked();
});

test("read-only row clicks use ordinary, modifier and range selection", async ({
  page,
}) => {
  await page.goto(story("large-rich-table"));
  await page.getByText("Record 3", { exact: true }).click();
  await expect(page.getByLabel("Selected IDs")).toHaveText("3");
  await page
    .getByText("Record 5", { exact: true })
    .click({ modifiers: ["ControlOrMeta"] });
  await expect(
    page.getByRole("checkbox", { name: "Select row 3", exact: true }),
  ).toBeChecked();
  await expect(
    page.getByRole("checkbox", { name: "Select row 5", exact: true }),
  ).toBeChecked();
  await page
    .getByText("Record 7", { exact: true })
    .click({ modifiers: ["Shift"] });
  await expect(page.getByLabel("Selected IDs")).toHaveText("5, 6, 7");
  await expect(page.locator('[data-active="true"]')).toHaveCount(0);
  await expect(page.getByRole("grid")).not.toHaveAttribute(
    "aria-activedescendant",
    /-cell-/,
  );
});

test("read-only keyboard navigation selects rows and leaves interactive controls alone", async ({
  page,
}) => {
  await page.goto(story("large-rich-table"));
  const grid = page.getByRole("grid");
  await grid.focus();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByLabel("Selected IDs")).toHaveText("1");
  await page.keyboard.press("ArrowDown");
  await expect(page.getByLabel("Selected IDs")).toHaveText("2");
  await page.keyboard.press("Shift+ArrowDown");
  await expect(page.getByLabel("Selected IDs")).toHaveText("2, 3");
  await expect(grid).toHaveAttribute("aria-activedescendant", /-row-2$/);
  await page.getByRole("button", { name: "Expand row 1", exact: true }).click();
  await expect(page.getByLabel("Selected IDs")).toHaveText("2, 3");
});
