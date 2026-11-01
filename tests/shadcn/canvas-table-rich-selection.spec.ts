import { expect, test } from "@playwright/test";

const story =
  "/iframe.html?id=shadcn-data-display-canvas-table--large-rich-table&viewMode=story";

test("rich row highlight scrolls with its cells before viewport repaint", async ({
  page,
}) => {
  await page.goto(story);
  const grid = page.getByRole("grid");
  await page
    .getByRole("checkbox", { name: "Select row 6", exact: true })
    .check();
  const row = grid
    .getByRole("row")
    .filter({ has: page.locator('[data-rich-row-id="6"]') });
  await expect(row).toHaveAttribute("aria-selected", "true");
  const selected = row.getByRole("gridcell").first();
  const unselected = grid.locator('[data-rich-row-id="7"]').first();
  const paint = (node: Element) => ({
    fill: getComputedStyle(node).backgroundColor,
    layer: getComputedStyle(node).backgroundImage,
  });
  await expect
    .poll(() => selected.evaluate(paint))
    .not.toEqual(await unselected.evaluate(paint));
  const frames = await grid.evaluate(async (node) => {
    const cell = node.querySelector<HTMLElement>('[data-rich-row-id="6"]')!;
    const initial = cell.getBoundingClientRect();
    const stop = (event: Event) => event.stopImmediatePropagation();
    node.addEventListener("scroll", stop, { capture: true });
    const frames = [];
    try {
      for (const top of [24, 70, 120, 36, 0]) {
        node.scrollTop = top;
        await new Promise<void>((resolve) =>
          requestAnimationFrame(() => resolve()),
        );
        const style = getComputedStyle(cell);
        frames.push({
          error:
            cell.getBoundingClientRect().top - initial.top + node.scrollTop,
          fill: style.backgroundColor,
          layer: style.backgroundImage,
          mounted: cell.isConnected,
        });
      }
    } finally {
      node.removeEventListener("scroll", stop, { capture: true });
      node.scrollTop = 0;
    }
    return frames;
  });
  for (const frame of frames) {
    expect(Math.abs(frame.error)).toBeLessThan(1);
    expect(frame.fill).not.toBe("rgba(0, 0, 0, 0)");
    expect(frame.layer).not.toBe("none");
    expect(frame.mounted).toBe(true);
  }
});

test("rich editable cells retain native selection and focus outlines", async ({
  page,
}) => {
  await page.goto(
    "/iframe.html?id=shadcn-data-display-canvas-table--editable-rich-table&viewMode=story",
  );
  const cell = page
    .getByRole("grid")
    .locator('[data-rich-row-id="6"][data-rich-column="1"]');
  await cell.click();
  await expect
    .poll(() => cell.evaluate((node) => getComputedStyle(node).boxShadow))
    .not.toBe("none");
});
