import { expect, test } from "@playwright/test";

const story = (name: string) =>
  "/iframe.html?id=shadcn-data-display-canvas-table--" +
  name +
  "&viewMode=story";

test("keeps wrapped row controls, hit testing and cell editing aligned", async ({
  page,
}) => {
  await page.goto(story("checkboxes-only"));
  const grid = page.getByRole("grid");
  const first = page.locator("[data-row-id='row-1']");
  await expect(first).toHaveCSS("height", "28px");
  await page.getByRole("button", { name: "Wrap text", exact: true }).click();
  await expect
    .poll(async () => (await first.boundingBox())?.height ?? 0)
    .toBeGreaterThan(28);
  const row = (await first.boundingBox())!;
  const box = (await grid.boundingBox())!;
  await page.mouse.dblclick(box.x + 55, row.y + row.height - 6);
  const editor = page.getByRole("textbox", { name: "Edit cell" });
  await expect(editor).toBeVisible();
  expect((await editor.boundingBox())?.height).toBeCloseTo(row.height, 0);
  await editor.press("Escape");
  await expect(grid).toBeFocused();
});

test("header changes prune only the fixed row from checkbox selection", async ({
  page,
}) => {
  await page.goto(story("checkboxes-only"));
  await page
    .getByRole("checkbox", { name: "Select row 2", exact: true })
    .check();
  const header = page.getByRole("button", { name: "Header row", exact: true });
  await header.click();
  await page
    .getByRole("checkbox", { name: "Select row 1", exact: true })
    .check();
  await expect(page.getByLabel("Selected rows", { exact: true })).toHaveText(
    "2 selected",
  );
  await header.click();
  await expect(
    page.getByRole("checkbox", { name: "Select row 1", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("checkbox", { name: "Select row 2", exact: true }),
  ).toBeChecked();
  await expect(page.getByLabel("Selected rows", { exact: true })).toHaveText(
    "1 selected",
  );
});

test("cycles host sorting while checked row identity remains stable", async ({
  page,
}) => {
  await page.goto(story("checkboxes-only"));
  await page
    .getByRole("checkbox", { name: "Select row 2", exact: true })
    .check();
  const sort = page.getByRole("button", { name: "Sort Name", exact: true });
  await sort.click();
  await expect(sort).toHaveAttribute("aria-pressed", "true");
  await sort.click();
  await expect(page.getByLabel("First data value")).toHaveText("Record 12");
  await expect(
    page.getByRole("checkbox", { name: "Select row 13", exact: true }),
  ).toBeChecked();
  await sort.click();
  await expect(sort).toHaveAttribute("aria-pressed", "false");
  await expect(
    page.getByRole("checkbox", { name: "Select row 2", exact: true }),
  ).toBeChecked();
});

test("dispatches row and sort-button column menus through host callbacks", async ({
  page,
}) => {
  await page.goto(story("wide-table"));
  await page
    .getByRole("checkbox", { name: "Select row 2", exact: true })
    .check();
  const grid = page.getByRole("grid");
  const box = (await grid.boundingBox())!;
  await page.mouse.click(box.x + 12, box.y + 64, { button: "right" });
  await page.getByRole("menuitem", { name: "Move down", exact: true }).click();
  await expect(page.getByLabel("First data value")).toHaveText("Record 2");
  await expect(
    page.getByRole("checkbox", { name: "Select row 3", exact: true }),
  ).toBeChecked();
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await page
    .getByRole("button", { name: "Sort Name", exact: true })
    .click({ button: "right" });
  await expect(
    page.getByRole("menuitem", { name: "Move left", exact: true }),
  ).toBeDisabled();
  await page.getByRole("menuitem", { name: "Move right", exact: true }).click();
  await expect(page.getByLabel("First data value")).toHaveText("Open");
  await expect(
    page.getByRole("checkbox", { name: "Select row 2", exact: true }),
  ).toBeChecked();
});

test("sort controls track horizontal scrolling in the next frame", async ({
  page,
}) => {
  await page.goto(story("wide-table"));
  const grid = page.getByRole("grid");
  const sort = page.getByRole("button", { name: "Sort Name", exact: true });
  await expect(sort).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  const before = (await sort.boundingBox())!;
  await grid.evaluate(async (node) => {
    const moved = new Promise((resolve) =>
      node.addEventListener("scroll", resolve, { once: true }),
    );
    node.scrollLeft = 40;
    await moved;
    await new Promise(requestAnimationFrame);
  });
  const after = (await sort.boundingBox())!;
  expect(Math.abs(after.x - (before.x - 40))).toBeLessThanOrEqual(1);
});

test("sort controls track column resizing in the next frame", async ({
  page,
}) => {
  await page.goto(story("wide-table"));
  const grid = page.getByRole("grid");
  const sort = page.getByRole("button", { name: "Sort Name", exact: true });
  await expect(sort).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  const before = (await sort.boundingBox())!;
  const box = (await grid.boundingBox())!;
  const boundary = before.x + before.width + 6;
  await page.mouse.move(boundary, box.y + 8);
  await page.mouse.down();
  await page.mouse.move(boundary + 60, box.y + 8);
  await page.evaluate(() => new Promise(requestAnimationFrame));
  const after = (await sort.boundingBox())!;
  await page.mouse.up();
  expect(Math.abs(after.x - (before.x + 60))).toBeLessThanOrEqual(1);
});

test("persists edits to initially empty wide-table columns", async ({
  page,
}) => {
  await page.goto(story("wide-table"));
  const address = page.getByRole("textbox", { name: "Cell address" });
  const grid = page.getByRole("grid");
  await address.fill("G2");
  await address.press("Enter");
  await grid.press("Enter");
  const editor = page.getByRole("textbox", { name: "Edit cell" });
  await editor.fill("Sparse edit");
  await editor.press("Enter");
  await address.fill("G2");
  await address.press("Enter");
  await grid.press("Enter");
  await expect(editor).toHaveValue("Sparse edit");
});

test("a body cell editor cannot cover the fixed header after scrolling", async ({
  page,
}) => {
  await page.goto(story("wide-table"));
  const grid = page.getByRole("grid");
  await grid.focus();
  await grid.press("ArrowDown");
  await grid.press("Enter");
  await expect(page.getByRole("textbox", { name: "Edit cell" })).toBeVisible();
  await grid.evaluate(async (node) => {
    const moved = new Promise((resolve) =>
      node.addEventListener("scroll", resolve, { once: true }),
    );
    node.scrollTop = 20;
    await moved;
    await new Promise(requestAnimationFrame);
  });
  const covered = await grid.evaluate((node) => {
    const box = node.getBoundingClientRect();
    return (
      document
        .elementFromPoint(
          box.x + Number(node.dataset.gutterWidth) + 10,
          box.y + 35,
        )
        ?.getAttribute("aria-label") === "Edit cell"
    );
  });
  expect(covered).toBe(false);
});

test("Tab reaches visible row checkboxes after virtual scrolling", async ({
  page,
}) => {
  await page.goto(story("large-dataset"));
  const grid = page.getByRole("grid");
  await grid.evaluate(async (node) => {
    const moved = new Promise((resolve) =>
      node.addEventListener("scroll", resolve, { once: true }),
    );
    node.scrollTop = 10000;
    await moved;
    await new Promise(requestAnimationFrame);
  });
  await page
    .getByRole("checkbox", { name: "Select all filtered rows" })
    .focus();
  await page.keyboard.press("Tab");
  const target = await page.evaluate(() => {
    const grid = document.querySelector("[role=grid]")!.getBoundingClientRect();
    const active = document.activeElement!;
    const box = active.getBoundingClientRect();
    return {
      role: active.getAttribute("role"),
      visible:
        box.y + box.height / 2 >= grid.y + 58 &&
        box.y + box.height / 2 <= grid.bottom - 8,
      scroll: document.querySelector(".canvas-table__body-checks")!.scrollTop,
    };
  });
  expect(target).toEqual({ role: "checkbox", visible: true, scroll: 0 });
});
