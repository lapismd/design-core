import { expect, test } from "@playwright/test";

const storyUrl = (storyId: string) =>
  `/iframe.html?id=${storyId}&viewMode=story`;

test.describe("Hover Card pointer behavior", () => {
  test("keeps interactive content open through pointer handoff", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("shadcn-overlays-hover-card--interactive-preview"),
    );
    const trigger = page.getByRole("button", { name: "Inspect profile" });
    await trigger.hover();

    const details = page.getByRole("link", { name: "Open details" });
    await expect(details).toBeVisible();
    await details.hover();
    await page.waitForTimeout(350);
    await expect(details).toBeVisible();
  });

  test("is the topmost hit target beyond a constrained pane", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("shadcn-overlays-hover-card--constrained-overlay"),
    );
    const trigger = page.getByRole("button", { name: "Preview across pane" });
    await trigger.hover();

    const content = page.locator(
      '[data-ui-component="hover-card"][data-ui-part="hover-card-content"]',
    );
    await expect(content).toBeVisible();
    const contentBox = await content.boundingBox();
    const paneBox = await page
      .locator(".ui-hover-card-story__pane")
      .boundingBox();
    expect(contentBox).not.toBeNull();
    expect(paneBox).not.toBeNull();
    if (!contentBox || !paneBox) return;

    const x = Math.min(
      contentBox.x + contentBox.width - 8,
      Math.max(paneBox.x + paneBox.width + 8, contentBox.x + 8),
    );
    const y = contentBox.y + contentBox.height / 2;
    expect(x).toBeGreaterThan(paneBox.x + paneBox.width);
    expect(
      await page.evaluate(
        ({ x, y }) =>
          document
            .elementFromPoint(x, y)
            ?.closest('[data-ui-component="hover-card"]')
            ?.getAttribute("data-ui-part"),
        { x, y },
      ),
    ).toBe("hover-card-content");
  });
});
