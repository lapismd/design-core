import { expect, test } from "@playwright/test";
import { waitForVisualStoryFinished } from "@lapismd/storybook-addon-visual-delta/playwright";
for (const name of [
  "nested-mobile-shell-inside-desktop-root",
  "nested-desktop-shell-inside-mobile-root",
])
  test(`${name} keeps its own interactive main surface`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const id = `shell-app-shell--${name}`;
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`/iframe.html?id=${id}&viewMode=story`, {
      waitUntil: "domcontentloaded",
    });
    await waitForVisualStoryFinished(page, id, 30000);
    const button = page.getByRole("button", {
      name: "Nested content action",
      exact: true,
    });
    for (const width of [1280, 760, 420]) {
      await page.setViewportSize({ width, height: 900 });
      await button.click();
      await expect(
        page.getByText("Nested action activated", { exact: true }),
      ).toBeVisible();
      const bounds = await page
        .locator('[data-ui-part="root"]')
        .nth(1)
        .evaluate((root) => {
          const shell = root.getBoundingClientRect(),
            main = root
              .querySelector('[data-ui-part="main"]')!
              .getBoundingClientRect();
          return {
            start: main.left - shell.left,
            end: shell.right - main.right,
          };
        });
      expect(bounds.start).toBeGreaterThanOrEqual(0);
      expect(bounds.end).toBeGreaterThanOrEqual(0);
    }
    expect(errors).toEqual([]);
  });
