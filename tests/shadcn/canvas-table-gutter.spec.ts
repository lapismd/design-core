import { expect, test } from "@playwright/test";

test("fixed gutter stays opaque above rich content before scroll handlers run", async ({
  page,
}) => {
  await page.goto(
    "/iframe.html?id=shadcn-data-display-canvas-table--large-rich-table&viewMode=story",
  );
  const grid = page.getByRole("grid");
  await expect(grid).toHaveAttribute("aria-rowcount", "4001");
  const gutter = page.locator("canvas.canvas-table__frozen-gutter");
  await expect(gutter).toHaveCount(1, { timeout: 3000 });
  await expect(gutter).toHaveAttribute("aria-hidden", "true");
  const frames = await grid.evaluate(async (node) => {
    const mask = node
      .closest(".canvas-table")!
      .querySelector<HTMLCanvasElement>("canvas.canvas-table__frozen-gutter")!;
    const suppress = (event: Event) => event.stopImmediatePropagation();
    node.addEventListener("scroll", suppress, { capture: true });
    const samples = [];
    try {
      for (const left of [120, 340, 800, 1400, 2200, 600, 0]) {
        node.scrollLeft = left;
        await new Promise<void>((resolve) =>
          requestAnimationFrame(() => resolve()),
        );
        const bounds = mask.getBoundingClientRect();
        const heading = node.querySelector('[role="columnheader"]')!;
        samples.push({
          left: bounds.left - node.getBoundingClientRect().left,
          width: bounds.width,
          expectedWidth: Number((node as HTMLElement).dataset.gutterWidth),
          alpha: mask.getContext("2d")!.getImageData(2, 2, 1, 1).data[3],
          aboveHeading:
            Number(getComputedStyle(mask).zIndex) >
            Number(getComputedStyle(heading.parentElement!).zIndex),
          staleScroll: (node as HTMLElement).dataset.scrollLeft,
        });
      }
    } finally {
      node.removeEventListener("scroll", suppress, { capture: true });
      node.scrollLeft = 0;
    }
    return samples;
  });
  for (const frame of frames) {
    expect(Math.abs(frame.left)).toBeLessThan(1);
    expect(frame.width).toBe(frame.expectedWidth);
    expect(frame.alpha).toBe(255);
    expect(frame.aboveHeading).toBe(true);
    expect(frame.staleScroll).toBe("0");
  }
});
