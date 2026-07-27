import { expect, test, type Page } from "@playwright/test";

const docsUrl = (id: string) =>
  `/iframe.html?id=${encodeURIComponent(id)}&viewMode=docs`;

async function expectScrollableDocs(page: Page, id: string): Promise<void> {
  await page.goto(docsUrl(id));

  const docs = page.locator("#storybook-docs .sbdocs-content");
  await expect(docs).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(() => {
        const scrollingElement = document.scrollingElement;
        return scrollingElement
          ? scrollingElement.scrollHeight - scrollingElement.clientHeight
          : 0;
      }),
    )
    .toBeGreaterThan(0);

  await expect
    .poll(() => page.evaluate(() => getComputedStyle(document.body).overflowY))
    .not.toBe("hidden");

  await page.mouse.move(200, 400);
  await page.mouse.wheel(0, 700);
  await expect
    .poll(() => page.evaluate(() => document.scrollingElement?.scrollTop ?? 0))
    .toBeGreaterThan(0);
}

test.describe("Storybook Docs scrolling", () => {
  test("keeps long Shell documentation scrollable", async ({ page }) => {
    await expectScrollableDocs(page, "shell-app-shell--docs");
  });

  test("keeps documentation with embedded app shells scrollable", async ({
    page,
  }) => {
    await expectScrollableDocs(page, "workspace-plugins-f-mode--docs");
    await expect(page.locator(".ui-workspace-fmode-story")).not.toHaveCount(0);
  });
});
