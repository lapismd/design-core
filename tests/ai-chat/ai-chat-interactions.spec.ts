import { expect, test } from "@playwright/test";
import { waitForVisualStoryFinished } from "@lapismd/storybook-addon-visual-delta/playwright";

const storyUrl = (id: string) =>
  `/iframe.html?id=${encodeURIComponent(id)}&viewMode=story`;

test.describe("AI Chat browser acceptance", () => {
  test.use({
    permissions: ["clipboard-read", "clipboard-write"],
    reducedMotion: "reduce",
  });

  test("uses native clipboard, contenteditable selection, keyboard deletion, and file drop", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("ai-chat-composer-input--browser-acceptance-surface"),
    );
    await waitForVisualStoryFinished(
      page,
      "ai-chat-composer-input--browser-acceptance-surface",
    );
    const input = page.getByRole("combobox", {
      name: "Browser acceptance composer",
    });
    await expect(input).toBeVisible();

    const clipboardText =
      "Clipboard content that is definitely longer than twenty characters.";
    await input.click();
    await page.evaluate(
      (text) => navigator.clipboard.writeText(text),
      clipboardText,
    );
    await page.keyboard.press(
      process.platform === "darwin" ? "Meta+V" : "Control+V",
    );

    const token = page.locator('[data-ui-part="inline-token"]');
    await expect(token).toHaveText("67 chars");
    await expect(page.locator("[data-browser-value]")).toContainText(
      clipboardText,
    );

    await input.evaluate((element) => {
      const selection = getSelection();
      const range = document.createRange();
      range.selectNodeContents(element);
      range.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(range);
    });
    await page.keyboard.press("Backspace");
    await expect(token).toHaveCount(0);
    await expect(page.locator("[data-browser-value]")).toHaveText("Empty");

    await input.evaluate((element) => {
      const transfer = new DataTransfer();
      transfer.items.add(
        new File(["browser drop"], "browser-brief.txt", {
          type: "text/plain",
        }),
      );
      element.dispatchEvent(
        new DragEvent("drop", {
          bubbles: true,
          cancelable: true,
          dataTransfer: transfer,
        }),
      );
    });
    await expect(page.locator("[data-browser-files]")).toHaveText(
      "drop: browser-brief.txt",
    );
  });

  test("uses real mouse-wheel scrolling and recovers to the latest message", async ({
    page,
  }) => {
    await page.goto(storyUrl("ai-chat-layout--browser-scroll-surface"));
    await waitForVisualStoryFinished(
      page,
      "ai-chat-layout--browser-scroll-surface",
    );
    const viewport = page.locator(
      '[data-ui-component="scroll-area"][data-ui-part="scroll-area-viewport"]',
    );
    await expect(viewport).toBeVisible();
    await expect
      .poll(() =>
        viewport.evaluate((element) =>
          Math.abs(
            element.scrollTop - (element.scrollHeight - element.clientHeight),
          ),
        ),
      )
      .toBeLessThanOrEqual(1);

    const initialTop = await viewport.evaluate((element) => element.scrollTop);
    const box = await viewport.boundingBox();
    expect(box).not.toBeNull();
    await page.mouse.move(
      box!.x + box!.width / 2,
      box!.y + Math.min(80, box!.height / 2),
    );
    await page.mouse.wheel(0, -700);
    await expect
      .poll(() => viewport.evaluate((element) => element.scrollTop))
      .toBeLessThan(initialTop);

    await page.getByRole("button", { name: "Scroll to latest" }).click();
    await expect
      .poll(() =>
        viewport.evaluate((element) =>
          Math.abs(
            element.scrollTop - (element.scrollHeight - element.clientHeight),
          ),
        ),
      )
      .toBeLessThanOrEqual(24);
    await expect(
      page.locator(
        '[data-ui-component="ai-chat-layout-scroll-button"][data-visible="false"]',
      ),
    ).toBeAttached();
  });
});
