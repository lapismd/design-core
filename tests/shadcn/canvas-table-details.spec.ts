import { expect, test } from "@playwright/test";

const url =
  "/iframe.html?id=shadcn-data-display-canvas-table--large-rich-table&viewMode=story";

test("uses compact disclosure controls and a readable record detail example", async ({
  page,
}) => {
  await page.goto(url);
  const button = page.getByRole("button", {
    name: "Expand row 1",
    exact: true,
  });
  await expect(button).toBeVisible();
  expect((await button.boundingBox())!.height).toBeLessThanOrEqual(24.5);
  await button.click();
  const details = page.locator('[data-canvas-detail="1"]');
  await expect(
    details.getByText("Account owner", { exact: true }),
  ).toBeVisible();
  await expect(details.getByText("Maya Chen", { exact: true })).toBeVisible();
  await expect(details.getByText("Next review", { exact: true })).toBeVisible();
  const font = await details.evaluate(
    (node) => getComputedStyle(node.firstElementChild!).fontFamily,
  );
  expect(font).not.toMatch(/mono/i);
});

test("expanded details stay anchored and mounted while scroll state is delayed", async ({
  page,
}) => {
  await page.goto(url);
  const grid = page.getByRole("grid");
  await page.getByRole("button", { name: "Expand row 1", exact: true }).click();
  const detail = page.locator('[data-canvas-detail="1"]');
  await expect(detail).toBeVisible();
  const frames = await grid.evaluate(async (node) => {
    const detail = node.querySelector<HTMLElement>('[data-canvas-detail="1"]')!;
    const initial = detail.getBoundingClientRect();
    const suppress = (event: Event) => event.stopImmediatePropagation();
    node.addEventListener("scroll", suppress, { capture: true });
    const frames = [];
    try {
      for (const [left, top] of [
        [100, 0],
        [450, 20],
        [1200, 40],
        [0, 0],
      ]) {
        node.scrollLeft = left!;
        node.scrollTop = top!;
        await new Promise<void>((resolve) =>
          requestAnimationFrame(() => resolve()),
        );
        const bounds = detail.getBoundingClientRect();
        frames.push({
          left: bounds.left - node.getBoundingClientRect().left,
          gutter: Number((node as HTMLElement).dataset.gutterWidth),
          verticalError: bounds.top - initial.top + node.scrollTop,
          heightChange: bounds.height - initial.height,
          mounted:
            detail.isConnected &&
            node.querySelector('[data-canvas-detail="1"]') === detail,
        });
      }
    } finally {
      node.removeEventListener("scroll", suppress, { capture: true });
      node.scrollLeft = 0;
      node.scrollTop = 0;
    }
    return frames;
  });
  for (const frame of frames) {
    expect(Math.abs(frame.left - frame.gutter)).toBeLessThan(1);
    expect(Math.abs(frame.verticalError)).toBeLessThan(1);
    expect(frame.heightChange).toBe(0);
    expect(frame.mounted).toBe(true);
  }
});
