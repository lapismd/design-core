import { expect, test, type Locator, type Page } from "@playwright/test";
import { waitForVisualStoryFinished } from "../../packages/storybook-addon-visual-delta/src/playwright/readiness.js";

const leadingStoryId =
  "shadcn-actions-swipe-item--leading-and-trailing-actions";
const fullSwipeStoryId =
  "shadcn-actions-swipe-item--full-swipe-commits-on-release";
const controlledStoryId =
  "shadcn-actions-swipe-item--controlled-and-disabled-states";

const storyUrl = (storyId: string) =>
  `/iframe.html?id=${encodeURIComponent(storyId)}&viewMode=story`;

async function openStory(page: Page, storyId: string): Promise<void> {
  await page.goto(storyUrl(storyId));
  try {
    await waitForVisualStoryFinished(page, storyId, 10_000);
  } catch {
    await page.reload();
    await waitForVisualStoryFinished(page, storyId);
  }
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
}

async function mouseDrag(
  page: Page,
  source: { x: number; y: number },
  target: { x: number; y: number },
): Promise<void> {
  await page.mouse.move(source.x, source.y);
  await page.mouse.down();
  await page.mouse.move(target.x, target.y, { steps: 12 });
  await page.mouse.up();
}

type TouchEventType =
  | "pointerdown"
  | "pointermove"
  | "pointerup"
  | "pointercancel";

async function dispatchTouch(
  page: Page,
  source: Locator | null,
  type: TouchEventType,
  point: { x: number; y: number },
  pointerId: number,
): Promise<void> {
  const options = { type, point, pointerId };
  if (source) {
    await source.evaluate((element, event) => {
      element.dispatchEvent(
        new PointerEvent(event.type, {
          bubbles: true,
          cancelable: true,
          pointerId: event.pointerId,
          pointerType: "touch",
          isPrimary: true,
          button: 0,
          clientX: event.point.x,
          clientY: event.point.y,
        }),
      );
    }, options);
    return;
  }

  await page.evaluate((event) => {
    document.dispatchEvent(
      new PointerEvent(event.type, {
        bubbles: true,
        cancelable: true,
        pointerId: event.pointerId,
        pointerType: "touch",
        isPrimary: true,
        button: 0,
        clientX: event.point.x,
        clientY: event.point.y,
      }),
    );
  }, options);
}

test.describe("Swipe Item pointer acceptance", () => {
  test("real mouse drags reveal both sides, clip content, suppress drag clicks, and dismiss", async ({
    page,
  }) => {
    await openStory(page, leadingStoryId);
    const root = page.locator('[data-ui-part="root"]');
    const content = page.locator('[data-ui-part="content"]');
    const startActions = page.locator(
      '[data-ui-part="actions"][data-side="start"]',
    );
    const endActions = page.locator(
      '[data-ui-part="actions"][data-side="end"]',
    );
    const contentBounds = await content.boundingBox();
    const rootBounds = await root.boundingBox();
    expect(contentBounds).not.toBeNull();
    expect(rootBounds).not.toBeNull();
    if (!contentBounds || !rootBounds) return;

    await content.evaluate((element) => {
      element.dataset.browserClickCount = "0";
      element.addEventListener("click", () => {
        element.dataset.browserClickCount = String(
          Number(element.dataset.browserClickCount ?? "0") + 1,
        );
      });
    });

    const centre = {
      x: contentBounds.x + contentBounds.width / 2,
      y: contentBounds.y + contentBounds.height / 2,
    };
    await mouseDrag(page, centre, { ...centre, x: centre.x + 120 });

    await expect(root).toHaveAttribute("data-open-side", "start");
    await expect(startActions).toHaveAttribute("aria-hidden", "false");
    await expect(content).toHaveAttribute("data-browser-click-count", "0");
    const shiftedStartBounds = await content.boundingBox();
    expect(shiftedStartBounds).not.toBeNull();
    expect(shiftedStartBounds!.x).toBeGreaterThan(rootBounds.x);
    expect(shiftedStartBounds!.x + shiftedStartBounds!.width).toBeGreaterThan(
      rootBounds.x + rootBounds.width,
    );

    await page.mouse.click(rootBounds.x + rootBounds.width / 2, centre.y);
    await expect(root).toHaveAttribute("data-state", "closed");
    await expect(content).toHaveAttribute("data-browser-click-count", "0");

    await mouseDrag(page, centre, { ...centre, x: centre.x - 120 });
    await expect(root).toHaveAttribute("data-open-side", "end");
    await expect(endActions).toHaveAttribute("aria-hidden", "false");
    await expect(content).toHaveAttribute("data-browser-click-count", "0");

    await page.mouse.click(760, 820);
    await expect(root).toHaveAttribute("data-state", "closed");

    await page.mouse.click(centre.x, centre.y);
    await expect(content).toHaveAttribute("data-browser-click-count", "1");
  });

  test("touch axis locking preserves vertical intent, ignored regions, and cancellation state", async ({
    page,
  }) => {
    await openStory(page, leadingStoryId);
    const root = page.locator('[data-ui-part="root"]');
    const content = page.locator('[data-ui-part="content"]');
    const ignored = page.getByTestId("gesture-ignore");
    const contentBounds = await content.boundingBox();
    const ignoredBounds = await ignored.boundingBox();
    expect(contentBounds).not.toBeNull();
    expect(ignoredBounds).not.toBeNull();
    if (!contentBounds || !ignoredBounds) return;

    const centre = {
      x: contentBounds.x + contentBounds.width / 2,
      y: contentBounds.y + contentBounds.height / 2,
    };
    await dispatchTouch(page, content, "pointerdown", centre, 101);
    await dispatchTouch(
      page,
      null,
      "pointermove",
      { x: centre.x + 3, y: centre.y + 80 },
      101,
    );
    await dispatchTouch(
      page,
      null,
      "pointerup",
      { x: centre.x + 3, y: centre.y + 80 },
      101,
    );
    await expect(root).toHaveAttribute("data-state", "closed");
    await expect(root).not.toHaveAttribute("data-dragging");
    await expect(content).toHaveCSS("touch-action", "pan-y");

    const ignoredPoint = {
      x: ignoredBounds.x + ignoredBounds.width / 2,
      y: ignoredBounds.y + ignoredBounds.height / 2,
    };
    await dispatchTouch(page, ignored, "pointerdown", ignoredPoint, 102);
    await dispatchTouch(
      page,
      null,
      "pointermove",
      { ...ignoredPoint, x: ignoredPoint.x - 180 },
      102,
    );
    await dispatchTouch(
      page,
      null,
      "pointerup",
      { ...ignoredPoint, x: ignoredPoint.x - 180 },
      102,
    );
    await expect(root).toHaveAttribute("data-state", "closed");

    await page.getByRole("button", { name: "Show edit actions" }).click();
    await expect(root).toHaveAttribute("data-open-side", "end");
    await dispatchTouch(page, content, "pointerdown", centre, 103);
    await dispatchTouch(
      page,
      null,
      "pointermove",
      { ...centre, x: centre.x + 90 },
      103,
    );
    await expect(root).toHaveAttribute("data-dragging", "true");
    await dispatchTouch(
      page,
      null,
      "pointercancel",
      { ...centre, x: centre.x + 90 },
      103,
    );
    await expect(root).toHaveAttribute("data-open-side", "end");
    await expect(root).not.toHaveAttribute("data-dragging");
  });

  test("full swipe commits once only on release and reversal cancels it", async ({
    page,
  }) => {
    await openStory(page, fullSwipeStoryId);
    const root = page.locator('[data-ui-part="root"]');
    const content = page.getByTestId("full-swipe-content");
    const status = page.getByRole("status");
    await page.getByRole("button", { name: "Reset full swipe" }).click();
    await expect(status).toHaveText("Waiting for full swipe");
    const bounds = await content.boundingBox();
    expect(bounds).not.toBeNull();
    if (!bounds) return;

    const start = {
      x: bounds.x + bounds.width * 0.7,
      y: bounds.y + bounds.height / 2,
    };
    const beyondThreshold = {
      x: start.x - bounds.width * 1.5,
      y: start.y,
    };

    await dispatchTouch(page, content, "pointerdown", start, 111);
    await dispatchTouch(page, null, "pointermove", beyondThreshold, 111);
    await expect(root).toHaveAttribute("data-armed-side", "end");
    await expect(status).toHaveText("Waiting for full swipe");
    await dispatchTouch(
      page,
      null,
      "pointermove",
      { ...start, x: start.x - 20 },
      111,
    );
    await dispatchTouch(
      page,
      null,
      "pointerup",
      { ...start, x: start.x - 20 },
      111,
    );
    await expect(status).toHaveText("Waiting for full swipe");
    await expect(root).toHaveAttribute("data-state", "closed");

    await dispatchTouch(page, content, "pointerdown", start, 112);
    await dispatchTouch(
      page,
      null,
      "pointermove",
      { ...start, x: start.x - 18 },
      112,
    );
    await dispatchTouch(
      page,
      null,
      "pointerup",
      { ...start, x: start.x - 18 },
      112,
    );
    await expect(status).toHaveText("Waiting for full swipe");

    await dispatchTouch(page, content, "pointerdown", start, 113);
    await dispatchTouch(page, null, "pointermove", beyondThreshold, 113);
    await expect(status).toHaveText("Waiting for full swipe");
    await dispatchTouch(page, null, "pointerup", beyondThreshold, 113);
    await expect(status).toHaveText("Committed end with touch (1)");
    await expect(root).toHaveAttribute("data-state", "closed");

    await dispatchTouch(page, null, "pointerup", beyondThreshold, 113);
    await expect(status).toHaveText("Committed end with touch (1)");
  });

  test("RTL maps physical drag to logical start, Escape restores focus, and disabled rows ignore drag", async ({
    page,
  }) => {
    await openStory(page, leadingStoryId);
    const root = page.locator('[data-ui-part="root"]');
    const content = page.locator('[data-ui-part="content"]');
    await root.evaluate((element) => {
      element.dir = "rtl";
    });
    await expect(root).toHaveCSS("direction", "rtl");
    const bounds = await content.boundingBox();
    expect(bounds).not.toBeNull();
    if (!bounds) return;

    const centre = {
      x: bounds.x + bounds.width / 2,
      y: bounds.y + bounds.height / 2,
    };
    await mouseDrag(page, centre, { ...centre, x: centre.x - 120 });
    await expect(root).toHaveAttribute("data-open-side", "start");

    const startAction = page.getByRole("button", { name: "Add star" });
    await startAction.focus();
    await page.keyboard.press("Escape");
    await expect(root).toHaveAttribute("data-state", "closed");
    await expect(
      page.getByRole("button", { name: "Show priority actions" }),
    ).toBeFocused();

    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(content).toHaveCSS("transition-duration", "0s");

    await openStory(page, controlledStoryId);
    const disabledRoot = page
      .locator('[data-ui-part="root"][data-disabled="true"]')
      .first();
    const disabledContent = disabledRoot.locator('[data-ui-part="content"]');
    const disabledBounds = await disabledContent.boundingBox();
    expect(disabledBounds).not.toBeNull();
    if (!disabledBounds) return;
    const disabledCentre = {
      x: disabledBounds.x + disabledBounds.width / 2,
      y: disabledBounds.y + disabledBounds.height / 2,
    };
    await mouseDrag(page, disabledCentre, {
      ...disabledCentre,
      x: disabledCentre.x - 180,
    });
    await expect(disabledRoot).toHaveAttribute("data-state", "closed");
    await expect(disabledRoot).not.toHaveAttribute("data-dragging");
  });
});
