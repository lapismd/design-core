import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  screenshotRelativePath,
  type StoryIndexEntry,
} from "../../scripts/ui-generator/visual/snapshot-paths.js";

type StorybookIndex = {
  entries: Record<string, StoryIndexEntry>;
};

function loadVisualStories(): StoryIndexEntry[] {
  const indexPath = resolve("storybook-static/index.json");
  const index = JSON.parse(readFileSync(indexPath, "utf8")) as StorybookIndex;
  return Object.values(index.entries)
    .filter((entry) => entry.type === "story")
    .filter((entry) => !(entry.tags ?? []).includes("skip-visual"))
    .sort((a, b) => a.id.localeCompare(b.id));
}

const stories = loadVisualStories();

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

  for (const story of stories) {
    const storyId = story.id;
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

      // Wait until Storybook is settled; open-menu stories must show the portal.
      await page
        .waitForFunction(
          (id) => {
            const preparing = document.querySelector(
              ".sb-show-preparing-story, .sb-show-preparing-docs",
            );
            if (preparing) return false;
            if (id.includes("open-menu") || id.includes("--open-")) {
              return Boolean(
                document.querySelector(
                  '[role="listbox"], [role="menu"], [data-state="open"]',
                ),
              );
            }
            if (id.includes("focused")) {
              return Boolean(
                document.querySelector(
                  ':focus-visible, [data-ui-part="input-group"]:has([data-slot="input-group-control"]:focus-visible)',
                ),
              );
            }
            return true;
          },
          storyId,
          { timeout: 5000 },
        )
        .catch(() => {
          /* stories without overlays still screenshot */
        });

      await page.waitForTimeout(100);

      // Pass path segments as an array — a string with "/" is flattened by Playwright.
      await expect(page).toHaveScreenshot(
        screenshotRelativePath(story).split("/"),
        {
          fullPage: true,
        },
      );
    });
  }
});
