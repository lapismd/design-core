import { expect, test, type Locator, type Page } from "@playwright/test";
import { waitForVisualStoryFinished } from "../../packages/storybook-addon-visual-delta/src/playwright/readiness.js";

const storyId = "shell-app-shell--mobile-edge-panels";
const storyUrl = `/iframe.html?id=${storyId}&viewMode=story`;

async function openStory(page: Page): Promise<void> {
  await page.goto(storyUrl);
  await waitForVisualStoryFinished(page, storyId);
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await expect(page.locator("[data-shell-root]")).toHaveAttribute(
    "data-display-mode",
    "mobile",
  );
}

async function drag(
  page: Page,
  source: { x: number; y: number },
  target: { x: number; y: number },
): Promise<void> {
  await page.mouse.move(source.x, source.y);
  await page.mouse.down();
  await page.mouse.move(target.x, target.y, { steps: 12 });
}

async function touchPan(
  stage: Locator,
  source: { x: number; y: number },
  target: { x: number; y: number },
  pointerId: number,
  delayMs = 0,
): Promise<void> {
  await stage.evaluate(
    async (element, gesture) => {
      element.dispatchEvent(
        new PointerEvent("pointerdown", {
          bubbles: true,
          cancelable: true,
          pointerId: gesture.pointerId,
          pointerType: "touch",
          button: 0,
          clientX: gesture.source.x,
          clientY: gesture.source.y,
        }),
      );
      if (gesture.delayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, gesture.delayMs));
      }
      document.dispatchEvent(
        new PointerEvent("pointermove", {
          bubbles: true,
          cancelable: true,
          pointerId: gesture.pointerId,
          pointerType: "touch",
          button: 0,
          clientX: gesture.target.x,
          clientY: gesture.target.y,
        }),
      );
    },
    { source, target, pointerId, delayMs },
  );
}

async function endTouchPan(
  stage: Locator,
  point: { x: number; y: number },
  pointerId: number,
): Promise<void> {
  await stage.evaluate(
    (_element, gesture) => {
      document.dispatchEvent(
        new PointerEvent("pointerup", {
          bubbles: true,
          cancelable: true,
          pointerId: gesture.pointerId,
          pointerType: "touch",
          button: 0,
          clientX: gesture.point.x,
          clientY: gesture.point.y,
        }),
      );
    },
    { point, pointerId },
  );
}

test.describe("App Shell mobile pointer behavior", () => {
  test("horizontal pans reveal and dismiss both edge lanes", async ({
    page,
  }) => {
    await openStory(page);
    const root = page.locator("[data-shell-root]");
    const stage = page.locator('[data-ui-part="mobile-stage"]');
    const bounds = await stage.boundingBox();
    expect(bounds).not.toBeNull();
    if (!bounds) return;

    await touchPan(
      stage,
      { x: bounds.x + bounds.width * 0.45, y: bounds.y + bounds.height * 0.7 },
      { x: bounds.x + bounds.width * 0.5, y: bounds.y + bounds.height * 0.7 },
      30,
      180,
    );
    await endTouchPan(
      stage,
      {
        x: bounds.x + bounds.width * 0.5,
        y: bounds.y + bounds.height * 0.7,
      },
      30,
    );
    await expect(root).toHaveAttribute("data-mobile-stage", "main");

    await touchPan(
      stage,
      { x: bounds.x + bounds.width * 0.45, y: bounds.y + bounds.height * 0.7 },
      { x: bounds.x + bounds.width * 0.98, y: bounds.y + bounds.height * 0.7 },
      31,
    );
    await expect(root).toHaveAttribute("data-mobile-dragging", "true");
    await endTouchPan(
      stage,
      {
        x: bounds.x + bounds.width * 0.98,
        y: bounds.y + bounds.height * 0.7,
      },
      31,
    );
    await expect(root).toHaveAttribute("data-mobile-stage", "left");
    await expect(
      page.getByRole("complementary", { name: "Projects sidebar" }),
    ).toBeFocused();

    await touchPan(
      stage,
      { x: bounds.x + bounds.width * 0.45, y: bounds.y + bounds.height * 0.7 },
      { x: bounds.x + bounds.width * 0.02, y: bounds.y + bounds.height * 0.7 },
      33,
    );
    await endTouchPan(
      stage,
      {
        x: bounds.x + bounds.width * 0.02,
        y: bounds.y + bounds.height * 0.7,
      },
      33,
    );
    await expect(root).toHaveAttribute("data-mobile-stage", "main");

    await touchPan(
      stage,
      { x: bounds.x + bounds.width * 0.55, y: bounds.y + bounds.height * 0.7 },
      { x: bounds.x + bounds.width * 0.02, y: bounds.y + bounds.height * 0.7 },
      32,
    );
    await expect(root).toHaveAttribute("data-mobile-dragging", "true");
    await endTouchPan(
      stage,
      {
        x: bounds.x + bounds.width * 0.02,
        y: bounds.y + bounds.height * 0.7,
      },
      32,
    );
    await expect(root).toHaveAttribute("data-mobile-stage", "right");
    await expect(
      page.getByRole("complementary", { name: "Table of contents" }),
    ).toBeFocused();

    await page
      .locator('[data-ui-part="mobile-stage-dismiss"][data-side="right"]')
      .click();
    await expect(root).toHaveAttribute("data-mobile-stage", "main");
  });

  test("vertical intent leaves the main stage and scrolling available", async ({
    page,
  }) => {
    await openStory(page);
    const root = page.locator("[data-shell-root]");
    const stage = page.locator('[data-ui-part="mobile-stage"]');
    const bodyViewport = page
      .locator(
        '[data-ui-part="body-content"] [data-ui-part="scroll-area-viewport"]',
      )
      .first();
    const bounds = await bodyViewport.boundingBox();
    expect(bounds).not.toBeNull();
    if (!bounds) return;

    const before = await bodyViewport.evaluate((element) => element.scrollTop);
    await drag(
      page,
      { x: bounds.x + bounds.width * 0.6, y: bounds.y + bounds.height * 0.4 },
      { x: bounds.x + bounds.width * 0.62, y: bounds.y + bounds.height * 0.75 },
    );
    await page.mouse.up();

    await expect(root).toHaveAttribute("data-mobile-stage", "main");
    await expect(root).not.toHaveAttribute("data-mobile-dragging");
    await expect(stage).toHaveCSS("touch-action", "pan-y");
    await bodyViewport.evaluate((element) => {
      element.scrollTop += 120;
    });
    await expect
      .poll(() => bodyViewport.evaluate((element) => element.scrollTop))
      .toBeGreaterThan(before);
  });
});
