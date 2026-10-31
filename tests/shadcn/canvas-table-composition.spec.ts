import { waitForVisualStoryFinished } from "@lapismd/storybook-addon-visual-delta/playwright";
import { expect, test } from "@playwright/test";
const story = (name: string) =>
  "/iframe.html?id=shadcn-data-display-canvas-table--" +
  name +
  "&viewMode=story";
test("virtualizes rich cells in both axes and aligns headers after scrolling and resize", async ({
  page,
}) => {
  await page.goto(story("large-rich-table"));
  const grid = page.getByRole("grid");
  await expect(grid).toHaveAttribute("aria-rowcount", "4001");
  expect(await grid.getByRole("gridcell").count()).toBeLessThan(300);
  await grid.evaluate((node) => {
    node.scrollLeft = 1200;
    node.scrollTop = 3600;
  });
  await expect(grid).toHaveAttribute("data-scroll-left", "1200");
  const header = grid.getByRole("columnheader").filter({ hasText: "Field 6" });
  const cell = grid.locator('[role="gridcell"][aria-colindex="7"]').first();
  await expect(header).toBeVisible();
  const first = await header.boundingBox(),
    data = await cell.boundingBox();
  expect(Math.abs(first!.x - data!.x)).toBeLessThan(2);
  const handle = header.locator("[data-canvas-resize]");
  const before = await header.boundingBox(),
    box = await handle.boundingBox();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + 10);
  await page.mouse.down();
  await page.mouse.move(box!.x + 45, box!.y + 10);
  await page.mouse.up();
  await expect
    .poll(async () => (await header.boundingBox())!.width)
    .toBeGreaterThan(before!.width + 20);
  expect(await grid.getByRole("gridcell").count()).toBeLessThan(300);
});
test("measures expanded rows and recovers focus when their content is removed", async ({
  page,
}) => {
  await page.goto(story("large-rich-table"));
  const grid = page.getByRole("grid");
  const second = grid.locator('[role="gridcell"][aria-colindex="1"]').nth(1);
  const before = (await second.boundingBox())!.y;
  await page.getByRole("button", { name: "Expand row 1", exact: true }).click();
  await expect(page.getByText("Details for Record 1")).toBeVisible();
  await expect
    .poll(async () => (await second.boundingBox())!.y)
    .toBeGreaterThan(before + 100);
  await page.getByRole("button", { name: "Close row details" }).click();
  await expect(grid).toBeFocused();
  await expect
    .poll(async () => Math.abs((await second.boundingBox())!.y - before))
    .toBeLessThan(2);
  await page.getByRole("button", { name: "Toggle table" }).click();
  await expect(grid).toHaveCount(0);
  await page.getByRole("button", { name: "Toggle table" }).click();
  await expect(page.getByRole("grid")).toBeVisible();
});
test("required single selection supports Space and survives page changes", async ({
  page,
}) => {
  await page.goto(story("single-required-selection"));
  await waitForVisualStoryFinished(
    page,
    "shadcn-data-display-canvas-table--single-required-selection",
  );
  const radio = page.getByRole("radio", { name: "Select row 3", exact: true });
  await radio.focus();
  await page.keyboard.press("Space");
  await expect(radio).toBeChecked();
  await page.keyboard.press("Space");
  await expect(radio).toBeChecked();
  await page.getByRole("button", { name: "Change page" }).click();
  await expect(page.getByLabel("Selected IDs")).toHaveText("3");
});
