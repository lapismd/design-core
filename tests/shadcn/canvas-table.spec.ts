import { expect, test } from "@playwright/test";

const story = (name: string) =>
  "/iframe.html?id=shadcn-data-display-canvas-table--" +
  name +
  "&viewMode=story";

test("selects offscreen rows with bounded accessible rows and controls", async ({
  page,
}) => {
  await page.goto(story("large-dataset"));
  const grid = page.getByRole("grid");
  await expect(grid).toBeVisible();
  await expect(grid).toHaveAttribute("aria-rowcount", "10001");
  expect(await grid.getByRole("row").count()).toBeLessThan(30);
  expect(await page.getByRole("checkbox").count()).toBeLessThan(30);
  await page
    .getByRole("checkbox", { name: "Select all filtered rows" })
    .check();
  await expect(page.getByLabel("Selected rows", { exact: true })).toHaveText(
    "10000 selected",
  );
  await grid.evaluate((node) => {
    node.scrollTop = 140000;
  });
  await expect(grid).toHaveAttribute("data-scroll-top", "140000");
  expect(await grid.getByRole("row").count()).toBeLessThan(30);
  const control = page
    .locator("[data-row-id='row-5001']")
    .getByRole("checkbox");
  await expect(control).toBeChecked();
  await control.focus();
  await grid.evaluate((node) => {
    node.scrollTop = 0;
  });
  await expect(grid).toBeFocused();
});

test("Space toggles a checkbox without opening a cell editor", async ({
  page,
}) => {
  await page.goto(story("basic"));
  await expect(page.getByRole("grid")).toBeVisible();
  await expect(page.getByRole("checkbox")).toHaveCount(0);
  // This story has checkboxes but no play function changing their state.
  await page.goto(story("checkboxes-only"));
  const checkbox = page.getByRole("checkbox", {
    name: "Select row 2",
    exact: true,
  });
  await checkbox.focus();
  await page.keyboard.press("Space");
  await expect(checkbox).toBeChecked();
  await expect(page.getByRole("textbox", { name: "Edit cell" })).toHaveCount(0);
  await expect(page.getByRole("grid")).toHaveAttribute(
    "data-gutter-width",
    "32",
  );
});

test("keeps the gutter and editor aligned during two-axis scrolling", async ({
  page,
}) => {
  await page.goto(story("wide-table"));
  const grid = page.getByRole("grid");
  await expect(grid).toBeVisible();
  const before = await page
    .getByRole("checkbox", { name: "Select row 2", exact: true })
    .boundingBox();
  await grid.evaluate((node) => {
    node.scrollLeft = 600;
  });
  await expect(grid).toHaveAttribute("data-scroll-left", "600");
  const after = await page
    .getByRole("checkbox", { name: "Select row 2", exact: true })
    .boundingBox();
  expect(after?.x).toBeCloseTo(before?.x ?? -1, 1);
  await page.getByRole("textbox", { name: "Cell address" }).fill("G2");
  await page.getByRole("textbox", { name: "Cell address" }).press("Enter");
  await grid.press("Enter");
  const editor = page.getByRole("textbox", { name: "Edit cell" });
  await expect(editor).toBeVisible();
  const gridBox = await grid.boundingBox();
  const editorBox = await editor.boundingBox();
  expect((editorBox?.x ?? 0) - (gridBox?.x ?? 0)).toBeCloseTo(200, 0);
  await editor.press("Escape");
  await expect(grid).toBeFocused();
});

test("resizes and autofits a column with real pointer input", async ({
  page,
}) => {
  await page.goto(story("basic"));
  const grid = page.getByRole("grid");
  await expect(grid).toBeVisible();
  const box = (await grid.boundingBox())!;
  await page.mouse.move(box.x + 48 + 150, box.y + 8);
  await page.mouse.down();
  await page.mouse.move(box.x + 48 + 210, box.y + 8);
  await page.mouse.up();
  await grid.press("ArrowDown");
  await grid.press("Enter");
  const editor = page.getByRole("textbox", { name: "Edit cell" });
  await expect(editor).toHaveCSS("width", "210px");
  await editor.press("Escape");
  await page.mouse.dblclick(box.x + 48 + 210, box.y + 8);
  await grid.press("Enter");
  await expect(editor).not.toHaveCSS("width", "210px");
});

test("dispatches context-menu cell commands without changing checkbox selection", async ({
  page,
}) => {
  await page.goto(story("checkboxes-only"));
  await page
    .getByRole("checkbox", { name: "Select row 2", exact: true })
    .check();
  const grid = page.getByRole("grid");
  const box = (await grid.boundingBox())!;
  await page.mouse.click(box.x + 80, box.y + 64, { button: "right" });
  await expect(
    page.getByRole("menuitem", { name: "Clear", exact: true }),
  ).toBeVisible();
  await page.getByRole("menuitem", { name: "Clear", exact: true }).click();
  await expect(page.getByLabel("First data value")).toHaveText("");
  await expect(
    page.getByRole("checkbox", { name: "Select row 2", exact: true }),
  ).toBeChecked();
});

test("renders independent instances and survives teardown in dark mode", async ({
  page,
}) => {
  const diagnostics: string[] = [];
  page.on("pageerror", (error) => diagnostics.push(error.message));
  await page.goto(story("independent-instances"));
  await expect(page.getByRole("grid")).toHaveCount(2);
  await page
    .getByRole("checkbox", { name: "Select row 2", exact: true })
    .first()
    .check();
  await expect(
    page.getByRole("checkbox", { name: "Select row 2", exact: true }).last(),
  ).not.toBeChecked();
  await page.evaluate(() => document.documentElement.classList.add("dark"));
  const colors = await page
    .locator("canvas")
    .first()
    .evaluate((canvas) => {
      const context = canvas.getContext("2d")!;
      return Array.from(
        context.getImageData(canvas.width - 10, canvas.height - 10, 1, 1).data,
      );
    });
  expect(colors[0]).toBeLessThan(160);
  await page.getByRole("button", { name: "Toggle mounted" }).first().click();
  await expect(page.getByRole("grid")).toHaveCount(1);
  await page.getByRole("button", { name: "Toggle mounted" }).first().click();
  await expect(page.getByRole("grid")).toHaveCount(2);
  expect(diagnostics).toEqual([]);
});
