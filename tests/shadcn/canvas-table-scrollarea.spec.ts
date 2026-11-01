import { waitForVisualStoryFinished } from "@lapismd/storybook-addon-visual-delta/playwright";
import { expect, test } from "@playwright/test";

for (const strategy of ["styled", "native"] as const) {
  test(`CanvasTable uses one ${strategy} ScrollArea viewport`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    if (strategy === "native")
      await page.addInitScript(() => {
        const apply = () => {
          if (!document.documentElement) return false;
          document.documentElement.dataset.uiScrollStrategy = "native";
          return true;
        };
        if (!apply()) {
          const observer = new MutationObserver(() => {
            if (apply()) observer.disconnect();
          });
          observer.observe(document, { childList: true, subtree: true });
        }
      });
    await page.goto(
      "/iframe.html?id=shadcn-data-display-canvas-table--large-rich-table&viewMode=story",
    );
    await waitForVisualStoryFinished(
      page,
      "shadcn-data-display-canvas-table--large-rich-table",
    );
    const grid = page.getByRole("grid");
    await expect(grid).toHaveAttribute("data-ui-part", "scroll-area-viewport", {
      timeout: 3000,
    });
    const area = page.locator('[data-ui-part="scroll-area"]');
    await expect(area).toHaveAttribute("data-scroll-strategy", strategy);
    await expect(page.getByRole("grid")).toHaveCount(1);
    await grid.evaluate((node) => {
      node.scrollLeft = 1200;
      node.scrollTop = 3600;
    });
    await expect(grid).toHaveAttribute("data-scroll-left", "1200");
    await expect(grid).toHaveAttribute("data-scroll-top", "3600");
    await area.hover();
    const thumb = area.locator(
      '[data-ui-part="scroll-area-scrollbar"][data-orientation="vertical"] [data-ui-part="scroll-area-thumb"]',
    );
    await expect(thumb).toBeVisible();
    const thumbBounds = (await thumb.boundingBox())!;
    await page.mouse.move(
      thumbBounds.x + thumbBounds.width / 2,
      thumbBounds.y + thumbBounds.height / 2,
    );
    await page.mouse.down();
    await page.mouse.move(
      thumbBounds.x + thumbBounds.width / 2,
      thumbBounds.y + thumbBounds.height / 2 + 30,
    );
    await page.mouse.up();
    await expect
      .poll(async () => Number(await grid.getAttribute("data-scroll-top")))
      .toBeGreaterThan(3600);
    const header = grid
      .getByRole("columnheader")
      .filter({ hasText: "Field 6" });
    const cell = grid.locator('[role="gridcell"][aria-colindex="7"]').first();
    await expect(header).toBeVisible();
    expect(
      Math.abs((await header.boundingBox())!.x - (await cell.boundingBox())!.x),
    ).toBeLessThan(2);
    await grid.focus();
    await page.keyboard.press("ArrowDown");
    await expect(grid).toHaveAttribute("aria-activedescendant", /-row-\d+$/);
    const selected = grid.getByRole("row", { selected: true });
    await expect(selected).toHaveCount(1);
    await expect(grid).toHaveAttribute(
      "aria-activedescendant",
      (await selected.getAttribute("id"))!,
    );
    expect(await grid.getByRole("gridcell").count()).toBeLessThan(300);
    await page.getByRole("button", { name: "Toggle table" }).click();
    await expect(grid).toHaveCount(0);
    await expect(area).toHaveCount(0);
    await page.mouse.move(10, 10);
    expect(errors).toEqual([]);
  });
}
