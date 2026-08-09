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

async function expectEdgeToEdgeStory(
  page: Page,
  selector: string,
): Promise<void> {
  const story = page.locator(selector);
  const appShell = story.locator('[data-ui-component="app-shell"]').first();

  await expect(story).toBeVisible();
  await expect(appShell).toBeVisible();
  await expect(story).toHaveCSS("padding", "0px");

  const [storyBox, appShellBox] = await Promise.all([
    story.boundingBox(),
    appShell.boundingBox(),
  ]);
  expect(storyBox).not.toBeNull();
  expect(appShellBox).not.toBeNull();
  expect(Math.abs(appShellBox!.x - storyBox!.x)).toBeLessThan(1);
  expect(
    Math.abs(
      appShellBox!.x + appShellBox!.width - (storyBox!.x + storyBox!.width),
    ),
  ).toBeLessThan(1);
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

  test("renders Workspace application surfaces edge to edge", async ({
    page,
  }) => {
    await page.goto(docsUrl("workspace-demo-reusable-framework--docs"));
    await expectEdgeToEdgeStory(
      page,
      "#story--workspace-demo-reusable-framework--controller-and-persistence-interaction",
    );
  });
});
