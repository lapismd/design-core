import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

type StorybookEntry = {
  id: string;
  type?: string;
  name?: string;
  title?: string;
  tags?: string[];
};

type StorybookIndex = {
  entries: Record<string, StorybookEntry>;
};

function loadStoryIds(): string[] {
  const indexPath = resolve("storybook-static/index.json");
  const index = JSON.parse(readFileSync(indexPath, "utf8")) as StorybookIndex;
  return Object.values(index.entries)
    .filter((entry) => entry.type === "story")
    .filter((entry) => !(entry.tags ?? []).includes("skip-visual"))
    .map((entry) => entry.id)
    .sort();
}

const storyIds = loadStoryIds();

test.describe("Storybook visual baselines", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const style = document.createElement("style");
      style.textContent = `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
          caret-color: transparent !important;
        }
      `;
      document.documentElement.appendChild(style);
    });
  });

  for (const storyId of storyIds) {
    test(storyId, async ({ page }) => {
      await page.goto(`/iframe.html?id=${storyId}&viewMode=story`, {
        waitUntil: "networkidle",
      });

      const root = page.locator("#storybook-root");
      await expect(root).toBeVisible();
      await page.evaluate(async () => {
        if (document.fonts?.ready) {
          await document.fonts.ready;
        }
      });
      // Allow one frame for layout after fonts.
      await page.waitForTimeout(50);

      await expect(page).toHaveScreenshot(`${storyId}.png`, {
        fullPage: true,
      });
    });
  }
});
